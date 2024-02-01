import * as yml from 'js-yaml'
import isEmpty from 'lodash.isempty'
import path from 'node:path'

import {Config} from './config.js'
import {ConfigFile} from './config-file.js'

export type AliasesMap = Record<string, string>

export class Aliases extends ConfigFile<AliasesMap> {
  public static FILE_NAME = 'aliases.yml'
  public static FILE_PATH = path.join(Config.MPM_DIR, Aliases.FILE_NAME)

  public constructor() {
    super(Aliases.FILE_NAME)
  }

  protected format(contents: AliasesMap): string {
    if (isEmpty(contents)) return ''
    return yml.dump(contents)
  }

  protected parse(contents: string): AliasesMap {
    return (yml.load(contents) ?? {}) as AliasesMap
  }
}
