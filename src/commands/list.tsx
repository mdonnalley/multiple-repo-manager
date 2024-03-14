import {Command} from '@oclif/core'
import {render} from 'ink'
import groupBy from 'lodash.groupby'
import sortBy from 'lodash.sortby'
import React from 'react'

import {Error, MultiLinkTable} from '../components/index.js'
import {Repos} from '../repos.js'

export default class List extends Command {
  public static aliases = ['ls']
  public static description = 'List all repositories.'
  public static flags = {}

  public async run(): Promise<void> {
    const repositories = (await new Repos().init()).getContents()
    if (Object.keys(repositories).length === 0) {
      render(<Error message="No repositories have been added yet.." />)
      this.exit(1)
    }

    const tables = Object.entries(groupBy(repositories, 'org')).map(([org, repos]) => ({
      config: {Name: 'url'},
      data: sortBy(Object.values(repos), 'name').map((r) => ({
        Name: r.name,
        location: r.location,
        url: r.urls.html,
      })),
      title: `${org} Repositories`,
    }))

    render(<MultiLinkTable tables={tables} />)
  }
}
