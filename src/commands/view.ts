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

  public async run(): Promise<void> {
    const { args } = await this.parse(View);
    const repos = await Repos.create();
    const repo = repos.get(args.repo);
    const columns = { key: {}, value: {} };
    const data = [
      { key: 'name', value: repo.name },
      { key: 'organization', value: repo.owner.login },
      { key: 'url', value: repo.html_url },
    ];
    cli.table(data, columns);
  }
}
