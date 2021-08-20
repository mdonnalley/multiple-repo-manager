import { Command } from '@oclif/core';

export class Add extends Command {
  public static readonly description = 'Add a github org';
  public static readonly flags = {};

  // eslint-disable-next-line @typescript-eslint/require-await
  public async run(): Promise<void> {
    // eslint-disable-next-line no-console
    console.log('hello world');
  }
}
