import {Args} from '@oclif/core'
import {render} from 'ink'
import sortBy from 'lodash.sortby'
import React from 'react'

import BaseCommand from '../base-command.js'
import {Table} from '../components/index.js'
import {Github} from '../github.js'
import {Repos} from '../repos.js'

export default class Diff extends BaseCommand {
  public static args = {
    org: Args.string({description: 'Github org', required: true}),
  }

  public static description =
    'Show repositories in an org that are not cloned locally. Requires GH_TOKEN to be set in the environment.'

  public static examples = ['<%= config.bin %> <%= command.id %> my-github-org']

  public static flags = {}

  public async run(): Promise<void> {
    const {args} = await this.parse(Diff)
    const repos = await new Repos().init()
    const github = new Github()
    const remote = (await github.orgRepositories(args.org)).filter((r) => !repos.has(r.fullName))

    const sorted = sortBy(Object.values(remote), 'name').map((r) => ({Name: r.name, URL: r.urls.html}))
    render(<Table data={sorted} title={`${args.org} Diff`} />)
  }
}
