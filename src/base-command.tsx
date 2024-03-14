import {Command, Errors} from '@oclif/core'
import {render} from 'ink'
import React from 'react'

import {Error as ErrorComponent} from './components/index.js'

export default abstract class BaseCommand extends Command {
  public async catch(err: Errors.CLIError) {
    const formatted = err.message
      .split('\n')
      .map((line) => line.trim())
      .join('\n')

    render(<ErrorComponent message={formatted} suggestions={err.suggestions} />, {
      stdout: process.stderr,
    })
    this.exit(err.oclif?.exit || 1)
  }
}
