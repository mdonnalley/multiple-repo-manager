import {Box, Text} from 'ink'
import crypto from 'node:crypto'
import React from 'react'

function createHash(input: string, index: number): string {
  return crypto.createHash('sha256').update(input).digest('hex') + `_${index}`
}

export default function Help({helpOutput}: {readonly helpOutput: string[]}) {
  if (helpOutput.length === 0) return
  return (
    <Box borderColor="green" borderStyle="round" flexDirection="column" padding={2} paddingTop={0}>
      {helpOutput.map((s, idx) => (
        <Text key={createHash(s, idx)}>{s}</Text>
      ))}
    </Box>
  )
}
