import input from '@inquirer/input'
import {Command, Flags} from '@oclif/core'
import os from 'node:os'
import path from 'node:path'

import {AutoComplete} from '../autocomplete.js'
import {Config} from '../config.js'
import {MultiWrapper} from '../multi-wrapper.js'
import {ZshRc} from '../zsh-rc.js'

export default class Setup extends Command {
  public static description = 'Setup multi'
  public static flags = {
    directory: Flags.string({
      char: 'd',
      dependsOn: ['username'],
      description: 'Location to setup repositories.',
      hidden: true,
    }),
    username: Flags.string({
      char: 'u',
      dependsOn: ['directory'],
      description: 'Github username.',
      hidden: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Setup)
    const config = await Config.create()
    if (!flags.directory || !flags.username) {
      const directory = await input({
        default: Config.DEFAULT_DIRECTORY,
        message: 'Where would you link to clone your repositories?',
      })
      const username = await input({
        message: 'What is your github username?',
      })

      config.set('directory', path.resolve(directory.replace('~', os.homedir())))
      config.set('username', username)
    } else {
      config.set('directory', flags.directory)
      config.set('username', flags.username)
    }

    await config.write()

    this.log(`All repositories will be cloned into ${config.get('directory')}`)
    await MultiWrapper.create()
    await AutoComplete.create(config.get('directory'))

    this.log(`Open a new terminal or run "source ${ZshRc.LOCATION}" for autocomplete to work.`)
  }
}
