import { ConfigFile } from './configFile';

export class Aliases extends ConfigFile<Record<string, string>> {
  public constructor() {
    super('aliases.json');
  }
}
