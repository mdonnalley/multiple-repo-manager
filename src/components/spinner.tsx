import {Spinner as InkSpinner, ThemeProvider, defaultTheme, extendTheme} from '@inkjs/ui'
import {type TextProps} from 'ink'
import React from 'react'

const customTheme = extendTheme(defaultTheme, {
  components: {
    Spinner: {
      styles: {
        frame: (): TextProps => ({
          color: 'cyan',
        }),
      },
    },
  },
})

export default function Spinner({label}: {readonly label: string}) {
  return (
    <ThemeProvider theme={customTheme}>
      <InkSpinner label={label} type="arc" />
    </ThemeProvider>
  )
}
