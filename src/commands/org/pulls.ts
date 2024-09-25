import {Args, Flags, ux} from '@oclif/core'
import sortBy from 'lodash.sortby'
import terminalLink from 'terminal-link'

import BaseCommand from '../../base-command.js'
import {SpinnerRunner} from '../../components/spinner.js'
import {convertDateStringToDaysAgo, dateFlag, readableDate} from '../../date-utils.js'
import {Github, Pull} from '../../github.js'
import {Repos} from '../../repos.js'
import {printTable} from '../../table.js'

function applyFilters<Pull>(items: Pull[], filters: ((item: Pull) => boolean)[]): Pull[] {
  // eslint-disable-next-line unicorn/no-array-reduce
  return filters.reduce((acc, filter) => acc.filter((element) => filter(element)), items)
}

export default class OrgPulls extends BaseCommand {
  public static args = {
    org: Args.string({description: 'Github org', required: true}),
  }

  public static description =
    'List all open pull requests for added repos in an org. Requires GH_TOKEN to be set in the environment.'

  public static examples = [
    '<%= config.bin %> <%= command.id %> my-github-org',
    '<%= config.bin %> <%= command.id %> my-github-org --ignore-dependabot',
    '<%= config.bin %> <%= command.id %> my-github-org --only-dependabot',
    '<%= config.bin %> <%= command.id %> my-github-org --since 1/1/24',
    '<%= config.bin %> <%= command.id %> my-github-org --since friday',
  ]

  public static flags = {
    'ignore-dependabot': Flags.boolean({
      allowNo: true,
      char: 'i',
      description: 'Ignore dependabot',
      exclusive: ['only-dependabot'],
    }),
    'only-dependabot': Flags.boolean({
      char: 'd',
      description: 'Only show dependabot',
      exclusive: ['ignore-dependabot'],
    }),
    since: dateFlag({
      char: 's',
      description: 'Only show pull requests created after this date',
    }),
    'sort-by': Flags.option({
      char: 'b',
      default: 'repo',
      description: 'Sort by',
      options: ['created', 'repo', 'author'] as const,
    })(),
  }

  public async run(): Promise<void> {
    const spinner = new SpinnerRunner('Fetching pull requests')
    const {args, flags} = await this.parse(OrgPulls)

    const repos = await new Repos().init()
    const github = new Github()
    const all = await github.repoPulls(repos.getReposOfOrg(args.org))

    const filtered = applyFilters(all, [
      ...(flags.since ? [(r: Pull) => new Date(r.created) > flags.since!] : []),
      ...(flags['ignore-dependabot']
        ? [
            (r: Pull) =>
              !r.labels.some((l) => ['dependencies']?.includes(l)) &&
              r.user !== 'dependabot' &&
              r.user !== 'dependabot[bot]',
          ]
        : []),
      ...(flags['only-dependabot']
        ? [
            (r: Pull) =>
              (r.labels.some((l) => ['dependencies']?.includes(l)) && r.user === 'dependabot') ||
              r.user === 'dependabot[bot]',
          ]
        : []),
    ])

    const sorted = sortBy(Object.values(filtered), flags['sort-by'])
    spinner.stop()

    if (sorted.length === 0) {
      ux.stdout('No pull requests found')
      return
    }

    const data = (flags['sort-by'] === 'created' ? sorted.reverse() : sorted).map((r) => ({
      author: r.user ?? '',
      created: `${readableDate(r.created)} (${convertDateStringToDaysAgo(r.created)})`,
      pr: terminalLink(`${r.repo}#${r.number}`, r.url),
      title: r.title,
    }))

    printTable({
      columns: ['title', {key: 'pr', name: 'PR'}, 'author', 'created'],
      data,
      title: 'Pull Requests',
    })
  }
}
