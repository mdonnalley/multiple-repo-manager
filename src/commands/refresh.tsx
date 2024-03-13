import {Command, Flags} from '@oclif/core'
import {render} from 'ink'
import React from 'react'

import {SimpleMessage, Spinner} from '../components/index.js'
import {Repos} from '../repos.js'

export class Refresh extends Command {
  public static description = 'Refresh the list of repositories and corresponding metadata.'
  public static flags = {
    org: Flags.string({
      char: 'o',
      description: 'Github org to refresh.',
      multiple: true,
    }),
  }

  public async run(): Promise<void> {
    render(<Spinner label="Refreshing repositories" />)
    const {flags} = await this.parse(Refresh)
    const repos = await new Repos().init()
    await repos.refresh(flags.org)
    render(<SimpleMessage message="Done." />)
  }
}
