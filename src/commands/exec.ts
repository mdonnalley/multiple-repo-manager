import * as path from 'path';
import { Command } from '@oclif/core';
import { exec } from 'shelljs';
import { get } from 'lodash';
import { Repos } from '../repos';

export default class Exec extends Command {
  public static description = 'Execute a command or script in a repository.';
  public static examples = [
    {
      description: 'Execute a script in a different repository',
      command: '<%= config.bin %> <%= command.id %> my-repo yarn compile',
    },
    {
      description: 'Execute a script in the current working directory',
      command: '<%= config.bin %> <%= command.id %> . yarn compile',
    },
    {
      description: 'Interpolate values into command execution',
      command: '<%= config.bin %> <%= command.id %> . open https://app.circleci.com/pipelines/github/{repo.fullName}',
    },
  ];
  public static disableJsonFlag = true;
  public static flags = {};
  public static args = [
    {
      name: 'repo',
      description: 'Name of repository to execute in. Use "." to specify the current working directory.',
      required: true,
    },
  ];
  public static strict = false;
  public static aliases = ['x'];

  public async run(): Promise<void> {
    const { args, argv } = await this.parse(Exec);
    const repoName = (args.repo === '.' ? path.basename(process.cwd()) : args.repo) as string;
    let executable = argv.splice(argv.indexOf(args.repo) + 1).join(' ');

    const repo = (await Repos.create()).get(repoName);
    if (!repo) {
      process.exitCode = 1;
      throw new Error(`${args.repo as string} has not been added yet.`);
    }

    const tokensRegex = /{(.*?)}/g;
    const tokens = executable.match(tokensRegex);
    tokens.forEach((t) => {
      const value = get(repo, t.replace(/{|}/g, '').replace('repo.', '')) as string;
      executable = executable.replace(t, value);
    });

    exec(`(cd ${repo.location} && ${executable})`);
  }
}
