import {Args, Command, ux} from '@oclif/core'
import sortBy from 'lodash.sortby'

import {Github, Repository} from '../github.js'
import {Repos} from '../repos.js'

export default class Diff extends Command {
  public static args = {
    org: Args.string({description: 'Github org', required: true}),
  }

  public static description =
    'Show repositories in an org that are not cloned locally. Requires GH_TOKEN to be set in the environment.'

  public static examples = ['<%= config.bin %> <%= command.id %> my-github-org']

  public static flags = {}

  public async run(): Promise<void> {
    const {args} = await this.parse(Diff)
    const repos = await new Repos().init()
    const github = new Github()
    const remote = (await github.orgRepositories(args.org)).filter((r) => !repos.has(r.fullName))
    const columns = {
      name: {header: 'Name'},
      url: {get: (r: Repository): string => r.urls.html, header: 'URL'},
    }
    const sorted = sortBy(Object.values(remote), 'name')
    ux.table(sorted, columns, {title: `${args.org} Diff`})
  }
}
