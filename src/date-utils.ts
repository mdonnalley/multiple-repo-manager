import {Errors, Flags} from '@oclif/core'

const WEEK_DAY_OPTIONS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export const dateFlag = Flags.custom<Date>({
  async parse(input) {
    if (WEEK_DAY_OPTIONS.includes(input.toLowerCase())) {
      const today = new Date()
      const day = WEEK_DAY_OPTIONS.indexOf(input.toLowerCase())
      const diff = day - today.getDay()
      const date = new Date(today.setDate(today.getDate() - diff))
      date.setHours(0, 0, 0, 0)
      return date
    }

    const date = new Date(input)
    if (Number.isNaN(date.getTime())) {
      throw new Errors.CLIError('Invalid date')
    }

    return date
  },
})

export function convertDateStringToDaysAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  return `${days} days ago`
}

export function readableDate(dateString: string): string {
  const date = new Date(dateString)
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
}

export function weeksToMs(weeks: number): number {
  return weeks * 7 * 24 * 60 * 60 * 1000
}

export function msToSeconds(ms: number, decimalPoints: number): number {
  return Number.parseFloat((ms / 1000).toFixed(decimalPoints))
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
