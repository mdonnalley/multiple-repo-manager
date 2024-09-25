import {Args, Errors} from '@oclif/core'

import BaseCommand from '../base-command.js'
import {Repos} from '../repos.js'
import {printTable} from '../table.js'

export default class View extends BaseCommand {
  public static aliases = ['v']
  public static args = {
    repo: Args.string({description: 'Name of repository.', required: true}),
  }

  public static description = 'View a repository.'

  public async run(): Promise<void> {
    const {args} = await this.parse(View)
    const repos = await new Repos().init()
    const matches = repos.getMatches(args.repo)
    if (matches.length === 0) {
      throw new Errors.CLIError(`${args.repo} has not been added yet.`)
    } else if (matches.length === 1) {
      const data = [
        {key: 'name', value: matches[0].name},
        {key: 'organization', value: matches[0].org},
        {key: 'url', value: matches[0].urls.html},
        {key: 'location', value: matches[0].location},
      ]

      printTable({
        columns: ['key', 'value'],
        data,
        title: `Repository: ${matches[0].name}`,
      })
    } else {
      const data = Object.values(matches).map((r) => ({
        location: r.location,
        name: r.name,
        organization: r.org,
        url: r.urls.html,
      }))

      printTable({
        columns: ['name', 'organization', 'url', 'location'],
        data,
        sort: {
          name: 'asc',
        },
        title: 'Found Multiple Repositories:',
      })
    }
  }
}
