import {Args, Command, Flags, Interfaces} from '@oclif/core'
import spinners from 'cli-spinners'
import {Box, Newline, Text, render} from 'ink'
import {Task, TaskList} from 'ink-task-list'
import path from 'node:path'
import {URL} from 'node:url'
import PQueue from 'p-queue'
import React, {Component} from 'react'

import {Github} from '../github.js'
import {Repos} from '../repos.js'

type State = {
  header: string
  startTime: number
  tasks: Array<{
    name: string
    status: 'error' | 'loading' | 'pending' | 'success' | 'warning'
  }>
  timeToComplete?: number
}

type Props = {
  readonly args: Interfaces.InferredArgs<typeof Add.args>
  readonly flags: Interfaces.InferredFlags<typeof Add.flags>
}

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

function msToSeconds(ms: number, decimalPoints: number): number {
  return Number.parseFloat((ms / 1000).toFixed(decimalPoints))
}

function Header(props: {readonly message: string}): JSX.Element {
  return (
    <Box>
      <Text bold>{props.message}</Text>
      <Newline />
    </Box>
  )
}

function Tasks({tasks}: {readonly tasks: State['tasks']}): JSX.Element | undefined {
  if (tasks.length === 0) return
  return (
    <TaskList>
      {tasks.map((task) => (
        <Task key={task.name} label={task.name} spinner={spinners.arc} state={task.status} />
      ))}
    </TaskList>
  )
}

function TimeToComplete({timeToComplete}: {readonly timeToComplete: number | undefined}): JSX.Element | undefined {
  if (!timeToComplete) return
  return (
    <Box paddingTop={1}>
      <Text>Time to complete: {msToSeconds(timeToComplete, 2)}s</Text>
    </Box>
  )
}

export class CloneTasks extends Component<Props, State> {
  public state: State = {
    header: 'Cloning repositories',
    startTime: Date.now(),
    tasks: [],
    timeToComplete: undefined,
  }

  public constructor(props: Props) {
    super(props)
    if (props.flags['dry-run']) {
      this.state.header = `[DRY RUN] ${this.state.header}`
    }
  }

  async componentDidMount(): Promise<void> {
    const repos = await new Repos().init()
    const github = new Github()
    const info = parseOrgAndRepo(this.props.args.entity)
    const repositories = info.repo
      ? [await github.repository(info.org, info.repo)]
      : await github.orgRepositories(info.org)

    this.setState((state) => ({
      header: `${state.header} into ${path.join(repos.directory.name, info.org)}`,
      tasks: repositories.map((repo) => ({name: repo.name, status: 'pending'})),
    }))
    const queue = new PQueue({concurrency: this.props.flags.concurrency ?? repositories.length})

    for (const repo of repositories) {
      // eslint-disable-next-line no-void
      void queue.add(async () => {
        this.setState((state) => ({
          tasks: state.tasks.map((c) => (c.name === repo.name ? {...c, status: 'loading'} : c)),
        }))

        await (this.props.flags['dry-run']
          ? Promise.resolve()
          : repos.clone(repo, this.props.flags.method, this.props.flags.force))

        this.setState((state) => ({
          tasks: state.tasks.map((c) => (c.name === repo.name ? {...c, status: 'success'} : c)),
        }))
      })
    }

    await queue.onIdle()
    if (!this.props.flags['dry-run']) await repos.write()
    this.setState((state) => ({timeToComplete: Date.now() - state.startTime}))
  }

  public render(): JSX.Element {
    return (
      <Box borderColor="cyan" borderStyle="round" flexDirection="column" padding={1}>
        <Header message={this.state.header} />
        <Tasks tasks={this.state.tasks} />
        <TimeToComplete timeToComplete={this.state.timeToComplete} />
      </Box>
    )
  }
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
    render(<CloneTasks args={args} flags={flags} />)
  }
}
