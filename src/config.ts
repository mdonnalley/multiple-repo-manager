import os from 'node:os'
import path from 'node:path'

import {ConfigFile} from './config-file.js'

export type Configuration = {
  directory: string
  username: string
}

export class Config extends ConfigFile<Configuration> {
  public static DEFAULT_DIRECTORY = path.join(os.homedir(), 'repos')

  private static DEFAULT_CONFIG: Configuration = {directory: Config.DEFAULT_DIRECTORY, username: ''}

  public constructor() {
    super('config.json')
  }

  protected make(): Configuration {
    return Config.DEFAULT_CONFIG
  }
}
