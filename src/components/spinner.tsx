import {Spinner as InkSpinner, ThemeProvider, defaultTheme, extendTheme} from '@inkjs/ui'
import {Instance, type TextProps, render} from 'ink'
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

export class SpinnerRunner {
  private instance: Instance

  public constructor(label: string) {
    this.instance = render(<Spinner label={label} />)
  }

  public stop(): void {
    this.instance.clear()
    this.instance.unmount()
  }
}
