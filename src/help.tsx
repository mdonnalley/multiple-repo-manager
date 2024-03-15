import {Help} from '@oclif/core'
import {render} from 'ink'
import {format} from 'node:util'
import React from 'react'

import {Help as HelpComponent} from './components/index.js'

export default class CustomHelp extends Help {
  public output: string[] = []

  protected log(...args: string[]) {
    this.output.push(format.apply(this, args))
  }

  public async showHelp(argv: string[]) {
    await super.showHelp(argv)
    render(<HelpComponent helpOutput={this.output} />)
  }
}
