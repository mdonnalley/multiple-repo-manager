import * as os from 'os';
import * as path from 'path';
import { Command, Flags } from '@oclif/core';
import { prompt } from 'inquirer';
import { Config } from '../config';
import { AutoComplete } from '../autocomplete';
import { MpmCd } from '../mpmCd';

export class Setup extends Command {
  public static readonly description = 'Setup mpm';
  public static readonly flags = {
    directory: Flags.string({
      description: 'Location to setup repositories.',
      char: 'd',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Setup);
    const config = await Config.create();
    if (!flags.directory) {
      const answers = await prompt<{ directory: string }>({
        name: 'directory',
        type: 'input',
        message: 'Where would you link to clone your repositories?',
        default: Config.DEFAULT_DIRECTORY,
      });
      config.set('directory', path.resolve(answers.directory.replace('~', os.homedir())));
    } else {
      config.set('directory', flags.directory);
    }
    await config.write();

    this.log(`All repositories will be cloned into ${config.get('directory')}`);
    await AutoComplete.create(config.get('directory'));
    await MpmCd.create();
  }
}
