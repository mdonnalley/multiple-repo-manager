import * as path from 'path';
import { writeFile } from 'fs/promises';
import { AsyncCreatable } from '@salesforce/kit';
import { ConfigFile } from './configFile';
import { BashRc } from './bashRc';
import { Aliases } from './aliases';

const AUTO_COMPLETE = `_multi_autocomplete()
{
    local cur prev

    cur=\${COMP_WORDS[COMP_CWORD]}
    prev=\${COMP_WORDS[COMP_CWORD-1]}
    code_dir=@CODE_DIRECTORY@
    aliases=$(sed -e 's/\:.*//;s/ .*//' @ALIASES_PATH@ | tr '\\n' ' ')
    case \${COMP_CWORD} in
        1)
            COMPREPLY=($(compgen -W "@COMMANDS@ \${aliases}" -- \${cur}))
            ;;
        2)
            case \${prev} in
                @REPO_COMMANDS@)
                    COMPREPLY=($( compgen -W "$(ls -d $code_dir/**/* | xargs basename)" -- $cur ))
                    ;;
            esac
            ;;
        *)
            COMPREPLY=()
            ;;
    esac
}

complete -F _multi_autocomplete multi
`;

export class AutoComplete extends AsyncCreatable<string> {
  public static FILE_PATH = path.join(ConfigFile.MPM_DIR, 'autocomplete.bash');
  public static REPO_COMMANDS = ['view', 'v', 'open', 'o', 'exec', 'x', 'cd', 'remove', 'rm', 'where'];
  public static MPM_COMMANDS = ['add', 'cd', 'exec', 'list', 'open', 'remove', 'setup', 'view', 'where'];

  public constructor(private directory: string) {
    super(directory);
  }

  protected async init(): Promise<void> {
    if (process.platform === 'win32') return;
    const bashRc = await BashRc.create();

    const contents = AUTO_COMPLETE.replace('@CODE_DIRECTORY@', this.directory)
      .replace('@COMMANDS@', AutoComplete.MPM_COMMANDS.join(' '))
      .replace('@REPO_COMMANDS@', AutoComplete.REPO_COMMANDS.join(' | '))
      .replace('@ALIASES_PATH@', Aliases.FILE_PATH);

    await writeFile(AutoComplete.FILE_PATH, contents);

    bashRc.append(`source ${AutoComplete.FILE_PATH}`);
    await bashRc.write();
  }
}
