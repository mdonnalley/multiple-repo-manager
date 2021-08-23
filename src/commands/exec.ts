import { Command } from '@oclif/core';
import { exec } from 'shelljs';
import { Repos } from '../repos';

export default class Exec extends Command {
  public static description = 'Execute a command org script in a repository.';
  public static disableJsonFlag = true;
  public static flags = {};
  public static args = [
    {
      name: 'repo',
      description: 'Name of repository to execute in.',
      required: true,
    },
  ];
  public static strict = false;
  public static aliases = ['x'];

  public async run(): Promise<void> {
    const { args, argv } = await this.parse(Exec);
    const executable = argv.splice(argv.indexOf(args.repo) + 1).join(' ');

    const repo = (await Repos.create()).get(args.repo);
    if (!repo) {
      process.exitCode = 1;
      throw new Error(`${args.repo as string} has not been added yet.`);
    }

    exec(`(cd ${repo.location} && ${executable})`);
  }
}
