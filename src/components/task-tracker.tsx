import {ProgressBar} from '@inkjs/ui'
import spinners from 'cli-spinners'
import {Box, Newline, Text, useStdout} from 'ink'
import {Task, TaskList} from 'ink-task-list'
import groupBy from 'lodash.groupby'
import sortBy from 'lodash.sortby'
import React, {Component} from 'react'

import {msToSeconds, sleep} from '../date-utils.js'
import Spinner from './spinner.js'

type State = {
  header: string
  tasks: Array<{
    key: string
    name: string
    status: 'error' | 'loading' | 'pending' | 'success' | 'warning'
  }>
  timeToComplete?: number
  waiting: boolean | string
}

type Props = {header: string} & Record<string, unknown>

function Header(props: {readonly message?: string}): JSX.Element | undefined {
  if (!props.message) return
  return (
    <Box>
      <Text bold>{props.message}</Text>
      <Newline />
    </Box>
  )
}

function Tasks({tasks}: {readonly tasks: State['tasks']}): JSX.Element | undefined {
  const {stdout} = useStdout()
  if (tasks.length === 0) return
  const grouped = groupBy(tasks, 'status')
  const maxHeight = Math.floor(stdout.rows * 0.25)

  const loadingTasks = grouped.loading?.slice(0, maxHeight) ?? []
  const pendingTasks = grouped.pending?.slice(0, maxHeight - loadingTasks.length) ?? []
  const successTasks = grouped.success?.slice(0, maxHeight - loadingTasks.length - pendingTasks.length) ?? []
  const errorTasks =
    grouped.error?.slice(0, maxHeight - loadingTasks.length - pendingTasks.length - successTasks.length) ?? []

  const displayableTasks =
    loadingTasks.length + pendingTasks.length === 0
      ? tasks
      : sortBy([...successTasks, ...errorTasks, ...loadingTasks, ...pendingTasks], 'name')

  const successCount = grouped.success?.length || 0
  const errorCount = grouped.error?.length || 0
  const percentComplete = ((successCount + errorCount) / tasks.length) * 100
  return (
    <Box flexDirection="column">
      {percentComplete === 100 ? null : (
        <Box>
          <Text>
            Progress{' '}
            <Text color="dim">
              ({successCount + errorCount}/{tasks.length}){' '}
            </Text>
          </Text>
          <ProgressBar value={percentComplete} />
        </Box>
      )}

      <TaskList>
        {displayableTasks.map((task) => (
          <Box key={task.name}>
            <Task label={task.name} spinner={spinners.arc} state={task.status} />
          </Box>
        ))}
      </TaskList>
    </Box>
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

function Waiting({waiting}: {readonly waiting: boolean | string}): JSX.Element | undefined {
  if (!waiting) return
  return <Spinner label={typeof waiting === 'string' ? waiting : 'Collecting tasks'} />
}

export default class TaskTracker<P extends Props> extends Component<P, State> {
  protected startTime = Date.now()

  public state: State = {
    header: '',
    tasks: [],
    timeToComplete: undefined,
    waiting: true,
  }

  public constructor(props: P) {
    super(props)
    this.state.header = this.props.dryRun ? `[DRY RUN] ${this.props.header}` : this.props.header
  }

  protected async noop(): Promise<void> {
    return process.env.MULTI_DEMO_MODE ? sleep(1000) : Promise.resolve()
  }

  public render(): JSX.Element {
    return (
      <Box borderColor="cyan" borderStyle="round" flexDirection="column" padding={1}>
        <Header message={this.state.header} />
        <Waiting waiting={this.state.waiting} />
        <Tasks tasks={this.state.tasks} />
        <TimeToComplete timeToComplete={this.state.timeToComplete} />
      </Box>
    )
  }
}
