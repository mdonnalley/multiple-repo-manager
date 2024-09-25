import {Errors} from '@oclif/core'
import groupBy from 'lodash.groupby'
import terminalLink from 'terminal-link'

import BaseCommand from '../base-command.js'
import {Repos} from '../repos.js'
import {printTables} from '../table.js'

export default class List extends BaseCommand {
  public static aliases = ['ls']
  public static description = 'List all repositories.'

  public async run(): Promise<void> {
    const repositories = (await new Repos().init()).getContents()
    if (Object.keys(repositories).length === 0) {
      throw new Errors.CLIError('No repositories have been added yet.')
    }

    printTables(
      Object.entries(groupBy(repositories, 'org')).map(([org, repos]) => ({
        columns: ['name', 'location'] as const,
        data: Object.values(repos).map((r) => ({
          location: r.location,
          name: terminalLink(r.name, r.urls.html),
        })),
        sort: {
          name: 'asc',
        },
        title: `${org} Repositories`,
      })),
    )
  }
}
