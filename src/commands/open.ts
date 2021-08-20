import { Command } from '@oclif/core';
import * as open from 'open';
import { readRepo } from '../util';

export class Open extends Command {
  public static readonly description = 'Open a github repository';
  public static readonly flags = {};
  public static readonly args = [
    {
      name: 'repo',
      description: 'Name of repository',
      required: true,
    },
  ];

  public async run(): Promise<void> {
    const { args } = await this.parse(Open);
    const repo = await readRepo(args.repo);
    await open(repo.html_url, { wait: false });
  }
}
