import {Box, Text} from 'ink'
import React from 'react'

export default function Help({helpOutput}: {readonly helpOutput: string[]}) {
  if (helpOutput.length === 0) return
  return (
    <Box borderColor="green" borderStyle="round" flexDirection="column" padding={2} paddingTop={0}>
      {helpOutput.map((s) => (
        <Text key={s}>{s}</Text>
      ))}
    </Box>
  )
}
