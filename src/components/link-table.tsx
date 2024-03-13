/* eslint-disable react/prop-types */
import {Table as InkTable} from '@alcalzone/ink-table'
import {Box, Text} from 'ink'
import Link from 'ink-link'
import React from 'react'

type Scalar = boolean | null | number | string | undefined
type ScalarDict = {
  [key: string]: Scalar
}

export type Props<T> = {
  readonly config: Record<string, string>
  readonly data: T[]
  readonly title: string
}

function MaybeLinkCell({children, links}: React.PropsWithChildren & {readonly links: Record<string, string>}) {
  const trimmed = (children as string).trim()
  if (links[trimmed]) {
    const whitespace = (children as string).length - trimmed.length
    return (
      <Text>
        <Link url={links[trimmed]}>{trimmed}</Link>
        {' '.repeat(whitespace)}
      </Text>
    )
  }

  return <Text>{children}</Text>
}

export default function LinkTable<T extends ScalarDict>({config, data, title}: Props<T>) {
  const links = Object.fromEntries(
    data.flatMap((row) =>
      Object.entries(config).map(([key, urlKey]) => {
        const url = row[urlKey]
        if (url) {
          return [row[key], url]
        }

        return []
      }),
    ),
  )
  const urlKeys = Object.values(config)
  const columns = [...new Set(data.flatMap((row) => Object.keys(row)))].filter((key) => !urlKeys.includes(key))

  return (
    <Box flexDirection="column">
      <Text bold>{title}</Text>
      <InkTable cell={(props) => <MaybeLinkCell {...props} links={links} />} columns={columns} data={data} />
    </Box>
  )
}

type MultiLinkTableProps = {
  readonly tables: Array<Props<ScalarDict>>
}

export function MultiLinkTable({tables}: MultiLinkTableProps) {
  return (
    <Box flexDirection="column">
      {tables.map((props) => (
        <Box key={props.title} paddingBottom={1}>
          <LinkTable config={props.config} data={props.data} title={props.title} />
        </Box>
      ))}
    </Box>
  )
}
