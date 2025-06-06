import {Command, Errors, Help} from '@oclif/core'
import {render} from 'ink'
import {format} from 'node:util'
import React from 'react'

import {Error as ErrorComponent} from './components/index.js'

class ErrorHelp extends Help {
  public output: string[] = []

  public async getHelpOutput(argv: string[]): Promise<string[]> {
    await super.showHelp(argv)
    return this.output
  }

  protected log(...args: string[]) {
    this.output.push(format.apply(this, args))
  }
}

export default abstract class BaseCommand extends Command {
  public async catch(err: Errors.CLIError & {showHelp?: boolean}) {
    const formatted = err.message
      .split('\n')
      .filter((line) => line !== 'See more help with --help')
      .join('\n')

    const helpOutput: string[] = []
    if (err.showHelp) {
      const help = new ErrorHelp(this.config, {
        ...(this.config.pjson.oclif.helpOptions ?? this.config.pjson.helpOptions),
        sections: ['flags', 'usage', 'arguments'],
      })
      helpOutput.push(...(await help.getHelpOutput(process.argv.slice(2))))
    }

    render(<ErrorComponent helpOutput={helpOutput} message={formatted} suggestions={err.suggestions} />, {
      stdout: process.stderr,
    })
    this.exit(err.oclif?.exit || 1)
  }
}
