import { Command } from '@oclif/core';
import * as chalk from 'chalk';
import { cli } from 'cli-ux';
import { groupBy, sortBy } from 'lodash';
import { Repos } from '../repos';

export class List extends Command {
  public static readonly description = 'List all added repositories.';
  public static readonly flags = {};

  public async run(): Promise<void> {
    const repositories = (await Repos.create()).getContents();
    const grouped = groupBy(repositories, 'owner.login');
    for (const [org, repos] of Object.entries(grouped)) {
      const columns = {
        name: { header: 'Name' },
        html_url: { header: 'URL' },
      };
      const sorted = sortBy(Object.values(repos), 'name');
      cli.table(sorted, columns, { title: chalk.cyan.bold(`${org} Respositories`) });
      this.log();
    }
  }
}
