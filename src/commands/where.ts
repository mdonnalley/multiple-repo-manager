import { Args, Command, Flags } from '@oclif/core';
import { Repos } from '../repos.js';
import { parseRepoNameFromPath } from '../util.js';

export default class View extends Command {
  public static description = 'Print location of a repository.';
  public static flags = {
    remote: Flags.boolean({
      description: 'Return url of repository.',
      default: false,
    }),
  };

  public static args = {
    repo: Args.string({ description: 'Name of repository.', required: true }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(View);
    const repoName = args.repo === '.' ? parseRepoNameFromPath() : args.repo;
    const repos = await Repos.create();
    const repo = repos.getOne(repoName);
    this.log(flags.remote ? repo.urls.html : repo.location);
  }
}
