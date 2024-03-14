import {Args, Command, Flags} from '@oclif/core'
import {render} from 'ink'
import {spawn} from 'node:child_process'
import React from 'react'

import {Error, SimpleMessage} from '../../components/index.js'
import {Tasks} from '../../tasks.js'

export default class Task extends Command {
  public static args = {
    keyValue: Args.string({
      description: 'task=value',
      required: true,
    }),
  }

  public static description = 'Provide an empty to value to unset the task. This feature is not support on Windows.'
  public static examples = [
    {
      command: '<%= config.bin %> <%= command.id %> build=yarn build',
      description: 'Set a task',
    },
    {
      command:
        '<%= config.bin %> <%= command.id %> circle=multi exec . open https://app.circleci.com/pipelines/github/{repo.fullName}',
      description: 'Set a task that uses multi exec',
    },
    {
      command: '<%= config.bin %> <%= command.id %> build=',
      description: 'Unset a task',
    },
    {
      command: '<%= config.bin %> <%= command.id %> build --interactive',
      description: 'Set a task interactively',
    },
  ]

  public static flags = {
    interactive: Flags.boolean({
      default: false,
      description: 'Open a vim editor to add your task',
    }),
  }

  public static strict = false

  public static summary = 'Set or unset an executable task.'

  public async run(): Promise<void> {
    const {args, argv, flags} = await this.parse(Task)
    const {keyValue} = args

    if (!flags.interactive && !keyValue.includes('=')) {
      render(<Error message={`InvalidArg: The provided argument "${keyValue}" is not a valid key=value pair.`} />)
      this.exit(1)
    }

    const tasks = await new Tasks().init()
    const [task, firstPart] = keyValue.split('=')
    if (flags.interactive) {
      tasks.set(task, '')
      await tasks.write()
      spawn('vim', [tasks.filepath], {
        detached: true,
        stdio: 'inherit',
      })
      await tasks.write()
    } else {
      const executable = firstPart ? firstPart + ' ' + argv.splice(argv.indexOf(keyValue) + 1).join(' ') : null
      if (executable) {
        tasks.set(task, executable)
      } else {
        tasks.unset(task)
      }

      await tasks.write()
      render(<SimpleMessage message={`${task} was successfully ${executable ? 'created' : 'removed'}.`} />)
    }
  }
}
