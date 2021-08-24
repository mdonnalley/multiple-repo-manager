import { cli } from 'cli-ux';
import { Command } from '@oclif/core';
import { Repos } from '../repos';

export default class View extends Command {
  public static description = 'View a github repository.';
  public static disableJsonFlag = true;
  public static flags = {};
  public static args = [
    {
      name: 'repo',
      description: 'Name of repository.',
      required: true,
    },
  ];
  public static aliases = ['v'];

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
