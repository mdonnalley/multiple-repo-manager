import * as path from 'path';
import * as os from 'os';
import { writeFile } from 'fs/promises';
import { AsyncCreatable } from '@salesforce/kit';
import { ConfigFile } from './configFile';
import { BashRc } from './bashRc';

const AUTO_COMPLETE_TEMPLATE = `#/usr/bin/env bash

_repo_completions()
{
    local cur
    COMPREPLY=()
    cur=\${COMP_WORDS[COMP_CWORD]}
    code_dir=@CODE_DIRECTORY@
    COMPREPLY=($( compgen -W "$(ls -d $code_dir/**/* | xargs basename)" -- $cur ))
}
`;

const COMPLETE = 'complete -F _repo_completions mpm';

export class AutoComplete extends AsyncCreatable<string> {
  public static LOCATION = path.join(ConfigFile.MPM_DIR, 'autocomplete.bash');
  public static COMMANDS = ['view', 'v', 'open', 'o', 'exec', 'x', 'cd', 'remove', 'rm'];
  public constructor(private directory: string) {
    super(directory);
  }

  protected async init(): Promise<void> {
    if (process.platform === 'win32') return;
    const bashRc = await BashRc.create();
    let contents = AUTO_COMPLETE_TEMPLATE.replace('@CODE_DIRECTORY@', this.directory);

    for (const cmd of AutoComplete.COMMANDS) {
      contents += `${COMPLETE} ${cmd}${os.EOL}`;
    }
    await writeFile(AutoComplete.LOCATION, contents);

    bashRc.append(`source ${AutoComplete.LOCATION}`);
    await bashRc.write();
    bashRc.source();
  }
}
