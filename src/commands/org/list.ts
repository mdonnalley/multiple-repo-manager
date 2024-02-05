/* eslint-disable perfectionist/sort-objects */
import {Args, Command, ux} from '@oclif/core'
import sortBy from 'lodash.sortby'

import {Repos, Repository} from '../../repos.js'

export default class OrgList extends Command {
  public static aliases = ['list:org']
  public static args = {
    orgs: Args.string({description: 'Github org', required: true}),
  }

  public static description = 'Show all repositories in the org. Requires GH_TOKEN to be set in the environment.'

  public static examples = ['<%= config.bin %> <%= command.id %> my-github-org']

  public static flags = {}

  public static strict = false

  public async run(): Promise<void> {
    const {argv} = await this.parse(OrgList)
    const repos = await new Repos().init()

    const all = (await Promise.all((argv as string[]).map(async (org) => repos.fetch(org)))).flat()

    const columns = {
      name: {header: 'Name'},
      org: {header: 'Org'},
      url: {get: (r: Repository): string => r.urls.html, header: 'URL'},
      archived: {get: (r: Repository): string => (r.archived ? 'true' : ''), header: 'Archived'},
      private: {get: (r: Repository): string => (r.private ? 'true' : ''), header: 'Private'},
    }
    const sorted = sortBy(Object.values(all), ['org', 'name'])
    ux.table(sorted, columns, {title: 'Repositories'})
  }
}
