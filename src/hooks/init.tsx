import {Alert} from '@inkjs/ui'
import {Hook} from '@oclif/core'
import {Static, Text, render} from 'ink'
import React from 'react'

import {Repos} from '../repos.js'

const hook: Hook<'init'> = async function ({config}) {
  if (await Repos.needsRefresh()) {
    const warnings = ['refresh-warning']
    render(
      <Static items={warnings}>
        {(warning) => (
          <Alert key={warning} title="Warning" variant="warning">
            <Text>
              Run <Text color="dim">{config.bin} refresh --all</Text> to refresh repos.json cache
            </Text>
          </Alert>
        )}
      </Static>,
      {
        stdout: process.stderr,
      },
    )
  }
}

export default hook
