/* eslint-disable perfectionist/sort-objects */
import {Args, Command, Flags, ux} from '@oclif/core'
// @ts-expect-error because no types exist
import hyperlinker from 'hyperlinker'
import sortBy from 'lodash.sortby'

import {convertDateStringToDaysAgo, dateFlag, readableDate} from '../../date-utils.js'
import {Discussion, Repos} from '../../repos.js'

export default class OrgDiscussions extends Command {
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
    const {args, flags} = await this.parse(OrgDiscussions)

    const repos = await new Repos().init()
    const discussions = await repos.fetchOrgDiscussions(args.org)

    const filtered = flags.since
      ? Object.values(discussions).filter((d) => new Date(d.updated) > flags.since!)
      : Object.values(discussions)

    const columns = {
      title: {header: 'Title', minWidth: 80},
      issue: {get: (r: Discussion): string => hyperlinker(`${r.repo}#${r.number}`, r.url), header: 'Issue'},
      author: {get: (r: Discussion): string => r.user, header: 'Author'},
      updated: {
        get: (r: Discussion): string => `${readableDate(r.updated)} (${convertDateStringToDaysAgo(r.updated)})`,
        header: 'Updated',
      },
      created: {
        get: (r: Discussion): string => `${readableDate(r.created)} (${convertDateStringToDaysAgo(r.created)})`,
        header: 'Created',
      },
    }
    const sorted = sortBy(Object.values(filtered), flags['sort-by'])

    ux.table(flags['sort-by'] === 'created' || flags['sort-by'] === 'updated' ? sorted.reverse() : sorted, columns, {
      title: 'Discussions',
      'no-truncate': true,
    })
  }
}
