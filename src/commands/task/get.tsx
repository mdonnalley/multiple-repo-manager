import {Args, Command} from '@oclif/core'
import {render} from 'ink'
import React from 'react'

import {SimpleMessage} from '../../components/index.js'
import {Tasks} from '../../tasks.js'

export default class Get extends Command {
  public static args = {
    task: Args.string({description: 'Name of task to get', required: true}),
  }

  public static description = 'Return the value of a task.'

  public static flags = {}

  public async run(): Promise<void> {
    const {args} = await this.parse(Get)
    const tasks = await new Tasks().init()
    render(<SimpleMessage message={tasks.get(args.task)} />)
  }
}
