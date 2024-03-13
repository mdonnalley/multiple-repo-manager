import {Box, Text} from 'ink'
import React from 'react'

export default function Snippet({str}: {readonly str: string}) {
  return (
    <Box borderColor="green" borderStyle="round" padding={1} width="100%">
      <Text>{str}</Text>
    </Box>
  )
}
