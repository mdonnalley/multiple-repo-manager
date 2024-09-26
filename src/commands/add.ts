import {Args, Flags} from '@oclif/core'
import {ParallelMultiStageOutput} from '@oclif/multi-stage-output'
import {URL} from 'node:url'

import BaseCommand from '../base-command.js'
import {SpinnerRunner} from '../components/spinner.js'
import {Github} from '../github.js'
import {Repos} from '../repos.js'

function parseOrgAndRepo(entity: string): {org: string; repo?: string} {
  if (entity.startsWith('https://')) {
    const url = new URL(entity)
    const pathParts = url.pathname.split('/').filter(Boolean)
    // ex: https://github.com/my-org
    if (pathParts.length === 1) return {org: pathParts[0]}
    // ex: https://github.com/my-org/my-repo
    return {org: pathParts[0], repo: pathParts[1]}
  }

  const parts = entity.split('/').filter(Boolean)
  if (parts.length === 1) {
    // ex: my-org
    return {org: entity}
  }

  // ex: my-org/my-repo
  return {org: parts[0], repo: parts[1]}
}

export default class Add extends BaseCommand {
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
    'dry-run': Flags.boolean({
      char: 'd',
      description: 'Print what would be done without doing it.',
    }),
    force: Flags.boolean({
      char: 'f',
      description: 'Force overwrite of existing repos.',
    }),
    method: Flags.option({
      default: 'ssh',
      description: 'Method to use for cloning.',
      options: ['ssh', 'https'] as const,
    })(),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Add)
    const {org, repo} = parseOrgAndRepo(args.entity)

    const spinner = new SpinnerRunner('Finding repositories to clone')

    const repos = await new Repos().init()
    const github = new Github()

    const repositories = repo ? [await github.repository(org, repo)] : await github.orgRepositories(org)

    spinner.stop()

    const mso = new ParallelMultiStageOutput({
      jsonEnabled: this.jsonEnabled(),
      stages: repositories.map((repo) => repo.fullName),
      title: flags['dry-run'] ? '[DRY RUN] Cloning Repositories' : 'Cloning Repositories',
    })

    await Promise.all(
      repositories.map(async (repo) => {
        mso.startStage(repo.fullName)
        try {
          if (!flags['dry-run']) {
            await repos.clone(repo, flags.method, flags.force)
          }
        } catch {
          mso.updateStage(repo.fullName, 'failed')
        }
      }),
    )
    mso.stop()

    if (!flags['dry-run']) await repos.write()
  }
}
