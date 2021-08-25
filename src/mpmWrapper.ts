import * as path from 'path';
import { writeFile } from 'fs/promises';
import { AsyncOptionalCreatable } from '@salesforce/kit';
import { ConfigFile } from './configFile';
import { BashRc } from './bashRc';
import { Aliases } from './aliases';

const TEMPLATE = `#/usr/bin/env bash

function _mpm {
  aliases=$(sed -e 's/\:.*//;s/ .*//' @ALIASES_PATH@ | tr '\\n' ' ')
  mpm_exec=$(which mpm)

  if [[ " $aliases " =~ .*\\ $1\\ .* ]]; then
    if [[ "$2" == "--help" ]]; then
      echo "--help is not supported on aliased commands"
    else
    $(eval $mpm_exec alias resolve $1)
    fi
  elif [[ "$1" == "cd" && "$2" != "--help" ]]; then
    cd $(eval $mpm_exec where $2)
  else
    eval $mpm_exec "$@"
  fi
}

alias mpm='_mpm'
`;

/**
 * It's not possible to use node to change the directory of the executing
 * shell so instead we write a mpm function to the .bashrc so that we can
 * capture the `mpm cd` execution and use bash instead.
 */
export class MpmWrapper extends AsyncOptionalCreatable {
  public static FILE_PATH = path.join(ConfigFile.MPM_DIR, 'mpm-wrapper.bash');
  public constructor() {
    super();
  }

  protected async init(): Promise<void> {
    if (process.platform === 'win32') return;
    const aliases = await Aliases.create();
    const contents = TEMPLATE.replace('@ALIASES_PATH@', aliases.filepath);
    await writeFile(MpmWrapper.FILE_PATH, contents);
    const bashRc = await BashRc.create();
    bashRc.append(`source ${MpmWrapper.FILE_PATH}`);
    await bashRc.write();
  }
}
