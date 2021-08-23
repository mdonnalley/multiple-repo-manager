import { Command } from '@oclif/core';

export class Cd extends Command {
  public static readonly description = 'cd into a github repository.';
  public static readonly flags = {};
  public static readonly args = [
    {
      name: 'repo',
      description: 'Name of repository.',
      required: true,
    },
  ];

  public async run(): Promise<void> {
    /**
     * Do nothing. The cd command is written to .bashrc on setup since we cannot change the directory
     * of the executing shell - instead we must use bash. This command is here just so that it shows up in
     * the help output.
     *
     * See the MpmCd class for more context.
     */
  }
}
