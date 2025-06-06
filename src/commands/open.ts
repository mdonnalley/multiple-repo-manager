import {Args, Flags} from '@oclif/core'
import open from 'open'

import BaseCommand from '../base-command.js'
import execSync from '../exec-sync.js'
import {Repos} from '../repos.js'
import {parseRepoNameFromPath} from '../util.js'

enum GithubTab {
  ACTIONS = 'actions',
  DISCUSSIONS = 'discussions',
  ISSUES = 'issues',
  PULLS = 'pulls',
  PULSE = 'pulse',
  SECURITY = 'security',
  SETTINGS = 'settings',
  WIKI = 'wiki',
}

export default class Open extends BaseCommand {
  public static aliases = ['o']
  public static args = {
    repo: Args.string({
      default: '.',
      description: 'Name of repository.',
      required: true,
    }),
  }
  public static description = 'Open a repository in github.'
  public static examples = [
    {
      command: '<%= config.bin %> <%= command.id %> my-repo',
      description: 'Open the main page of a github repository',
    },
    {
      command: '<%= config.bin %> <%= command.id %> my-repo --tab issues',
      description: 'Open the issues tab of a github repository',
    },
    {
      command: '<%= config.bin %> <%= command.id %> my-repo --file path/to/my/code.ts',
      description: 'Open a specific file in a github repository',
    },
  ]
  public static flags = {
    file: Flags.string({
      char: 'f',
      description: 'File to open in github.',
      exclusive: ['tab'],
    }),
    tab: Flags.string({
      char: 't',
      description: 'Tab to open in github.',
      exclusive: ['file'],
      options: Object.values(GithubTab),
    }),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Open)
    const repoName = args.repo === '.' ? parseRepoNameFromPath() : args.repo
    const repo = (await new Repos().init()).getOne(repoName)
    if (!flags.file && !flags.tab) {
      await open(repo.urls.html, {wait: false})
      return
    }

    if (flags.file) {
      const branch =
        execSync(`git -C ${repo.location} rev-parse --abbrev-ref HEAD`, {silent: true}) ?? repo.defaultBranch
      const url = `${repo.urls.html}/blob/${branch.trim()}/${flags.file}`
      await open(url, {wait: false})
      return
    }

    if (flags.tab) {
      await open(`${repo.urls.html}/${flags.tab}`, {wait: false})
    }
  }
}
