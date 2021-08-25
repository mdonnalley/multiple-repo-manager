import { spawn } from 'child_process';
import { Command, Flags } from '@oclif/core';
import { Aliases } from '../aliases';

export default class Alias extends Command {
  public static summary = 'Set or unset an executable alias.';
  public static description = 'Provide an empty to value to unset the alias. This feature is not support on Windows.';
  public static examples = [
    {
      description: 'Set an alias',
      command: '<%= config.bin %> <%= command.id %> build=yarn build',
    },
    {
      description: 'Set an alias that uses multi exec',
      command:
        // eslint-disable-next-line max-len
        '<%= config.bin %> <%= command.id %> circle=multi exec . open https://app.circleci.com/pipelines/github/{repo.fullName}',
    },
    {
      description: 'Unset an alias',
      command: '<%= config.bin %> <%= command.id %> build=',
    },
    {
      description: 'Set an alias interactively',
      command: '<%= config.bin %> <%= command.id %> build --interactive',
    },
  ];
  public static disableJsonFlag = true;
  public static strict = false;
  public static flags = {
    interactive: Flags.boolean({
      description: 'Open a vim editor to add your alias',
      default: false,
    }),
  };
  public static args = [
    {
      name: 'keyValue',
      description: 'alias=value',
      required: true,
    },
  ];

  public async run(): Promise<void> {
    const { args, argv, flags } = await this.parse(Alias);
    const keyValue = args.keyValue as string;

    if (!flags.interactive && !keyValue.includes('=')) {
      process.exitCode = 1;
      throw new Error(`The provided argument ${args.keyValue as string} is not a valid key=value pair.`);
    }

    const aliases = await Aliases.create();
    const [alias, firstPart] = keyValue.split('=');
    if (flags.interactive) {
      aliases.set(alias, '');
      await aliases.write();
      spawn('vim', [aliases.filepath], {
        stdio: 'inherit',
        detached: true,
      });
      await aliases.write();
    } else {
      const executable = firstPart ? firstPart + ' ' + argv.splice(argv.indexOf(keyValue) + 1).join(' ') : null;
      if (!executable) {
        aliases.unset(alias);
      } else {
        aliases.set(alias, executable);
      }
      await aliases.write();
      if (executable) {
        this.log(`${alias} was successfully created.`);
      } else {
        this.log(`${alias} was successfully removed.`);
      }
    }
  }
}
