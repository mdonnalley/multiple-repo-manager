import {access, mkdir} from 'node:fs/promises'

export class Directory {
  public constructor(private options: DirectoryOptions) {}

  public get name(): string {
    return this.options.name
  }

  public async init() {
    try {
      await access(this.options.name)
      return this
    } catch {
      await mkdir(this.options.name, {recursive: true})
      return this
    }
  }
}

export type DirectoryOptions = {
  name: string
}
