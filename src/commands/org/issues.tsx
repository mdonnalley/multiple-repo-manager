/* eslint-disable perfectionist/sort-objects */
import {Args, Flags} from '@oclif/core'
import {render} from 'ink'
import sortBy from 'lodash.sortby'
import React from 'react'

import BaseCommand from '../../base-command.js'
import {LinkTable, SimpleMessage, Spinner} from '../../components/index.js'
import {convertDateStringToDaysAgo, dateFlag, readableDate} from '../../date-utils.js'
import {Github} from '../../github.js'
import {Repos} from '../../repos.js'
import {truncate} from '../../util.js'

export default class OrgIssues extends BaseCommand {
  public static args = {
    org: Args.string({description: 'Github org', required: true}),
  }

  public static description =
    'List all open issues for added repos in an org. Requires GH_TOKEN to be set in the environment.'

  public static examples = [
    '<%= config.bin %> <%= command.id %> my-github-org --since 1/1/24',
    '<%= config.bin %> <%= command.id %> my-github-org --since friday',
  ]

  public static flags = {
    'sort-by': Flags.option({
      description: 'Sort by',
      options: ['created', 'repo', 'author', 'updated'] as const,
      default: 'repo',
      char: 'b',
    })(),
    since: dateFlag({
      description: 'Only show issues updated after this date',
      char: 's',
      required: true,
    }),
  }

  public async run(): Promise<void> {
    render(<Spinner label="Looking for issues" />)
    const {args, flags} = await this.parse(OrgIssues)

    const repos = await new Repos().init()
    const github = new Github()
    const all = await github.repoIssues(repos.getReposOfOrg(args.org), {since: flags.since?.toISOString()})

    const sorted = sortBy(Object.values(all), flags['sort-by'])

    if (sorted.length === 0) {
      render(<SimpleMessage message="No issues found" />)
      return
    }

    const data = (flags['sort-by'] === 'created' || flags['sort-by'] === 'updated' ? sorted.reverse() : sorted).map(
      (r) => ({
        Title: truncate(r.title, 40),
        Issue: `${r.repo}#${r.number}`,
        url: r.url,
        Author: r.user,
        Created: `${readableDate(r.created)} (${convertDateStringToDaysAgo(r.created)})`,
        Updated: `${readableDate(r.updated)} (${convertDateStringToDaysAgo(r.updated)})`,
        Labels: r.labels.join(', '),
      }),
    )

    render(<LinkTable config={{Issue: 'url'}} data={data} title="Issues" />)
  }
}
