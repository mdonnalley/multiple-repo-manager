import { Args, Command } from '@oclif/core';
import shelljs from 'shelljs';
import get from 'lodash.get';
import { Repos } from '../repos.js';
import { parseRepoNameFromPath } from '../util.js';

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
  public static flags = {};

  public static args = {
    repo: Args.string({
      description: 'Name of repository to execute in. Use "." to specify the current working directory.',
      required: true,
    }),
  };
  public static strict = false;
  public static aliases = ['x'];

  public async run(): Promise<void> {
    const { args, argv } = await this.parse(Exec);
    const repoName = args.repo === '.' ? parseRepoNameFromPath() : args.repo;

    let executable = argv.splice(argv.indexOf(args.repo) + 1).join(' ');

    const repo = (await Repos.create()).getOne(repoName);
    const tokensRegex = /{(.*?)}/g;
    const tokens = executable.match(tokensRegex) ?? [];
    tokens.forEach((t) => {
      const value = get(repo, t.replace(/{|}/g, '').replace('repo.', '')) as string;
      executable = executable.replace(t, value);
    });

    shelljs.exec(`(cd ${repo.location} && ${executable})`);
  }
}
