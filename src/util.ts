import {Errors, ux} from '@oclif/core'
import oclifSpinners from '@oclif/core/lib/cli-ux/action/spinners.js'
import path from 'node:path'

export function getToken(): string {
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN
  if (!token) {
    throw new Errors.CLIError('GH_TOKEN or GITHUB_TOKEN must be set in the environment')
  }

  return token
}

export function parseRepoNameFromPath(): string {
  return process.cwd().split(path.sep).reverse().slice(0, 2).reverse().join(path.sep)
}

export function startRandomSpinner(message: string): void {
  const spinners = [
    'arc' as keyof typeof oclifSpinners.default,
    'bouncingBall' as keyof typeof oclifSpinners.default,
    'earth' as keyof typeof oclifSpinners.default,
    'hexagon' as keyof typeof oclifSpinners.default,
    'monkey' as keyof typeof oclifSpinners.default,
    'pong' as keyof typeof oclifSpinners.default,
    'smiley' as keyof typeof oclifSpinners.default,
    'triangle' as keyof typeof oclifSpinners.default,
  ]

  const randomSpinner = spinners[Math.floor(Math.random() * spinners.length)]
  ux.action.start(message, undefined, {style: randomSpinner})
}
