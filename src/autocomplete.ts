import * as path from 'path';
import { writeFile } from 'fs/promises';
import { AsyncCreatable } from '@salesforce/kit';
import { ConfigFile } from './configFile';
import { BashRc } from './bashRc';

const AUTO_COMPLETE = `_mpm_autocomplete()
{
    local cur prev

    cur=\${COMP_WORDS[COMP_CWORD]}
    prev=\${COMP_WORDS[COMP_CWORD-1]}
    code_dir=@CODE_DIRECTORY@
    case \${COMP_CWORD} in
        1)
            COMPREPLY=($(compgen -W "@COMMANDS@" -- \${cur}))
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

complete -F _mpm_autocomplete mpm
`;

export class AutoComplete extends AsyncCreatable<string> {
  public static LOCATION = path.join(ConfigFile.MPM_DIR, 'autocomplete.bash');
  public static REPO_COMMANDS = ['view', 'v', 'open', 'o', 'exec', 'x', 'cd', 'remove', 'rm'];
  public static MPM_COMMANDS = ['add', 'cd', 'exec', 'list', 'open', 'remove', 'setup', 'view', 'where'];

  public constructor(private directory: string) {
    super(directory);
  }

  protected async init(): Promise<void> {
    if (process.platform === 'win32') return;
    const bashRc = await BashRc.create();

    const contents = AUTO_COMPLETE.replace('@CODE_DIRECTORY@', this.directory)
      .replace('@COMMANDS@', AutoComplete.MPM_COMMANDS.join(' '))
      .replace('@REPO_COMMANDS@', AutoComplete.REPO_COMMANDS.join(' | '));

    await writeFile(AutoComplete.LOCATION, contents);

    bashRc.append(`source ${AutoComplete.LOCATION}`);
    await bashRc.write();
    bashRc.source();
  }
}
