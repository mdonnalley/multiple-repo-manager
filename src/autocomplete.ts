import {AsyncCreatable} from '@salesforce/kit'
import {writeFile} from 'node:fs/promises'
import path from 'node:path'

import {Aliases} from './aliases.js'
import {ConfigFile} from './config-file.js'
import {Tasks} from './tasks.js'
import {ZshRc} from './zsh-rc.js'

const AUTO_COMPLETE = `#!/usr/bin/env bash

_get_repo_autocomplete()
{
  echo $(ls -d @CODE_DIRECTORY@/*/* | sed 's/\\/*$//g' | awk -F/ '{print $(NF-1)"/"$(NF)" "$(NF)}') $aliases
}

_multi_autocomplete()
{
    local cur prev
    local tasks=$(sed -e 's/\:.*//;s/ .*//' @TASKS_PATH@ | tr '\\n' ' ')
    local aliases=$(sed -e 's/:.*//;s/ .*//'  @ALIASES_PATH@ | tr '\n' ' ')

    cur=\${COMP_WORDS[COMP_CWORD]}
    prev=\${COMP_WORDS[COMP_CWORD-1]}
    case \${COMP_CWORD} in
        1)
            COMPREPLY=($(compgen -W "@COMMANDS@ \${tasks}" -- \${cur}))
            ;;
        2)
            case \${prev} in
                @REPO_COMMANDS@)
                    COMPREPLY=($( compgen -W "$(_get_repo_autocomplete)" -- $cur ))
                    ;;
            esac

            case \${tasks} in
                *"$prev"*)
                    COMPREPLY=($( compgen -W "$(_get_repo_autocomplete)" -- $cur ))
                    ;;
            esac

            ;;
        *)
            COMPREPLY=()
            ;;
    esac
}

complete -F _multi_autocomplete _multi
`

export class AutoComplete extends AsyncCreatable<string> {
  public static COMMANDS = [
    'add',
    'alias',
    'cd',
    'diff',
    'exec',
    'list',
    'open',
    'pulls',
    'remove',
    'setup',
    'tasks',
    'view',
    'where',
  ]

  public static FILE_PATH = path.join(ConfigFile.MPM_DIR, 'autocomplete.bash')
  public static REPO_COMMANDS = ['view', 'v', 'open', 'o', 'exec', 'x', 'cd', 'remove', 'rm', 'where']

  public constructor(private directory: string) {
    super(directory)
  }

  protected async init(): Promise<void> {
    if (process.platform === 'win32') return
    const zshRc = await ZshRc.create()

    const contents = AUTO_COMPLETE.replace('@CODE_DIRECTORY@', this.directory)
      .replace('@COMMANDS@', AutoComplete.COMMANDS.join(' '))
      .replace('@REPO_COMMANDS@', AutoComplete.REPO_COMMANDS.join(' | '))
      .replace('@TASKS_PATH@', Tasks.FILE_PATH)
      .replace('@ALIASES_PATH@', Aliases.FILE_PATH)

    await writeFile(AutoComplete.FILE_PATH, contents)
    zshRc.append('source autoload -Uz bashcompinit && bashcompinit')
    zshRc.append(`[[ -r ${AutoComplete.FILE_PATH}]] && source ${AutoComplete.FILE_PATH}`)
    await zshRc.write()
  }
}
