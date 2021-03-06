import * as path from 'path';
import * as yml from 'js-yaml';
import { isEmpty } from 'lodash';
import { Config } from './config';
import { ConfigFile } from './configFile';

export type TasksMap = Record<string, string>;

export class Tasks extends ConfigFile<TasksMap> {
  public static FILE_NAME = 'tasks.yml';
  public static FILE_PATH = path.join(Config.MPM_DIR, Tasks.FILE_NAME);

  public constructor() {
    super(Tasks.FILE_NAME);
  }

  protected parse(contents: string): TasksMap {
    return (yml.load(contents) ?? {}) as TasksMap;
  }

  protected format(contents: TasksMap): string {
    if (isEmpty(contents)) return '';
    return yml.dump(contents);
  }
}
