import * as path from 'path';
import * as yml from 'js-yaml';
import { Config } from './config';
import { ConfigFile } from './configFile';

export type AliasesMap = Record<string, string>;

export class Aliases extends ConfigFile<AliasesMap> {
  public static FILE_NAME = 'aliases.yml';
  public static FILE_PATH = path.join(Config.MPM_DIR, Aliases.FILE_NAME);

  public constructor() {
    super(Aliases.FILE_NAME);
  }

  protected parse(contents: string): AliasesMap {
    return yml.load(contents) as AliasesMap;
  }

  protected format(contents: AliasesMap): string {
    return yml.dump(contents);
  }
}
