import { Command } from '@oclif/core';
import { Aliases } from '../../aliases';

export default class Resolve extends Command {
  public static description = 'Return the value of an alias.';
  public static disableJsonFlag = true;
  public static flags = {};
  public static args = [
    {
      name: 'alias',
      description: 'Name of alias to resolve.',
      required: true,
    },
  ];

  public async run(): Promise<void> {
    const { args } = await this.parse(Resolve);
    const aliases = await Aliases.create();
    const executable = aliases.get(args.alias).replace(/\n/g, ' ; ');
    this.log(executable);
  }
}
