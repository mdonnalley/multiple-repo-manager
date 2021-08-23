import * as path from 'path';
import { writeFile } from 'fs/promises';
import { AsyncOptionalCreatable } from '@salesforce/kit';
import { ConfigFile } from './configFile';
import { BashRc } from './bashRc';

const TEMPLATE = `
#/usr/bin/env bash

function mpm {
  if [[ "$1" == "cd" ]]; then
    cd $(mpm where $2)
  else
    mpm "$@"
  fi
}
`;

/**
 * It's not possible to use node to change the directory of the executing
 * shell so instead we write a mpm function to the .bashrc so that we can
 * capture the `mpm cd` execution and use bash instead.
 */
export class MpmCd extends AsyncOptionalCreatable {
  public static LOCATION = path.join(ConfigFile.MPM_DIR, 'mpmcd.bash');
  public constructor() {
    super();
  }

  protected async init(): Promise<void> {
    if (process.platform === 'win32') return;

    await writeFile(MpmCd.LOCATION, TEMPLATE);
    const bashRc = await BashRc.create();
    bashRc.append(`source ${MpmCd.LOCATION}`);
    await bashRc.write();
    bashRc.source();
  }
}
