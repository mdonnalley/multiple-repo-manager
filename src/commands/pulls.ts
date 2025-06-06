import terminalLink from 'terminal-link'

import BaseCommand from '../base-command.js'
import {Github} from '../github.js'
import {Repos} from '../repos.js'
import {printTable} from '../table.js'

export default class Pulls extends BaseCommand {
  public static description =
    'List all your pull requests for added repositories. Requires GH_TOKEN to be set in the environment.'
  public static examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    const repos = await new Repos().init()
    const pulls = await new Github().userPulls({repos: repos.values()})

    const data = Object.values(pulls).map((p) => ({
      pr: terminalLink(`#${p.number}`, p.url),
      repo: p.repo,
      title: p.title,
    }))

    printTable({
      columns: ['repo', 'title', {key: 'pr', name: 'PR'}],
      data,
      sort: {
        repo: 'asc',
      },
      title: 'Pull Requests',
    })
  }
}
