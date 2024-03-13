import path from 'node:path'

export function parseRepoNameFromPath(): string {
  return process.cwd().split(path.sep).reverse().slice(0, 2).reverse().join(path.sep)
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length - 3)}...` : str
}
