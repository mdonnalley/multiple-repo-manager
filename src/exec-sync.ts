import {execSync as cpExecSync} from 'node:child_process'

function execSync(command: string, options?: {silent?: boolean}): string {
  const result = cpExecSync(command, {encoding: 'utf8'}).trim()
  if (!options?.silent) process.stdout.write(result + '\n')

  return result
}

export default execSync
