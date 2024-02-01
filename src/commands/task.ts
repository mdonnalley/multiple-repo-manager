import { spawn } from 'child_process';
import { Args, Command, Flags } from '@oclif/core';
import { Tasks } from '../tasks.js';

export default class Task extends Command {
  public static summary = 'Set or unset an executable task.';
  public static description = 'Provide an empty to value to unset the task. This feature is not support on Windows.';
  public static examples = [
    {
      description: 'Set a task',
      command: '<%= config.bin %> <%= command.id %> build=yarn build',
    },
    {
      description: 'Set a task that uses multi exec',
      command:
        // eslint-disable-next-line max-len
        '<%= config.bin %> <%= command.id %> circle=multi exec . open https://app.circleci.com/pipelines/github/{repo.fullName}',
    },
    {
      description: 'Unset a task',
      command: '<%= config.bin %> <%= command.id %> build=',
    },
    {
      description: 'Set a task interactively',
      command: '<%= config.bin %> <%= command.id %> build --interactive',
    },
  ];
  public static strict = false;
  public static flags = {
    interactive: Flags.boolean({
      description: 'Open a vim editor to add your task',
      default: false,
    }),
  };

  public static args = {
    keyValue: Args.string({
      description: 'task=value',
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args, argv, flags } = await this.parse(Task);
    const keyValue = args.keyValue;

    if (!flags.interactive && !keyValue.includes('=')) {
      process.exitCode = 1;
      throw new Error(`The provided argument ${args.keyValue} is not a valid key=value pair.`);
    }

    const tasks = await Tasks.create();
    const [task, firstPart] = keyValue.split('=');
    if (flags.interactive) {
      tasks.set(task, '');
      await tasks.write();
      spawn('vim', [tasks.filepath], {
        stdio: 'inherit',
        detached: true,
      });
      await tasks.write();
    } else {
      const executable = firstPart ? firstPart + ' ' + argv.splice(argv.indexOf(keyValue) + 1).join(' ') : null;
      if (!executable) {
        tasks.unset(task);
      } else {
        tasks.set(task, executable);
      }
      await tasks.write();
      if (executable) {
        this.log(`${task} was successfully created.`);
      } else {
        this.log(`${task} was successfully removed.`);
      }
    }
  }
}
