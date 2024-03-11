/* eslint-disable perfectionist/sort-objects */
import {Command, Flags, ux} from '@oclif/core'
import chalk from 'chalk'
import sortBy from 'lodash.sortby'

import {Github} from '../../github.js'
import {Repos} from '../../repos.js'

export default class MetaOverview extends Command {
  static description =
    'Provides issue, pull request, and discussion counts for the request repositories. Requires GH_TOKEN to be set in the environment.'

  static enableJsonFlag = true
  static flags = {
    repository: Flags.string({
      char: 'r',
      description: 'Repository to query',
      multiple: true,
      required: true,
    }),
    discussions: Flags.boolean({
      char: 'd',
      description: 'Include discussions',
    }),
    'sort-by': Flags.option({
      description: 'Sort by',
      options: ['repo', 'issues', 'pulls'] as const,
      default: 'repo',
      char: 'b',
    })(),
  }

  public async run(): Promise<Record<string, {discussions: number; issues: number; pulls: number}>> {
    const {flags} = await this.parse(MetaOverview)

    const repos = await new Repos().init()
    const github = new Github()
    const requestedRepos = [...new Set(flags.repository.flatMap((r) => repos.getMatches(r)))]
    const results = Object.fromEntries(
      await Promise.all(
        requestedRepos.map(async (repo) => {
          const [discussions, issues, pulls] = await Promise.all([
            flags.discussions ? await github.repoDiscussions([repo]) : [],
            await github.repoIssues([repo]),
            await github.repoPulls([repo]),
          ])
          return [repo.name, {discussions: discussions.length, issues: issues.length, pulls: pulls.length}]
        }),
      ),
    ) as Record<string, {discussions: number; issues: number; pulls: number}>

    const totals = {
      repo: 'totals',
      discussions: Object.values(results).reduce((acc, {discussions}) => acc + discussions, 0),
      issues: Object.values(results).reduce((acc, {issues}) => acc + issues, 0),
      pulls: Object.values(results).reduce((acc, {pulls}) => acc + pulls, 0),
    }

    if (!this.jsonEnabled()) {
      ux.table(
        [
          ...sortBy(
            Object.entries(results).map(([repo, {discussions, issues, pulls}]) => ({
              discussions,
              issues,
              pulls,
              repo,
            })),
            flags['sort-by'],
          ).reverse(),
          totals,
        ],
        {
          repository: {
            header: 'Repository',
            get: (row) => (row.repo === 'totals' ? chalk.bold('totals') : row.repo),
          },
          issues: {header: 'Issues'},
          pulls: {header: 'PRs'},
          ...(flags.discussions ? {discussions: {header: 'Discussions'}} : {}),
        },
      )
    }

    return results
  }
}
