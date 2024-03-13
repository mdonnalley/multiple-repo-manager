import {Args, Command, Flags} from '@oclif/core'
import {render} from 'ink'
import React from 'react'

import {SimpleMessage} from '../components/index.js'
import {Repos} from '../repos.js'
import {parseRepoNameFromPath} from '../util.js'

export default class View extends Command {
  public static args = {
    repo: Args.string({description: 'Name of repository.', required: true}),
  }

  public static description = 'Print location of a repository.'

  public static flags = {
    remote: Flags.boolean({
      default: false,
      description: 'Return url of repository.',
    }),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(View)
    const repoName = args.repo === '.' ? parseRepoNameFromPath() : args.repo
    const repos = await new Repos().init()
    const repo = repos.getOne(repoName)
    render(<SimpleMessage message={flags.remote ? repo.urls.html : repo.location} />)
  }
}
