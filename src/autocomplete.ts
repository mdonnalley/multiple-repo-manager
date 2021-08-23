import * as path from 'path';
import * as os from 'os';
import { writeFile, appendFile } from 'fs/promises';
import { exec } from 'shelljs';
import { AsyncCreatable } from '@salesforce/kit';
import { ConfigFile } from './configFile';

const AUTO_COMPLETE_TEMPLATE = `
#/usr/bin/env bash

_repo_completions()
{
    local cur
    COMPREPLY=()
    cur=\${COMP_WORDS[COMP_CWORD]}
    code_dir=@CODE_DIRECTORY@
    COMPREPLY=($( compgen -W "$(ls -d $code_dir/*/ | cut -d "/" -f 5)" -- $cur ) )
}
`;

const COMPLETE = 'complete -F _repo_completions mpm';

export class AutoComplete extends AsyncCreatable<string> {
  public static LOCATION = path.join(ConfigFile.MPM_DIR, 'autocomplete.bash');
  public static COMMANDS = ['view', 'open'];
  public constructor(private directory: string) {
    super(directory);
  }

  protected async init(): Promise<void> {
    if (process.platform === 'win32') return;

    let contents = AUTO_COMPLETE_TEMPLATE.replace('@CODE_DIRECTORY@', this.directory);
    for (const cmd of AutoComplete.COMMANDS) {
      contents += `${COMPLETE} ${cmd}${os.EOL}`;
    }
    await writeFile(AutoComplete.LOCATION, contents);
    const bashrcPath = path.join(os.homedir(), '.bashrc');
    await appendFile(bashrcPath, `source ${AutoComplete.LOCATION}`);
    exec(`source ${bashrcPath}`);
  }
}
