import {Args, Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import path from 'node:path'
import {URL} from 'node:url'

import {Repos} from '../repos.js'

function parseOrgAndRepo(entity: string): {org: string; repo: null | string} {
  if (entity.startsWith('https://')) {
    const url = new URL(entity)
    const pathParts = url.pathname.split('/').filter(Boolean)
    // ex: https://github.com/my-org
    if (pathParts.length === 1) return {org: pathParts[0], repo: null}
    // ex: https://github.com/my-org/my-repo
    return {org: pathParts[0], repo: pathParts[1]}
  }

  const parts = entity.split('/').filter(Boolean)
  if (parts.length === 1) {
    // ex: my-org
    return {org: entity, repo: null}
  }

  // ex: my-org/my-repo
  return {org: parts[0], repo: parts[1]}
}

export default class Add extends Command {
  public static args = {
    entity: Args.string({
      description: 'Github org, repo, or url to add',
      required: true,
    }),
  }

  public static description = 'Add a github org or repo. Requires GH_TOKEN to be set in the environment.'

  public static examples = [
    {
      command: '<%= config.bin %> <%= command.id %> my-github-org',
      description: 'Add a github org',
    },
    {
      command: '<%= config.bin %> <%= command.id %> https://github.com/my-github-org',
      description: 'Add a github org by url',
    },
    {
      command: '<%= config.bin %> <%= command.id %> my-github-org/my-repo',
      description: 'Add a github repo by name',
    },
    {
      command: '<%= config.bin %> <%= command.id %> https://github.com/my-github-org/my-repo',
      description: 'Add a github repo by url',
    },
  ]

  public static flags = {
    method: Flags.option({
      default: 'ssh',
      description: 'Method to use for cloning.',
      options: ['ssh', 'https'] as const,
    })(),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Add)
    const repos = await Repos.create()

    const info = parseOrgAndRepo(args.entity)
    const repositories = await repos.fetch(info.org, info.repo)
    this.log(`Cloning repositories into ${path.join(repos.directory.name, info.org)}`)
    for (const repo of repositories) {
      this.log(`  * ${chalk.bold(repo.name)}`)
      await repos.clone(repo, flags.method)
    }

    await repos.write()
  }
}
