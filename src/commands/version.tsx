import {Box, Newline, render, Text} from 'ink'
import BigText from 'ink-big-text'
import Gradient from 'ink-gradient'
import Link from 'ink-link'
import React from 'react'

import BaseCommand from '../base-command.js'

export default class Version extends BaseCommand {
  public static description = 'Print the version of <%= config.bin %>'

  public async run(): Promise<void> {
    render(
      <Box flexDirection="column">
        <Gradient name="pastel">
          <BigText text="multi" />
        </Gradient>
        <Text>{this.config.userAgent}</Text>
        <Newline />
        <Link url="https://github.com/mdonnalley/multiple-repo-manager>">View on GitHub</Link>
      </Box>,
    )
  }
}
