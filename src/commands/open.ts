import * as path from 'path';
import { Command, Flags } from '@oclif/core';
import * as open from 'open';
import { exec } from 'shelljs';
import { Repos } from '../repos';

enum GithubTab {
  ISSUES = 'issues',
  PULLS = 'pulls',
  DISCUSSIONS = 'discussions',
  ACTIONS = 'actions',
  WIKI = 'wiki',
  SECURITY = 'security',
  PULSE = 'pulse',
  SETTINGS = 'settings',
}

export default class Open extends Command {
  public static description = 'Open a repository in github.';
  public static examples = [
    {
      description: 'Open the main page of a github repository',
      command: '<%= config.bin %> <%= command.id %> my-repo',
    },
    {
      description: 'Open the issues tab of a github repository',
      command: '<%= config.bin %> <%= command.id %> my-repo --tab issues',
    },
    {
      description: 'Open a specific file in a github repository',
      command: '<%= config.bin %> <%= command.id %> my-repo --file path/to/my/code.ts',
    },
  ];
  public static disableJsonFlag = true;
  public static flags = {
    file: Flags.string({
      description: 'File to open in github.',
      char: 'f',
      exclusive: ['tab'],
    }),
    tab: Flags.string({
      description: 'Tab to open in github.',
      char: 't',
      options: Object.values(GithubTab),
      exclusive: ['file'],
    }),
  };
  public static args = [
    {
      name: 'repo',
      description: 'Name of repository.',
      required: true,
      default: '.',
    },
  ];
  public static aliases = ['o'];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Open);
    const repoName = (args.repo === '.' ? path.basename(process.cwd()) : args.repo) as string;
    const repo = (await Repos.create()).getOne(repoName);
    if (!flags.file && !flags.tab) {
      await open(repo.urls.html, { wait: false });
      return;
    }

    if (flags.file) {
      const branch = exec('git rev-parse --abbrev-ref HEAD', { silent: true }).stdout ?? repo.defaultBranch;
      const url = `${repo.urls.html}/blob/${branch.trim()}/${flags.file}`;
      await open(url, { wait: false });
      return;
    }

    if (flags.tab) {
      await open(`${repo.urls.html}/${flags.tab}`, { wait: false });
      return;
    }
  }
}
