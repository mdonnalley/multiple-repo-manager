import {Box, Newline, Text} from 'ink'
import React from 'react'

export default function Overview({body, header}: {readonly body: string; readonly header: string}) {
  return (
    <Box borderColor="cyan" borderStyle="round" flexDirection="column" padding={1}>
      <Box>
        <Text bold>{header}</Text>
      </Box>
      <Newline />
      <Box>
        <Text>{body}</Text>
      </Box>
    </Box>
  )
}
