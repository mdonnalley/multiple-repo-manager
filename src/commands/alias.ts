import { Command } from '@oclif/core';
import { Aliases } from '../aliases';
import { AutoComplete } from '../autocomplete';
import { BashRc } from '../bashRc';
import { Config } from '../config';
import { MpmWrapper } from '../mpmWrapper';

export default class Alias extends Command {
  public static summary = 'Set or unset an executable alias.';
  public static description = 'Provide an empty to value to unset the alias. This feature is not support on Windows.';
  public static examples = [
    {
      description: 'Set an alias',
      command: '<%= config.bin %> <%= command.id %> build=yarn build',
    },
    {
      description: 'Set an alias that uses mpm exec',
      command:
        // eslint-disable-next-line max-len
        '<%= config.bin %> <%= command.id %> circle=mpm exec . open https://app.circleci.com/pipelines/github/{repo.fullName}',
    },
    {
      description: 'Unset an alias',
      command: '<%= config.bin %> <%= command.id %> build=',
    },
  ];
  public static disableJsonFlag = true;
  public static strict = false;
  public static flags = {};
  public static args = [
    {
      name: 'keyValue',
      description: 'alias=value',
      required: true,
    },
  ];

  public async run(): Promise<void> {
    const { args, argv } = await this.parse(Alias);
    const keyValue = args.keyValue as string;
    if (!keyValue.includes('=')) {
      process.exitCode = 1;
      throw new Error(`The provided argument ${args.keyValue as string} is not a valid key=value pair.`);
    }
    const [alias, firstPart] = keyValue.split('=');
    const executable = firstPart ? firstPart + ' ' + argv.splice(argv.indexOf(keyValue) + 1).join(' ') : null;
    const aliases = await Aliases.create();
    if (!executable) {
      aliases.unset(alias);
    } else {
      aliases.set(alias, executable);
    }
    await aliases.write();

    const config = await Config.create();
    await AutoComplete.create(config.get('directory'));
    await MpmWrapper.create();

    if (executable) {
      this.log(`Open a new terminal or run "source ${BashRc.LOCATION}" for the new alias to work.`);
    } else {
      this.log(`${alias} was successfully removed.`);
    }
  }
}
