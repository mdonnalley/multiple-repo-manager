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

export default class OrgDiscussions extends BaseCommand {
  public static args = {
    org: Args.string({description: 'Github org', required: true}),
  }

  public static description =
    'List all open discussions for added repos in an org. Requires GH_TOKEN to be set in the environment.'

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
      description: 'Only show discussions updated after this date',
      char: 's',
    }),
  }

  public async run(): Promise<void> {
    render(<Spinner label="Looking for discussions" />)
    const {args, flags} = await this.parse(OrgDiscussions)

    const repos = await new Repos().init()
    const github = new Github()
    const discussions = await github.repoDiscussions(repos.getReposOfOrg(args.org))

    const filtered = flags.since
      ? Object.values(discussions).filter((d) => new Date(d.updated) > flags.since!)
      : Object.values(discussions)

    const sorted = sortBy(Object.values(filtered), flags['sort-by'])

    if (sorted.length === 0) {
      render(<SimpleMessage message="No discussions found" />)
      return
    }

    const data = (flags['sort-by'] === 'created' || flags['sort-by'] === 'updated' ? sorted.reverse() : sorted).map(
      (r) => ({
        Title: truncate(r.title, 40),
        Discussion: `${r.repo}#${r.number}`,
        url: r.url,
        Author: r.user,
        Created: `${readableDate(r.created)} (${convertDateStringToDaysAgo(r.created)})`,
      }),
    )

    render(<LinkTable config={{Discussion: 'url'}} data={data} title="Pull Requests" />)
  }
}
