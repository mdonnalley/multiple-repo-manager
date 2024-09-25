import {Args, Flags} from '@oclif/core'
import sortBy from 'lodash.sortby'
import {match} from 'minimatch'

import BaseCommand from '../../base-command.js'
import {Github} from '../../github.js'
import {Repos} from '../../repos.js'
import {printTable} from '../../table.js'

export default class Overview extends BaseCommand {
  public static args = {
    org: Args.string({description: 'Github org', required: true}),
  }

  static description =
    'Provides issue, pull request, and discussion counts for the request repositories. Requires GH_TOKEN to be set in the environment.'

  static enableJsonFlag = true
  static examples = [
    {
      command: '<%= config.bin %> <%= command.id %> my-github-org',
      description: 'Get an overview of the issues and PRs for an org',
    },
    {
      command: '<%= config.bin %> <%= command.id %> my-github-org --discussions',
      description: 'Get an overview of the issues, PRs, and discussions for an org',
    },
    {
      command: '<%= config.bin %> <%= command.id %> my-github-org --filter "my-repo-*"',
      description: 'Filter out repositories by minimatch pattern',
    },
  ]

  static flags = {
    discussions: Flags.boolean({
      char: 'd',
      description: 'Include discussions',
    }),
    filter: Flags.string({
      char: 'f',
      description: 'Filter out repositories by minimatch pattern',
      multiple: true,
    }),
    'sort-by': Flags.option({
      char: 'b',
      default: 'repo',
      description: 'Sort by',
      options: ['repo', 'issues', 'pulls'] as const,
    })(),
  }

  public async run(): Promise<Record<string, {discussions: number; issues: number; pulls: number}>> {
    const {args, flags} = await this.parse(Overview)

    const repos = await new Repos().init()
    const github = new Github()

    let filtered = repos.getReposOfOrg(args.org)
    for (const filter of flags.filter ?? []) {
      const matches = match(
        filtered.map((r) => r.name),
        filter,
      )
      filtered = filtered.filter((r) => matches.includes(r.name))
    }

    const [discussions, issues, pulls] = await Promise.all([
      flags.discussions ? await github.repoDiscussions(filtered) : [],
      await github.repoIssues(filtered),
      await github.repoPulls(filtered),
    ])

    const results = Object.fromEntries(
      filtered.map((repo) => [
        repo.name,
        {
          discussions: discussions.filter((d) => d.repo === repo.name).length,
          issues: issues.filter((i) => i.repo === repo.name).length,
          pulls: pulls.filter((p) => p.repo === repo.name).length,
        },
      ]),
    )

    const totals = {
      discussions: discussions.length,
      issues: issues.length,
      pulls: pulls.length,
      repo: 'totals',
    }

    if (!this.jsonEnabled()) {
      const sorted = [
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
      ]
      const data = sorted.map(({discussions, issues, pulls, repo}) => ({
        issues,
        pulls,
        repository: repo,
        ...(flags.discussions ? {discussions} : {}),
      }))

      printTable({
        columns: flags.discussions
          ? ['repository', 'issues', 'pulls', 'discussions']
          : ['repository', 'issues', 'pulls'],
        data,
        title: 'Overview',
      })
    }

    return results
  }
}
