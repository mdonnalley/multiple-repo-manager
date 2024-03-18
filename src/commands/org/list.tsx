/* eslint-disable perfectionist/sort-objects */
import {Args, Flags} from '@oclif/core'
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

  public static flags = {
    'no-archived': Flags.boolean({description: 'Do not include archived repositories'}),
    'no-private': Flags.boolean({description: 'Do not include private repositories'}),
  }

  public static strict = false

  public async run(): Promise<void> {
    const {flags, argv} = await this.parse(OrgList)
    const github = new Github()

    const all = (await Promise.all((argv as string[]).map(async (org) => github.orgRepositories(org)))).flat()
    const filtered = all.filter((r) => {
      if (flags['no-archived'] && r.archived) return false
      if (flags['no-private'] && r.private) return false
      return true
    })
    const data = sortBy(Object.values(filtered), ['org', 'name']).map((r) => ({
      Name: r.name,
      url: r.urls.html,
      Archived: r.archived ? 'true' : '',
      Private: r.private ? 'true' : '',
    }))

    render(<LinkTable config={{Name: 'url'}} data={data} title="Repositories" />)
  }
}
