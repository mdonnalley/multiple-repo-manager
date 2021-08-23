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
    },
  ];
  public static aliases = ['o'];

  public async run(): Promise<void> {
    const { args } = await this.parse(Open);
    const repo = (await Repos.create()).get(args.repo);
    if (!repo) {
      process.exitCode = 1;
      throw new Error(`${args.repo as string} has not been added yet.`);
    }
    await open(repo.urls.html, { wait: false });
  }
}
