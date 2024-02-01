import { ux, Command } from '@oclif/core';
import chalk from 'chalk';
import groupBy from 'lodash.groupby';
import sortBy from 'lodash.sortby';
import { Repos, Repository } from '../repos.js';

export default class List extends Command {
  public static description = 'List all repositories.';
  public static flags = {};
  public static aliases = ['ls'];

  public async run(): Promise<void> {
    const repositories = (await Repos.create()).getContents();
    if (Object.keys(repositories).length === 0) {
      process.exitCode = 1;
      throw new Error('No repositories have been added yet.');
    }
    const grouped = groupBy(repositories, 'org');
    for (const [org, repos] of Object.entries(grouped)) {
      const columns = {
        name: { header: 'Name' },
        url: { header: 'URL', get: (r: Repository): string => r.urls.html },
        location: { header: 'Location', get: (r: Repository): string => r.location },
      };
      const sorted = sortBy(Object.values(repos), 'name');
      ux.table(sorted, columns, { title: chalk.cyan.bold(`${org} Repositories`) });
      this.log();
    }
  }
}
