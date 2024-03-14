/* eslint-disable perfectionist/sort-objects */
import {render} from 'ink'
import sortBy from 'lodash.sortby'
import React from 'react'

import BaseCommand from '../base-command.js'
import {LinkTable} from '../components/index.js'
import {Github} from '../github.js'
import {Repos} from '../repos.js'

export default class Pulls extends BaseCommand {
  public static description =
    'List all your pull requests for added repositories. Requires GH_TOKEN to be set in the environment.'

  public static examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    const repos = await new Repos().init()
    const pulls = await new Github().userPulls({repos: repos.values()})

    const data = sortBy(Object.values(pulls), 'repo').map((p) => ({
      Repo: p.repo,
      Title: p.title,
      PR: `#${p.number}`,
      url: p.url,
    }))
    render(<LinkTable config={{PR: 'url'}} data={data} title="Pull Requests" />)
  }
}
