/* eslint-disable perfectionist/sort-jsx-props */
import {Hook} from '@oclif/core'
import {Box, render, Static, Text} from 'ink'
import React from 'react'

import {Repos} from '../repos.js'

const hook: Hook<'init'> = async function ({config}) {
  if (await Repos.needsRefresh()) {
    const warnings = ['refresh-warning']
    render(
      <Static items={warnings}>
        {(warning) => (
          <Box key={warning} borderColor="yellow" borderStyle="round" padding={1}>
            <Text>
              ⚠ Run <Text color="dim">{config.bin} refresh --all</Text> to refresh repos.json cache
            </Text>
          </Box>
        )}
      </Static>,
      {
        stdout: process.stderr,
      },
    )
  }
}

export default hook
