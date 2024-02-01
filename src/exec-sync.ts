import {ux} from '@oclif/core'
import {execSync as cpExecSync} from 'node:child_process'

function execSync(command: string, options?: {silent?: boolean}): string {
  const result = cpExecSync(command, {encoding: 'utf8'}).trim()
  if (!options?.silent) ux.log(result)

  return result
}

export default execSync
