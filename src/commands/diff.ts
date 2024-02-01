import { Args, Command, ux } from '@oclif/core';
import sortBy from 'lodash.sortby';
import { Repos, Repository } from '../repos.js';

export default class Diff extends Command {
  public static description =
    'Show repositories in an org that are not cloned locally. Requires GH_TOKEN to be set in the environment.';
  public static examples = ['<%= config.bin %> <%= command.id %> my-github-org'];

  public static flags = {};

  public static args = {
    org: Args.string({ description: 'Github org', required: true }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(Diff);
    const repos = await Repos.create();
    const remote = (await repos.fetch(args.org)).filter((r) => !repos.has(r.fullName));
    const columns = {
      name: { header: 'Name' },
      url: { header: 'URL', get: (r: Repository): string => r.urls.html },
    };
    const sorted = sortBy(Object.values(remote), 'name');
    ux.table(sorted, columns, { title: `${args.org} Diff` });
  }
}
