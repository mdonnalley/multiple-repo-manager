import { Command } from '@oclif/core';
import { cli } from 'cli-ux';
import { sortBy } from 'lodash';
import { Pull, Repos } from '../repos';

export default class Pulls extends Command {
  public static description =
    'List all pull requests for added repositories. Requires GH_TOKEN to be set in the environment.';
  public static examples = ['<%= config.bin %> <%= command.id %>'];
  public static disableJsonFlag = true;

  public static flags = {};

  public async run(): Promise<void> {
    const repos = await Repos.create();
    const pulls = await repos.fetchPulls();
    const columns = {
      repo: { header: 'Repo', get: (p: Pull): string => p.repo.split('/')[1] },
      title: {},
      url: { header: 'URL', get: (p: Pull): string => p.url },
    };
    const sorted = sortBy(Object.values(pulls), 'repo');
    cli.table(sorted, columns, { title: 'Pull Requests' });
  }
}
