import { Command } from '@oclif/core';
import * as open from 'open';
import { Repos } from '../repos';

export class Open extends Command {
  public static readonly description = 'Open a github repository.';
  public static readonly flags = {};
  public static readonly args = [
    {
      name: 'repo',
      description: 'Name of repository.',
      required: true,
    },
  ];
  public static readonly aliases = ['o'];

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
