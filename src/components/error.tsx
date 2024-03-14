import {Box, Text} from 'ink'
import React from 'react'

function Suggestions({suggestions}: {readonly suggestions: string[]}) {
  if (suggestions.length === 0) return
  console.log(suggestions)
  return (
    <Box flexDirection="column" marginLeft={2} marginTop={1}>
      {suggestions.map((s) => (
        // eslint-disable-next-line perfectionist/sort-jsx-props
        <Text key={s} color="yellow">
          • {s}
        </Text>
      ))}
    </Box>
  )
}

export default function Error({message, suggestions}: {readonly message: string; readonly suggestions?: string[]}) {
  return (
    <Box borderColor="red" borderStyle="single" flexDirection="column" padding={1}>
      <Box marginRight={1}>
        <Text color="red">✖ </Text>
        <Text>{message}</Text>
      </Box>
      <Suggestions suggestions={suggestions ?? []} />
    </Box>
  )
}
