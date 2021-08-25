import * as path from 'path';
import { Command } from '@oclif/core';
import * as open from 'open';
import { Repos } from '../repos';

export default class Open extends Command {
  public static description = 'Open a github repository.';
  public static disableJsonFlag = true;
  public static flags = {};
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
    const { args } = await this.parse(Open);
    const repoName = (args.repo === '.' ? path.basename(process.cwd()) : args.repo) as string;
    const repo = (await Repos.create()).getOne(repoName);
    await open(repo.urls.html, { wait: false });
  }
}
