import {Box, Text} from 'ink'
import React from 'react'

export default function Error({message}: {readonly message: string}) {
  return (
    <Box borderColor="red" borderStyle="single" flexDirection="row" padding={1}>
      <Box marginRight={1}>
        <Text color="red">✖</Text>
      </Box>
      <Box marginRight={1}>
        <Text>{message}</Text>
      </Box>
    </Box>
  )
}
