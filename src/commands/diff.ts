import {Args} from '@oclif/core'

import BaseCommand from '../base-command.js'
import {SpinnerRunner} from '../components/spinner.js'
import {Github} from '../github.js'
import {Repos} from '../repos.js'
import {printTable} from '../table.js'

export default class Diff extends BaseCommand {
  public static args = {
    org: Args.string({description: 'Github org', required: true}),
  }
  public static description =
    'Show repositories in an org that are not cloned locally. Requires GH_TOKEN to be set in the environment.'
  public static examples = ['<%= config.bin %> <%= command.id %> my-github-org']

  public async run(): Promise<void> {
    const {args} = await this.parse(Diff)
    const repos = await new Repos().init()
    const github = new Github()
    const spinner = new SpinnerRunner('Fetching repositories')
    const remote = (await github.orgRepositories(args.org)).filter((r) => !repos.has(r.fullName))
    spinner.stop()
    printTable({
      columns: ['name', 'url'],
      data: Object.values(remote).map((r) => ({name: r.name, url: r.urls.html})),
      sort: {
        name: 'asc',
      },
    })
  }
}
