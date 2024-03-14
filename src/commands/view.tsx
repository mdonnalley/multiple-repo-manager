/* eslint-disable perfectionist/sort-objects */
import {Args, Command} from '@oclif/core'
import {render} from 'ink'
import sortBy from 'lodash.sortby'
import React from 'react'

import {Error, Table} from '../components/index.js'
import {Repos} from '../repos.js'

export default class View extends Command {
  public static aliases = ['v']
  public static args = {
    repo: Args.string({description: 'Name of repository.', required: true}),
  }

  public static description = 'View a repository.'
  public static flags = {}

  public async run(): Promise<void> {
    const {args} = await this.parse(View)
    const repos = await new Repos().init()
    const matches = repos.getMatches(args.repo)
    if (matches.length === 0) {
      render(<Error message={`${args.repo} has not been added yet.`} />)
      this.exit(1)
    } else if (matches.length === 1) {
      const data = [
        {Key: 'name', Value: matches[0].name},
        {Key: 'organization', Value: matches[0].org},
        {Key: 'url', Value: matches[0].urls.html},
        {Key: 'location', Value: matches[0].location},
      ]
      render(<Table data={data} title="Repository" />)
    } else {
      const data = sortBy(Object.values(matches), 'name').map((r) => ({
        Name: r.name,
        Organization: r.org,
        Location: r.location,
        URL: r.urls.html,
      }))

      render(<Table data={data} title="Found Multiple Repositories:" />)
    }
  }
}
