import * as yml from 'js-yaml'
import isEmpty from 'lodash/isEmpty.js'
import path from 'node:path'

import {ConfigFile} from './config-file.js'
import {Config} from './config.js'

export type TasksMap = Record<string, string>

export class Tasks extends ConfigFile<TasksMap> {
  public static FILE_NAME = 'tasks.yml'
  public static FILE_PATH = path.join(Config.MPM_DIR, Tasks.FILE_NAME)

  public constructor() {
    super(Tasks.FILE_NAME)
  }

  protected format(contents: TasksMap): string {
    if (isEmpty(contents)) return ''
    return yml.dump(contents, {lineWidth: -1})
  }

  protected parse(contents: string): TasksMap {
    return (yml.load(contents) ?? {}) as TasksMap
  }
}
