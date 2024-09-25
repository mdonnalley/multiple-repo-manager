import {Flags} from '@oclif/core'
import {render} from 'ink'
import sortBy from 'lodash/sortBy.js'
import PQueue from 'p-queue'
import React from 'react'

import BaseCommand from '../base-command.js'
import {TaskTracker} from '../components/index.js'
import {Repos} from '../repos.js'

type Props = {
  readonly all: boolean
  readonly concurrency?: number
  readonly dryRun: boolean
  readonly header: string
  readonly noCache?: boolean
  readonly orgs: string[]
}

class RefreshTaskTracker extends TaskTracker<Props> {
  async componentDidMount(): Promise<void> {
    const repos = await new Repos().init()

    if (this.props.noCache) {
      await repos.hydrateCache()
    }

    const orgs = this.props.all ? repos.getOrgs() : this.props.orgs

    const repositories = sortBy(
      orgs.flatMap((org) => repos.getReposOfOrg(org, true)),
      'fullName',
    )

    this.setState(() => ({
      tasks: repositories.map((repo) => ({key: repo.org, name: repo.fullName, status: 'pending'})),
      waiting: false,
    }))
    const queue = new PQueue({concurrency: this.props.concurrency ?? orgs.length})

    for (const org of orgs) {
      // eslint-disable-next-line no-void
      void queue.add(async () => {
        this.setState((state) => ({
          tasks: state.tasks.map((c) => (c.key === org ? {...c, status: 'loading'} : c)),
        }))

        try {
          await (this.props.dryRun ? this.noop() : repos.refresh(org, true))
          this.setState((state) => ({
            tasks: state.tasks.map((c) => (c.key === org ? {...c, status: 'success'} : c)),
          }))
        } catch {
          this.setState((state) => ({
            tasks: state.tasks.map((c) => (c.key === org ? {...c, status: 'error'} : c)),
          }))
        }
      })
    }

    await queue.onIdle()
    if (!this.props.dryRun) await repos.write()
    this.setState(() => ({timeToComplete: Date.now() - this.startTime}))
  }
}

export class Refresh extends BaseCommand {
  public static description = 'Refresh the list of repositories and corresponding metadata.'
  public static flags = {
    all: Flags.boolean({
      char: 'a',
      description: 'Refresh all orgs.',
      exclusive: ['org'],
    }),
    concurrency: Flags.integer({
      char: 'c',
      description: 'Number of concurrent refreshes. Defaults to the number of orgs.',
      min: 1,
    }),
    'dry-run': Flags.boolean({
      char: 'd',
      description: 'Show what would be done without doing it.',
    }),
    'no-cache': Flags.boolean({
      description: 'Find repos by looking at configured repos directory instead of using the cached repos.json file.',
    }),
    org: Flags.string({
      char: 'o',
      description: 'Github org to refresh.',
      exclusive: ['all'],
      multiple: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Refresh)
    render(
      <RefreshTaskTracker
        all={flags.all}
        concurrency={flags.concurrency}
        dryRun={flags['dry-run']}
        header="Refreshing repositories"
        noCache={flags['no-cache']}
        orgs={[...new Set(flags.org ?? [])]}
      />,
    )
  }
}
