import input from '@inquirer/input'
import {Flags} from '@oclif/core'
import {Box, render} from 'ink'
import os from 'node:os'
import path from 'node:path'
import React from 'react'

import {AutoComplete} from '../autocomplete.js'
import BaseCommand from '../base-command.js'
import {SimpleMessage} from '../components/index.js'
import {Config} from '../config.js'
import {MultiWrapper} from '../multi-wrapper.js'
import {ZshRc} from '../zsh-rc.js'

export default class Setup extends BaseCommand {
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
    const config = await new Config().init()
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
    await new MultiWrapper().init()
    await new AutoComplete(config.get('directory')).init()

    render(
      <Box flexDirection="column">
        <SimpleMessage message="Setup complete" />
        <SimpleMessage message={`All repositories will be cloned into ${config.get('directory')}`} />
        <SimpleMessage message={`Open a new terminal or run "source ${ZshRc.LOCATION}" for autocomplete to work.`} />
      </Box>,
    )
  }
}
