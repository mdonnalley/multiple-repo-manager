import {Command, Errors, ux} from '@oclif/core'
import chalk from 'chalk'
import groupBy from 'lodash.groupby'
import sortBy from 'lodash.sortby'

import {Repository} from '../github.js'
import {Repos} from '../repos.js'

export default class List extends Command {
  public static aliases = ['ls']
  public static description = 'List all repositories.'
  public static flags = {}

  public async run(): Promise<void> {
    const repositories = (await new Repos().init()).getContents()
    if (Object.keys(repositories).length === 0) {
      throw new Errors.CLIError('No repositories have been added yet.')
    }

    const grouped = groupBy(repositories, 'org')
    for (const [org, repos] of Object.entries(grouped)) {
      const columns = {
        location: {get: (r: Repository): string => r.location, header: 'Location'},
        name: {header: 'Name'},
        url: {get: (r: Repository): string => r.urls.html, header: 'URL'},
      }
      const sorted = sortBy(Object.values(repos), 'name')
      ux.table(sorted, columns, {title: chalk.cyan.bold(`${org} Repositories`)})
      this.log()
    }
  }
}
