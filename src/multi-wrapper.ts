import {writeFile} from 'node:fs/promises'
import path from 'node:path'

import {ConfigFile} from './config-file.js'
import {Tasks} from './tasks.js'
import {ZshRc} from './zsh-rc.js'

const TEMPLATE = `#!/usr/bin/env bash

function _multi {
  local tasks=$(sed -e 's/\:.*//;s/ .*//' @TASKS_PATH@ | tr '\\n' ' ')
  local multi_exec=$(which -p multi)

  if [[ " $tasks " =~ .*\\ $1\\ .* ]]; then
    if [[ " $@ " =~ .*\\ --help\\ .* ]]; then
      echo "--help is not supported on tasks"
    else
      if [[ -n \${@:2} ]]; then
        source <($multi_exec task get $1) \${@:2}
      else
        source <($multi_exec task get $1) ""
      fi
    fi
  elif [[ "$1" == "cd" && "$2" != "--help" ]]; then
    cd $(eval $multi_exec where $2)
  else
    eval $multi_exec "$@"
  fi
}

alias multi='_multi'
alias m='_multi'
`

/**
 * We wrap the `multi` executable for two reasons:
 * 1. To support executing user defined tasks
 * 2. To support the `cd` command. Node can't change the directory
 * of the executing shell, so we have to do it in bash.
 */
export class MultiWrapper {
  public static FILE_PATH = path.join(ConfigFile.MPM_DIR, 'multi-wrapper.bash')

  public async init(): Promise<void> {
    if (process.platform === 'win32') return
    const tasks = await new Tasks().init()
    const contents = TEMPLATE.replace('@TASKS_PATH@', tasks.filepath)
    await writeFile(MultiWrapper.FILE_PATH, contents)
    const zshRc = await new ZshRc().init()
    zshRc.append(`[[ -r ${MultiWrapper.FILE_PATH} ]] && source ${MultiWrapper.FILE_PATH}`)
    await zshRc.write()
  }
}
