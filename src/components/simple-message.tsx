import {Box, Text} from 'ink'
import React from 'react'

export default function SimpleMessage({message}: {readonly message: string}) {
  return (
    <Box flexDirection="column">
      <Text>{message}</Text>
    </Box>
  )
}
