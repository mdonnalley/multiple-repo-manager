import * as path from 'path';
import { writeFile } from 'fs/promises';
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

complete -F _repo_completions mpm view
complete -F _repo_completions mpm open
`;

export class AutoComplete extends AsyncCreatable<string> {
  public static LOCATION = path.join(ConfigFile.MPM_DIR, 'autocomplete.bash');
  public constructor(private directory: string) {
    super(directory);
  }

  protected async init(): Promise<void> {
    if (process.platform === 'win32') return;

    const contents = AUTO_COMPLETE_TEMPLATE.replace('@CODE_DIRECTORY@', this.directory);
    await writeFile(AutoComplete.LOCATION, contents);
    exec(`source ${AutoComplete.LOCATION}`, { silent: true });
  }
}
