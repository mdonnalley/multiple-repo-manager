import {Box, Text} from 'ink'
import React from 'react'

function Suggestions({suggestions}: {readonly suggestions: string[]}) {
  if (suggestions.length === 0) return
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

function HelpOutput({helpOutput}: {readonly helpOutput: string[]}) {
  if (helpOutput.length === 0) return
  return (
    <Box flexDirection="column" marginLeft={2} marginTop={1}>
      {helpOutput.map((s) => (
        <Text key={s}>{s}</Text>
      ))}
    </Box>
  )
}

type Props = {
  readonly helpOutput: string[]
  readonly message: string
  readonly suggestions?: string[]
}

export default function Error({helpOutput, message, suggestions}: Props) {
  return (
    <Box borderColor="red" borderStyle="single" flexDirection="column" padding={1}>
      <Box marginRight={1}>
        <Text color="red">✖ </Text>
        <Text>{message}</Text>
      </Box>
      <Suggestions suggestions={suggestions ?? []} />
      <HelpOutput helpOutput={helpOutput} />
    </Box>
  )
}
