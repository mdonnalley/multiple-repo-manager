/* eslint-disable perfectionist/sort-objects */
import {Args} from '@oclif/core'
import {render} from 'ink'
import sortBy from 'lodash.sortby'
import React from 'react'

import BaseCommand from '../../base-command.js'
import {LinkTable} from '../../components/index.js'
import {Github} from '../../github.js'

export default class OrgList extends BaseCommand {
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
    const github = new Github()

    const all = (await Promise.all((argv as string[]).map(async (org) => github.orgRepositories(org)))).flat()

    const data = sortBy(Object.values(all), ['org', 'name']).map((r) => ({
      Name: r.name,
      url: r.urls.html,
      Archived: r.archived ? 'true' : '',
      Private: r.private ? 'true' : '',
    }))

    render(<LinkTable config={{Name: 'url'}} data={data} title="Repositories" />)
  }
}
