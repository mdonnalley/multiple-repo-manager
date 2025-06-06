import {Args, Flags, ux} from '@oclif/core'
import sortBy from 'lodash/sortBy.js'
import terminalLink from 'terminal-link'

import BaseCommand from '../../base-command.js'
import {SpinnerRunner} from '../../components/spinner.js'
import {convertDateStringToDaysAgo, dateFlag, readableDate} from '../../date-utils.js'
import {Github} from '../../github.js'
import {Repos} from '../../repos.js'
import {printTable} from '../../table.js'

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
    since: dateFlag({
      char: 's',
      description: 'Only show issues updated after this date.',
      required: true,
    }),
    'sort-by': Flags.option({
      char: 'b',
      default: 'repo',
      description: 'Sort by',
      options: ['created', 'repo', 'author', 'updated'] as const,
    })(),
    verbose: Flags.boolean({description: 'Show verbose output.'}),
  }

  public async run(): Promise<void> {
    const spinner = new SpinnerRunner('Fetching issues')
    const {args, flags} = await this.parse(OrgIssues)

    const repos = await new Repos().init()
    const github = new Github()
    const all = await github.repoIssues(repos.getReposOfOrg(args.org), {since: flags.since?.toISOString()})

    const sorted = sortBy(Object.values(all), flags['sort-by'])
    spinner.stop()

    if (sorted.length === 0) {
      ux.stdout('No issues found')
      return
    }

    const data = (flags['sort-by'] === 'created' || flags['sort-by'] === 'updated' ? sorted.reverse() : sorted).map(
      (r) => ({
        author: r.user,
        created: `${readableDate(r.created)} (${convertDateStringToDaysAgo(r.created)})`,
        issue: terminalLink(`${r.repo}#${r.number}`, r.url),
        labels: r.labels.join(', '),
        title: r.title,
        updated: `${readableDate(r.updated)} (${convertDateStringToDaysAgo(r.updated)})`,
      }),
    )

    printTable({
      columns: flags.verbose
        ? ['title', 'issue', 'author', 'created', 'updated', 'labels']
        : ['title', 'issue', 'updated'],
      data,
      title: 'Issues',
    })
  }
}
