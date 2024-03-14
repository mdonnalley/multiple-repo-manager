import {Errors} from '@oclif/core'
import makeDebug from 'debug'
import {mkdir, rm} from 'node:fs/promises'
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

  public static async needsRefresh(): Promise<boolean> {
    const repos = new Repos()
    await repos.initSuper()
    return Date.now() - Repos.REFRESH_TIME > repos.stats.mtime.getTime()
  }

  public async clone(repo: Repository, method: CloneMethod = 'ssh', force = false): Promise<void> {
    const orgDir = path.join(this.directory.name, repo.org)
    if (force) {
      await rm(orgDir, {force: true, recursive: true})
    }

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

  public getReposOfOrg(org: string, includeArchived?: boolean): Repository[] {
    return Object.values(this.getContents()).filter((r) => r.org === org && (includeArchived ? true : !r.archived))
  }

  public async init() {
    await this.initSuper()
    this.config = await new Config().init()
    this.directory = await new Directory({name: this.config.get('directory')}).init()
    this.aliases = await new Aliases().init()

    return this
  }

  public async refresh(org: string, noWrite?: boolean): Promise<void> {
    debug('Repos JSON file', this.filepath)
    const github = new Github()
    const originalRepos = Object.keys(this.getContents())
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
      debug(error)
    }

    if (!noWrite) await this.write()
  }

  private async initSuper() {
    await super.init()
  }
}
