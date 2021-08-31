import * as path from 'path';
import * as yml from 'js-yaml';
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
    return yml.load(contents) as TasksMap;
  }

  protected format(contents: TasksMap): string {
    return yml.dump(contents);
  }
}
