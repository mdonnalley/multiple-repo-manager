import {Errors, ux} from '@oclif/core'
import makeDebug from 'debug'
import {mkdir} from 'node:fs/promises'
import path from 'node:path'
import {Octokit} from 'octokit'

import {Aliases} from './aliases.js'
import {Config} from './config.js'
import {ConfigFile} from './config-file.js'
import {weeksToMs} from './date-utils.js'
import {Directory} from './directory.js'
import execSync from './exec-sync.js'
import {getToken} from './util.js'

const debug = makeDebug('repos')

export type CloneMethod = 'https' | 'ssh'

export type Repository = {
  archived: boolean
  defaultBranch: string
  fullName: string
  location: string
  name: string
  org: string
  private: boolean
  updated: string
  urls: {
    clone: string
    html: string
    ssh: string
  }
}

export type RepositoryResponse = {
  archived: boolean
  clone_url: string
  default_branch: string
  full_name: string
  html_url: string
  name: string
  owner: {
    login: string
  }
  private: boolean
  ssh_url: string
  updated_at: string
}

export type RepoIndex = Record<string, Repository>

export type Pull = {
  created: string
  labels: string[]
  number: number
  repo: string
  title: string
  url: string
  user: string
}

export type Issue = {
  created: string
  labels: string[]
  number: number
  repo: string
  title: string
  updated: string
  url: string
  user: string
}

export class Repos extends ConfigFile<RepoIndex> {
  public static REFRESH_TIME = weeksToMs(1)
  public directory!: Directory
  private aliases!: Aliases
  private config!: Config
  private octokit!: Octokit

  public constructor() {
    super('repos.json')
  }

  public async clone(repo: Repository, method: CloneMethod = 'ssh'): Promise<void> {
    const orgDir = path.join(this.directory.name, repo.org)
    await mkdir(orgDir, {recursive: true})
    const url = method === 'ssh' ? repo.urls.ssh : repo.urls.clone
    execSync(`git -C ${orgDir} clone ${url}`, {silent: true})

    try {
      this.set(repo.fullName, repo)
    } catch {
      // do nothing
    }
  }

  public async fetch(org: string, repo?: null | string): Promise<Repository[]> {
    if (repo) {
      debug(`GET /repos/${org}/${repo}`)
      const response = await this.octokit.request('GET /repos/{owner}/{repo}', {owner: org, repo})
      return [this.transform(response.data)]
    }

    if (org === this.config.get('username')) {
      debug('GET /user/repos')
      const response = await this.octokit.paginate('GET /user/repos', {
        affiliation: 'owner',
      })
      return response.map((r) => this.transform(r as RepositoryResponse))
    }

    debug('GET /orgs/{org}/repos')
    const response = await this.octokit.paginate('GET /orgs/{org}/repos', {org})
    return response.map((r) => this.transform(r as RepositoryResponse))
  }

  public async fetchOrgIssues(org: string, opts?: {since?: string}): Promise<Issue[]> {
    const reposOfOrg = Object.values(this.getContents()).filter((r) => r.org === org && !r.archived)

    const all = await Promise.all(
      reposOfOrg.map(async (repo) => {
        const response = await this.octokit.paginate('GET /repos/{owner}/{repo}/issues', {
          owner: org,
          repo: repo.name,
          since: opts?.since,
          state: 'open',
        })
        const issues = response
          .filter((r) => !r.pull_request)
          .map(
            (r) =>
              ({
                created: r.created_at,
                labels: r.labels.map((l) => (typeof l === 'string' ? l : l.name)),
                number: r.number,
                repo: repo.name,
                title: r.title,
                updated: r.updated_at,
                url: r.html_url,
                user: r.user?.login,
              }) as Issue,
          )
        return issues
      }),
    )

    return all.filter((r) => r.length > 0).flat()
  }

  public async fetchOrgPulls(org: string): Promise<Pull[]> {
    const reposOfOrg = Object.values(this.getContents()).filter((r) => r.org === org && !r.archived)

    const all = await Promise.all(
      reposOfOrg.map(async (repo) => {
        const response = await this.octokit.paginate('GET /repos/{owner}/{repo}/pulls', {
          owner: org,
          repo: repo.name,
          state: 'open',
        })
        const pulls = response
          // eslint-disable-next-line arrow-body-style
          .map((r) => {
            return {
              created: r.created_at,
              labels: r.labels.map((l) => l.name),
              number: r.number,
              repo: repo.name,
              title: r.title,
              url: r.html_url,
              user: r.user?.login,
            } as Pull
          })
        return pulls
      }),
    )

    return all.filter((r) => r.length > 0).flat()
  }

  public async fetchPulls(options?: {author?: 'default' | string}): Promise<Pull[]> {
    const theAuthor = options?.author === 'default' ? this.config.get('username') : options?.author
    const author = theAuthor ? `author:${theAuthor}` : ''
    const response = await this.octokit.paginate('GET /search/issues', {
      q: `is:pr is:open ${author}`,
    })
    const pulls = response
      // eslint-disable-next-line arrow-body-style
      .map((r) => {
        return {
          created: r.created_at,
          labels: r.labels.map((l) => l.name),
          number: r.number,
          repo: r.repository_url.split('/').slice(-2).join('/'),
          title: r.title,
          url: r.html_url,
          user: r.user?.login,
        } as Pull
      })
      .filter((r) => this.has(r.repo))
    return pulls
  }

  public getMatches(nameOrFullNameOrAlias: string): Repository[] {
    const nameOrFullName = this.getNameOrFullName(nameOrFullNameOrAlias)
    if (this.has(nameOrFullName)) {
      return [super.get(nameOrFullName)]
    }

    const matches = this.values().filter((v) => v.name === nameOrFullName)
    return matches ?? []
  }

  public getNameOrFullName(nameOrFullNameOrAlias: string): string {
    return this.aliases.get(nameOrFullNameOrAlias) ?? nameOrFullNameOrAlias
  }

  public getOne(nameOrFullNameOrAlias: string): Repository {
    const nameOrFullName = this.getNameOrFullName(nameOrFullNameOrAlias)
    if (this.has(nameOrFullName)) {
      return super.get(nameOrFullName)
    }

    const matches = this.values().filter((v) => v.name === nameOrFullName)
    if (matches.length === 0) {
      throw new Errors.CLIError(`${nameOrFullName} has not been added yet.`)
    } else if (matches.length > 1) {
      const suggestions = matches.map((m) => m.fullName).join(', ')
      throw new Errors.CLIError(
        `Multiple repos found for ${nameOrFullName}. Please specify one of the following: ${suggestions}`,
      )
    } else {
      return matches[0]
    }
  }

  public getOrgs(): string[] {
    return [...new Set(Object.values(this.getContents()).map((r) => r.org))]
  }

  public async init() {
    await super.init()
    this.octokit = new Octokit({auth: getToken()})
    this.config = await new Config().init()
    this.directory = await new Directory({name: this.config.get('directory')}).init()
    this.aliases = await new Aliases().init()

    if (this.needsRefresh()) await this.refresh()

    return this
  }

  public async refresh(orgs?: string[]): Promise<void> {
    debug('Repos JSON file', this.filepath)
    const originalRepos = Object.keys(this.getContents())
    const orgsToRefresh = orgs ?? this.getOrgs()
    for (const org of orgsToRefresh) {
      try {
        debug(`Refreshing org ${org}`)
        const orgRepos = await this.fetch(org)
        for (const repo of orgRepos) {
          if (originalRepos.includes(repo.fullName)) {
            this.update(repo.fullName, repo)
            debug(`Updated ${org}/${repo.name}`)
          }
        }
      } catch (error) {
        ux.warn(`Failed to refresh org ${org}`)
        debug(error)
      }
    }

    await this.write()
  }

  private needsRefresh(): boolean {
    return Date.now() - this.stats.mtime.getTime() > Repos.REFRESH_TIME
  }

  private transform(repo: RepositoryResponse): Repository {
    return {
      archived: repo.archived,
      defaultBranch: repo.default_branch,
      fullName: repo.full_name,
      location: path.join(this.directory.name, repo.owner.login, repo.name),
      name: repo.name,
      org: repo.owner.login,
      private: repo.private,
      updated: repo.updated_at,
      urls: {
        clone: repo.clone_url,
        html: repo.html_url,
        ssh: repo.ssh_url,
      },
    }
  }
}
