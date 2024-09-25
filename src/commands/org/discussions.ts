import {Args, Flags, ux} from '@oclif/core'
import sortBy from 'lodash/sortBy.js'
import terminalLink from 'terminal-link'

import BaseCommand from '../../base-command.js'
import {SpinnerRunner} from '../../components/spinner.js'
import {convertDateStringToDaysAgo, dateFlag, readableDate} from '../../date-utils.js'
import {Github} from '../../github.js'
import {Repos} from '../../repos.js'
import {printTable} from '../../table.js'

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
    since: dateFlag({
      char: 's',
      description: 'Only show discussions updated after this date',
    }),
    'sort-by': Flags.option({
      char: 'b',
      default: 'repo',
      description: 'Sort by',
      options: ['created', 'repo', 'author', 'updated'] as const,
    })(),
  }

  public async run(): Promise<void> {
    const spinner = new SpinnerRunner('Fetching discussions')
    const {args, flags} = await this.parse(OrgDiscussions)

    const repos = await new Repos().init()
    const github = new Github()
    const discussions = await github.repoDiscussions(repos.getReposOfOrg(args.org))

    const filtered = flags.since
      ? Object.values(discussions).filter((d) => new Date(d.updated) > flags.since!)
      : Object.values(discussions)

    const sorted = sortBy(Object.values(filtered), flags['sort-by'])
    spinner.stop()
    if (sorted.length === 0) {
      ux.stdout('No discussions found')
      return
    }

    const data = (flags['sort-by'] === 'created' || flags['sort-by'] === 'updated' ? sorted.reverse() : sorted).map(
      (r) => ({
        author: r.user,
        created: `${readableDate(r.created)} (${convertDateStringToDaysAgo(r.created)})`,
        discussion: terminalLink(`${r.repo}#${r.number}`, r.url),
        title: r.title,
      }),
    )

    printTable({
      columns: ['title', 'discussion', 'author', 'created'],
      data,
      title: 'Discussions',
    })
  }
}
