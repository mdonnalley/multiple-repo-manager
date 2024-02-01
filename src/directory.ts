import {AsyncCreatable} from '@salesforce/kit'
import {access, mkdir} from 'node:fs/promises'

export class Directory extends AsyncCreatable {
  public constructor(private options: DirectoryOptions) {
    super(options)
  }

  public get name(): string {
    return this.options.name
  }

  protected async init(): Promise<void> {
    try {
      await access(this.options.name)
    } catch {
      await mkdir(this.options.name, {recursive: true})
    }
  }
}

export type DirectoryOptions = {
  name: string
}
