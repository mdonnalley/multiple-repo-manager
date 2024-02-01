import {ux} from '@oclif/core'
import {Duration} from '@salesforce/kit'
import chalk from 'chalk'
import {mkdir} from 'node:fs/promises'
import path from 'node:path'
import {Octokit} from 'octokit'

import {Aliases} from './aliases.js'
import {Config} from './config.js'
import {ConfigFile} from './config-file.js'
import {Directory} from './directory.js'
import execSync from './exec-sync.js'
import {getToken} from './util.js'

export type CloneMethod = 'https' | 'ssh'

export type Repository = {
  archived: boolean
  defaultBranch: string
  fullName: string
  location: string
  name: string
  org: string
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
  ssh_url: string
  updated_at: string
}

export type RepoIndex = Record<string, Repository>

export type Pull = {
  number: number
  repo: string
  title: string
  url: string
  user: string
}

export class Repos extends ConfigFile<RepoIndex> {
  public static REFRESH_TIME = Duration.weeks(1)
  public directory!: Directory
  private aliases!: Aliases
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
      const response = await this.octokit.request('GET /repos/{owner}/{repo}', {owner: org, repo})
      return [this.transform(response.data)]
    }

    const response = await this.octokit.paginate('GET /orgs/{org}/repos', {org})
    return response.map((r) => this.transform(r as RepositoryResponse))
  }

  public async fetchPulls(): Promise<Pull[]> {
    const config = await Config.create()
    const response = await this.octokit.paginate('GET /search/issues', {
      q: `is:pr is:open author:${config.get('username')}`,
    })
    const pulls = response
      // eslint-disable-next-line arrow-body-style
      .map((r) => {
        return {
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
      throw new Error(`${nameOrFullName} has not been added yet.`)
    } else if (matches.length > 1) {
      const suggestions = matches.map((m) => m.fullName).join(', ')
      throw new Error(`Multiple repos found for ${nameOrFullName}. Please specify one of the following: ${suggestions}`)
    } else {
      return matches[0]
    }
  }

  public getOrgs(): string[] {
    return [...new Set(Object.values(this.getContents()).map((r) => r.org))]
  }

  protected async init(): Promise<void> {
    await super.init()
    this.octokit = new Octokit({auth: getToken()})
    const config = await Config.create()
    this.directory = await Directory.create({name: config.get('directory')})
    this.aliases = await Aliases.create()
    if (this.needsRefresh()) await this.refresh()
  }

  private needsRefresh(): boolean {
    return Date.now() - this.stats.mtime.getTime() > Repos.REFRESH_TIME.milliseconds
  }

  private async refresh(): Promise<void> {
    const originalRepos = Object.keys(this.getContents())
    const orgs = this.getOrgs()
    for (const org of orgs) {
      try {
        const orgRepos = await this.fetch(org)
        for (const repo of orgRepos) {
          if (originalRepos.includes(repo.fullName)) this.update(repo.fullName, repo)
        }
      } catch {
        ux.debug(`${chalk.yellow('Warning')}: Failed to refresh ${org}`)
      }
    }

    await this.write()
  }

  private transform(repo: RepositoryResponse): Repository {
    const transformed = {
      archived: repo.archived,
      defaultBranch: repo.default_branch,
      fullName: repo.full_name,
      location: path.join(this.directory.name, repo.owner.login, repo.name),
      name: repo.name,
      org: repo.owner.login,
      updated: repo.updated_at,
      urls: {
        clone: repo.clone_url,
        html: repo.html_url,
        ssh: repo.ssh_url,
      },
    }
    return transformed
  }
}
