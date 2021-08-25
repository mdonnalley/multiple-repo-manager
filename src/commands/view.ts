import { cli } from 'cli-ux';
import { Command } from '@oclif/core';
import { sortBy } from 'lodash';
import * as chalk from 'chalk';
import { Repos, Repository } from '../repos';

export default class View extends Command {
  public static description = 'View a repository.';
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
    const matches = repos.getMatches(args.repo);
    if (matches.length === 0) {
      process.exitCode = 1;
      throw new Error(`${args.repo as string} has not been added yet.`);
    } else if (matches.length === 1) {
      const columns = { key: {}, value: {} };
      const data = [
        { key: 'name', value: matches[0].name },
        { key: 'organization', value: matches[0].org },
        { key: 'url', value: matches[0].urls.html },
        { key: 'location', value: matches[0].location },
      ];
      cli.table(data, columns);
    } else {
      const columns = {
        name: { header: 'Name' },
        organization: { header: 'Organization', get: (r: Repository): string => r.org },
        url: { header: 'URL', get: (r: Repository): string => r.urls.html },
        location: { header: 'Location', get: (r: Repository): string => r.location },
      };
      const sorted = sortBy(Object.values(matches), 'name');
      cli.table(sorted, columns, { title: chalk.cyan.bold('Found Multiple Respositories:') });
    }
  }
}
