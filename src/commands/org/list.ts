import {Args, Flags} from '@oclif/core'
import terminalLink from 'terminal-link'

import BaseCommand from '../../base-command.js'
import {Github} from '../../github.js'
import {printTable} from '../../table.js'

export default class OrgList extends BaseCommand {
  public static aliases = ['list:org']
  public static args = {
    orgs: Args.string({description: 'Github org', required: true}),
  }

  public static description = 'Show all repositories in the org. Requires GH_TOKEN to be set in the environment.'
  public static examples = ['<%= config.bin %> <%= command.id %> my-github-org']
  public static flags = {
    'no-archived': Flags.boolean({description: 'Do not include archived repositories'}),
    'no-private': Flags.boolean({description: 'Do not include private repositories'}),
  }

  public static strict = false

  public async run(): Promise<void> {
    const {argv, flags} = await this.parse(OrgList)
    const github = new Github()

    const all = (await Promise.all((argv as string[]).map(async (org) => github.orgRepositories(org)))).flat()
    const filtered = all.filter((r) => {
      if (flags['no-archived'] && r.archived) return false
      if (flags['no-private'] && r.private) return false
      return true
    })
    const data = Object.values(filtered).map((r) => ({
      archived: r.archived ? 'true' : '',
      name: terminalLink(r.name, r.urls.html),
      private: r.private ? 'true' : '',
    }))

    printTable({
      columns: ['name', 'archived', 'private'],
      data,
      sort: {
        name: 'asc',
      },
      title: 'Repositories',
    })
  }
}
