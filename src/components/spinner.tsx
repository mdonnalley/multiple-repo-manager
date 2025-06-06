import spinners, {type SpinnerName} from 'cli-spinners'
import {Box, Instance, render, Text} from 'ink'
import React, {useEffect, useState} from 'react'

type UseSpinnerProps = {
  /**
   * Type of a spinner.
   * See [cli-spinners](https://github.com/sindresorhus/cli-spinners) for available spinners.
   *
   * @default dots
   */
  readonly type?: SpinnerName
}

type UseSpinnerResult = {
  frame: string
}

function useSpinner({type = 'dots2'}: UseSpinnerProps): UseSpinnerResult {
  const [frame, setFrame] = useState(0)
  const spinner = spinners[type]

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((previousFrame) => {
        const isLastFrame = previousFrame === spinner.frames.length - 1
        return isLastFrame ? 0 : previousFrame + 1
      })
    }, spinner.interval)

    return (): void => {
      clearInterval(timer)
    }
  }, [spinner])

  return {
    frame: spinner.frames[frame] ?? '',
  }
}

type SpinnerProps = UseSpinnerProps & {
  readonly isBold?: boolean
  /**
   * Label to show near the spinner.
   */
  readonly label?: string
  readonly labelPosition?: 'left' | 'right'
}

export default function Spinner({isBold, label, labelPosition = 'right', type}: SpinnerProps): React.ReactElement {
  const {frame} = useSpinner({type})

  return (
    <Box>
      {label && labelPosition === 'left' ? <Text>{label} </Text> : null}
      {isBold ? (
        <Text bold color="magenta">
          {frame}
        </Text>
      ) : (
        <Text color="magenta">{frame}</Text>
      )}
      {label && labelPosition === 'right' ? <Text> {label}</Text> : null}
    </Box>
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
