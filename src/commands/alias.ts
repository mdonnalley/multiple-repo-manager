import { Args, Command } from '@oclif/core';
import { Aliases } from '../aliases.js';

export default class Alias extends Command {
  public static summary = 'Set or unset an alias';
  public static description = 'Provide an empty to value to unset the alias';
  public static examples = [
    {
      description: 'Set an alias',
      command: '<%= config.bin %> <%= command.id %> myrepo=my-org/my-repo',
    },
    {
      description: 'Unset an alias',
      command: '<%= config.bin %> <%= command.id %> myrepo=',
    },
  ];
  public static strict = false;
  public static flags = {};

  public static args = {
    keyValue: Args.string({
      description: 'alias=value',
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(Alias);
    const keyValue = args.keyValue;

    const aliases = await Aliases.create();
    const [alias, value] = keyValue.split('=');
    if (!value) {
      aliases.unset(alias);
    } else {
      aliases.set(alias, value);
    }
    await aliases.write();
    if (value) {
      this.log(`${alias} was successfully created.`);
    } else {
      this.log(`${alias} was successfully removed.`);
    }
  }
}
