import { rm } from 'fs/promises';
import { Command } from '@oclif/core';
import { Repos } from '../repos';

export default class Remove extends Command {
  public static description = 'Remove a github repository from your local filesystem.';
  public static disableJsonFlag = true;
  public static flags = {};
  public static args = [
    {
      name: 'repo',
      description: 'Name of repository.',
      required: true,
    },
  ];
  public static aliases = ['rm'];

  public async run(): Promise<void> {
    const { args } = await this.parse(Remove);
    const repos = await Repos.create();
    const repo = repos.get(args.repo);
    if (!repo) {
      process.exitCode = 1;
      throw new Error(`${args.repo as string} has not been added yet.`);
    }

    repos.unset(args.repo);
    await repos.write();
    await rm(repo.location, { recursive: true, force: true });
  }
}