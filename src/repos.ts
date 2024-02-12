import {Errors, ux} from '@oclif/core'
import makeDebug from 'debug'
import {mkdir} from 'node:fs/promises'
import path from 'node:path'

import {Aliases} from './aliases.js'
import {Config} from './config.js'
import {ConfigFile} from './config-file.js'
import {weeksToMs} from './date-utils.js'
import {Directory} from './directory.js'
import execSync from './exec-sync.js'
import {Github, Repository} from './github.js'

const debug = makeDebug('repos')

export type CloneMethod = 'https' | 'ssh'

export type RepoIndex = Record<string, Repository>

export class Repos extends ConfigFile<RepoIndex> {
  public static REFRESH_TIME = weeksToMs(1)
  public directory!: Directory
  private aliases!: Aliases
  private config!: Config

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

  public getReposOfOrg(org: string): Repository[] {
    return Object.values(this.getContents()).filter((r) => r.org === org)
  }

  public async init() {
    await super.init()
    this.config = await new Config().init()
    this.directory = await new Directory({name: this.config.get('directory')}).init()
    this.aliases = await new Aliases().init()

    if (this.needsRefresh()) await this.refresh()

    return this
  }

  public async refresh(orgs?: string[]): Promise<void> {
    debug('Repos JSON file', this.filepath)
    const github = new Github()
    const originalRepos = Object.keys(this.getContents())
    const orgsToRefresh = orgs ?? this.getOrgs()
    for (const org of orgsToRefresh) {
      try {
        debug(`Refreshing org ${org}`)
        const orgRepos = await github.orgRepositories(org)
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
}
