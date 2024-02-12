/* eslint-disable perfectionist/sort-objects */
import {Args, Command, Flags, ux} from '@oclif/core'
// @ts-expect-error because no types exist
import hyperlinker from 'hyperlinker'
import sortBy from 'lodash.sortby'

import {convertDateStringToDaysAgo, dateFlag, readableDate} from '../../date-utils.js'
import {Github, Pull} from '../../github.js'
import {Repos} from '../../repos.js'
import {startRandomSpinner} from '../../util.js'

function applyFilters<Pull>(items: Pull[], filters: ((item: Pull) => boolean)[]): Pull[] {
  // eslint-disable-next-line unicorn/no-array-reduce
  return filters.reduce((acc, filter) => acc.filter((element) => filter(element)), items)
}

export default class OrgPulls extends Command {
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
      description: 'Ignore dependabot',
      char: 'i',
      allowNo: true,
      exclusive: ['only-dependabot'],
    }),
    'only-dependabot': Flags.boolean({
      description: 'Only show dependabot',
      char: 'd',
      exclusive: ['ignore-dependabot'],
    }),
    'sort-by': Flags.option({
      description: 'Sort by',
      options: ['created', 'repo', 'author'] as const,
      default: 'repo',
      char: 'b',
    })(),
    since: dateFlag({
      description: 'Only show pull requests created after this date',
      char: 's',
    }),
  }

  public async run(): Promise<void> {
    startRandomSpinner('Looking for pull requests')
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

    const columns = {
      title: {header: 'Title', minWidth: 80},
      PR: {get: (r: Pull): string => hyperlinker(`${r.repo}#${r.number}`, r.url), header: 'Pull Request'},
      author: {get: (r: Pull): string => r.user ?? '', header: 'Author'},
      created: {
        get: (r: Pull): string => `${readableDate(r.created)} (${convertDateStringToDaysAgo(r.created)})`,
        header: 'Created',
      },
      labels: {get: (r: Pull): string => r.labels.join(', '), header: 'Labels'},
    }
    const sorted = sortBy(Object.values(filtered), flags['sort-by'])
    ux.action.stop(`Found ${sorted.length} pull request${sorted.length === 1 ? '' : 's'}`)

    if (sorted.length === 0) {
      this.log('No pull requests found')
      return
    }

    ux.table(flags['sort-by'] === 'created' ? sorted.reverse() : sorted, columns, {title: 'Pull Requests'})
  }
}
