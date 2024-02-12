import {Command, ux} from '@oclif/core'
import sortBy from 'lodash.sortby'

import {Github, Pull} from '../github.js'
import {Repos} from '../repos.js'

export default class Pulls extends Command {
  public static description =
    'List all your pull requests for added repositories. Requires GH_TOKEN to be set in the environment.'

  public static examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    const repos = await new Repos().init()
    const pulls = await new Github().userPulls({repos: repos.values()})

    const columns = {
      repo: {get: (p: Pull): string => p.repo.split('/')[1], header: 'Repo'},
      title: {},
      url: {get: (p: Pull): string => p.url, header: 'URL'},
    }
    const sorted = sortBy(Object.values(pulls), 'repo')
    ux.table(sorted, columns, {title: 'Pull Requests'})
  }
}
