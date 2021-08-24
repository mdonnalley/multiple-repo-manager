import * as path from 'path';
import { writeFile } from 'fs/promises';
import { AsyncOptionalCreatable } from '@salesforce/kit';
import { ConfigFile } from './configFile';
import { BashRc } from './bashRc';
import { Aliases } from './aliases';

const TEMPLATE = `#/usr/bin/env bash

function _mpm {
  @ALIASES@
  if [[ "$1" == "cd" && "$2" != "--help" ]]; then
    cd $(mpm where $2)
  else
    mpm "$@"
  fi
}

alias mpm='_mpm'
`;

const ALIASED_CMD_TEMPLATE = `
  if [[ "$1" == "@CMD@" ]]; then
    if [[ "$2" == "--help" ]]; then
      echo "--help is not supported on aliased commands"
    else
      @VALUE@
    fi
    return
  fi
`;

/**
 * It's not possible to use node to change the directory of the executing
 * shell so instead we write a mpm function to the .bashrc so that we can
 * capture the `mpm cd` execution and use bash instead.
 */
export class MpmWrapper extends AsyncOptionalCreatable {
  public static LOCATION = path.join(ConfigFile.MPM_DIR, 'mpm-wrapper.bash');
  public constructor() {
    super();
  }

  protected async init(): Promise<void> {
    if (process.platform === 'win32') return;
    const aliases = await Aliases.create();
    let aliasesString = '';
    for (const [cmd, value] of aliases.entries()) {
      aliasesString += ALIASED_CMD_TEMPLATE.replace('@CMD@', cmd).replace('@VALUE@', value);
    }
    const contents = TEMPLATE.replace('@ALIASES@', aliasesString);
    await writeFile(MpmWrapper.LOCATION, contents);
    const bashRc = await BashRc.create();
    bashRc.append(`source ${MpmWrapper.LOCATION}`);
    await bashRc.write();
  }
}
