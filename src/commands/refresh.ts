import {Command, Flags, ux} from '@oclif/core'

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
    const {flags} = await this.parse(Refresh)
    ux.action.start('Refreshing')
    const repos = await new Repos().init()
    await repos.refresh(flags.org)
    ux.action.stop()
  }
}
