import {Args, Flags} from '@oclif/core'
import {render} from 'ink'
import path from 'node:path'
import {URL} from 'node:url'
import PQueue from 'p-queue'
import React from 'react'

import BaseCommand from '../base-command.js'
import {TaskTracker} from '../components/index.js'
import {Github} from '../github.js'
import {Repos} from '../repos.js'

type Props = {
  readonly concurrency?: number
  readonly dryRun: boolean
  readonly force: boolean
  readonly header: string
  readonly method: 'https' | 'ssh'
  readonly org: string
  readonly repo?: string
}

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

class CloneTaskTracker extends TaskTracker<Props> {
  async componentDidMount(): Promise<void> {
    const repos = await new Repos().init()
    const github = new Github()

    if (!this.props.repo) this.setState(() => ({waiting: 'Finding repositories to clone'}))

    const repositories = this.props.repo
      ? [await github.repository(this.props.org, this.props.repo)]
      : await github.orgRepositories(this.props.org)

    this.setState((state) => ({
      header: `${state.header} into ${path.join(repos.directory.name, this.props.org)}`,
      tasks: repositories.map((repo) => ({key: repo.fullName, name: repo.fullName, status: 'pending'})),
      waiting: false,
    }))
    const queue = new PQueue({concurrency: this.props.concurrency ?? repositories.length})
    for (const repo of repositories) {
      // eslint-disable-next-line no-void
      void queue.add(async () => {
        this.setState((state) => ({
          tasks: state.tasks.map((c) => (c.key === repo.fullName ? {...c, status: 'loading'} : c)),
        }))

        try {
          await (this.props.dryRun ? this.noop() : repos.clone(repo, this.props.method, this.props.force))
          this.setState((state) => ({
            tasks: state.tasks.map((c) => (c.key === repo.fullName ? {...c, status: 'success'} : c)),
          }))
        } catch {
          this.setState((state) => ({
            tasks: state.tasks.map((c) => (c.key === repo.fullName ? {...c, status: 'error'} : c)),
          }))
        }
      })
    }

    await queue.onIdle()
    if (!this.props.dryRun) await repos.write()
    this.setState(() => ({timeToComplete: Date.now() - this.startTime}))
  }
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
    concurrency: Flags.integer({
      char: 'c',
      description: 'Number of concurrent clones. Defaults to the number of repositories.',
      min: 1,
    }),
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
    render(
      <CloneTaskTracker
        concurrency={flags.concurrency}
        dryRun={flags['dry-run']}
        force={flags.force}
        header="Cloning repositories"
        method={flags.method}
        org={org}
        repo={repo}
      />,
    )
  }
}
