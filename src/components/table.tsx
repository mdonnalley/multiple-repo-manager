import {Table as InkTable} from '@alcalzone/ink-table'
import {Box, Text} from 'ink'
import React from 'react'

type Scalar = boolean | null | number | string | undefined
type ScalarDict = {
  [key: string]: Scalar
}

type Props<T> = {
  readonly data: T[]
  readonly title: string
}

export default function Table<T extends ScalarDict>({data, title}: Props<T>) {
  return (
    <Box flexDirection="column">
      <Text bold>{title}</Text>
      <InkTable data={data} />
    </Box>
  )
}
