import {Args, Command, ux} from '@oclif/core'
import sortBy from 'lodash.sortby'

import {Repos, Repository} from '../../repos.js'

export default class ListOrg extends Command {
  public static args = {
    org: Args.string({description: 'Github org', required: true}),
  }

  public static description = 'Show all repositories in the org. Requires GH_TOKEN to be set in the environment.'

  public static examples = ['<%= config.bin %> <%= command.id %> my-github-org']

  public static flags = {}

  public static strict = false

  public async run(): Promise<void> {
    const {argv} = await this.parse(ListOrg)
    const repos = await Repos.create()
    const all: Repository[] = []
    for (const org of argv as string[]) {
      all.push(...(await repos.fetch(org)))
    }

    const columns = {
      archived: {header: 'Archived'},
      name: {header: 'Name'},
      org: {header: 'Org'},
      url: {get: (r: Repository): string => r.urls.html, header: 'URL'},
    }
    const sorted = sortBy(Object.values(all), ['org', 'name'])
    ux.table(sorted, columns, {title: 'Repositories'})
  }
}
