import {Args, Command} from '@oclif/core'

export default class Cd extends Command {
  public static args = {
    repo: Args.string({description: 'Name of repository.', required: true}),
  }

  public static description = 'cd into a repository.'

  public static flags = {}

  public async run(): Promise<void> {
    /**
     * Do nothing. The cd command is written to .zshrc on setup since we cannot change the directory
     * of the executing shell - instead we must use bash. This command is here just so that it shows up in
     * the help output.
     *
     * See the MultiWrapper class for more context.
     */
  }
}
