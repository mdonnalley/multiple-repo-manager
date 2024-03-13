/* eslint-disable perfectionist/sort-objects */
import {Args, Command, Flags} from '@oclif/core'
import {render} from 'ink'
import sortBy from 'lodash.sortby'
import {match} from 'minimatch'
import React from 'react'

import {Table} from '../../components/index.js'
import {Github} from '../../github.js'
import {Repos} from '../../repos.js'

export default class Overview extends Command {
  public static args = {
    org: Args.string({description: 'Github org', required: true}),
  }

  static description =
    'Provides issue, pull request, and discussion counts for the request repositories. Requires GH_TOKEN to be set in the environment.'

  static enableJsonFlag = true

  static examples = [
    {
      description: 'Get an overview of the issues and PRs for an org',
      command: '<%= config.bin %> <%= command.id %> my-github-org',
    },
    {
      description: 'Get an overview of the issues, PRs, and discussions for an org',
      command: '<%= config.bin %> <%= command.id %> my-github-org --discussions',
    },
    {
      description: 'Filter out repositories by minimatch pattern',
      command: '<%= config.bin %> <%= command.id %> my-github-org --filter "my-repo-*"',
    },
  ]

  static flags = {
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
    filter: Flags.string({
      char: 'f',
      description: 'Filter out repositories by minimatch pattern',
      multiple: true,
    }),
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
      repo: 'totals',
      discussions: discussions.length,
      issues: issues.length,
      pulls: pulls.length,
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
      const data = sorted.map(({repo, discussions, issues, pulls}) => ({
        Repository: repo,
        Issues: issues,
        Pulls: pulls,
        ...(flags.discussions ? {Discussions: discussions} : {}),
      }))
      render(<Table data={data} title="Overview" />)
    }

    return results
  }
}
