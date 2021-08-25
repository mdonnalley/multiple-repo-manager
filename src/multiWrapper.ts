import * as path from 'path';
import { writeFile } from 'fs/promises';
import { AsyncOptionalCreatable } from '@salesforce/kit';
import { ConfigFile } from './configFile';
import { BashRc } from './bashRc';
import { Aliases } from './aliases';

const TEMPLATE = `#/usr/bin/env bash

function _multi {
  local aliases=$(sed -e 's/\:.*//;s/ .*//' @ALIASES_PATH@ | tr '\\n' ' ')
  local multi_exec=$(which multi)

  if [[ " $aliases " =~ .*\\ $1\\ .* ]]; then
    if [[ "$2" == "--help" ]]; then
      echo "--help is not supported on aliased commands"
    else
      if [[ -n \${@:2} ]]; then
        source <($multi_exec alias resolve $1) \${@:2}
      else
        source <($multi_exec alias resolve $1) ""
      fi
    fi
  elif [[ "$1" == "cd" && "$2" != "--help" ]]; then
    cd $(eval $multi_exec where $2)
  else
    eval $multi_exec "$@"
  fi
}

alias multi='_multi'
`;

/**
 * We wrap the `multi` executable for two reasons:
 * 1. To support executing user defined aliases
 * 2. To support the `cd` command. Node can't change the directory
 * of the executing shell, so we have to do it in bash.
 */
export class MultiWrapper extends AsyncOptionalCreatable {
  public static FILE_PATH = path.join(ConfigFile.MPM_DIR, 'multi-wrapper.bash');
  public constructor() {
    super();
  }

  protected async init(): Promise<void> {
    if (process.platform === 'win32') return;
    const aliases = await Aliases.create();
    const contents = TEMPLATE.replace('@ALIASES_PATH@', aliases.filepath);
    await writeFile(MultiWrapper.FILE_PATH, contents);
    const bashRc = await BashRc.create();
    bashRc.append(`source ${MultiWrapper.FILE_PATH}`);
    await bashRc.write();
  }
}
