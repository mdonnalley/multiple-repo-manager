import { cli } from 'cli-ux';
import { Command } from '@oclif/core';
import { Repos } from '../repos';

export class View extends Command {
  public static readonly description = 'View a github repository.';
  public static readonly flags = {};
  public static readonly args = [
    {
      name: 'repo',
      description: 'Name of repository.',
      required: true,
    },
  ];
  public static readonly aliases = ['v'];

  public async run(): Promise<void> {
    const { args } = await this.parse(View);
    const repos = await Repos.create();
    const repo = repos.get(args.repo);
    if (!repo) {
      process.exitCode = 1;
      throw new Error(`${args.repo as string} has not been added yet.`);
    }
    const columns = { key: {}, value: {} };
    const data = [
      { key: 'name', value: repo.name },
      { key: 'organization', value: repo.org },
      { key: 'url', value: repo.urls.html },
    ];
    cli.table(data, columns);
  }
}
