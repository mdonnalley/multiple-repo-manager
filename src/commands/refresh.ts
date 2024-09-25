import {Flags} from '@oclif/core'
import {ParallelMultiStageOutput} from '@oclif/multi-stage-output'

import BaseCommand from '../base-command.js'
import {Repos} from '../repos.js'

export class Refresh extends BaseCommand {
  public static description = 'Refresh the list of repositories and corresponding metadata.'
  public static flags = {
    all: Flags.boolean({
      char: 'a',
      description: 'Refresh all orgs.',
      exclusive: ['org'],
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
    const repos = await new Repos().init()
    const orgs = flags.all ? repos.getOrgs() : (flags.org ?? [])

    const repoCounts = Object.fromEntries(orgs.map((org) => [org, repos.getReposOfOrg(org, true).length]))

    if (flags['no-cache']) {
      await repos.hydrateCache()
    }

    const mso = new ParallelMultiStageOutput<{repoCounts: typeof repoCounts}>({
      jsonEnabled: this.jsonEnabled(),
      stageSpecificBlock: orgs.map((org) => ({
        get: (data) => data?.repoCounts[org].toString(),
        label: 'repos',
        stage: org,
        type: 'static-key-value',
      })),
      stages: orgs,
      title: flags['dry-run'] ? '[DRY RUN] Refreshing repositories' : 'Refreshing repositories',
    })

    mso.updateData({repoCounts})
    await Promise.all(
      orgs.map(async (org) => {
        mso.startStage(org)
        await repos.refresh(org, true)
        mso.stopStage(org)
      }),
    )

    mso.stop()

    if (!flags['dry-run']) {
      await repos.write()
    }
  }
}
