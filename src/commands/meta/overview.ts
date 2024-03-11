/* eslint-disable perfectionist/sort-objects */
import {Command, Flags, ux} from '@oclif/core'

import {Github} from '../../github.js'
import {Repos} from '../../repos.js'

export default class MetaOverview extends Command {
  static description = 'Provides issue, pull request, and discussion counts for the request repositories.'
  static enableJsonFlag = true
  static flags = {
    repository: Flags.string({char: 'r', description: 'Repository to query', multiple: true, required: true}),
  }

  public async run(): Promise<Record<string, {discussions: number; issues: number; pulls: number}>> {
    const {flags} = await this.parse(MetaOverview)

    const repos = await new Repos().init()
    const github = new Github()
    const requestedRepos = [...new Set(flags.repository.flatMap((r) => repos.getMatches(r)))]
    const results = Object.fromEntries(
      await Promise.all(
        requestedRepos.map(async (repo) => {
          const discussions = await github.repoDiscussions([repo])
          const issues = await github.repoIssues([repo])
          const pulls = await github.repoPulls([repo])
          return [repo.name, {discussions: discussions.length, issues: issues.length, pulls: pulls.length}]
        }),
      ),
    ) as Record<string, {discussions: number; issues: number; pulls: number}>

    if (!this.jsonEnabled()) {
      ux.table(
        Object.entries(results).map(([repo, {discussions, issues, pulls}]) => ({
          discussions,
          issues,
          pulls,
          repository: repo,
        })),
        {
          repository: {header: 'Repository'},
          issues: {header: 'Issues'},
          pulls: {header: 'Pull Requests'},
          discussions: {header: 'Discussions'},
        },
      )
    }

    return results
  }
}
