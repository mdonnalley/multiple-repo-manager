import {AsyncOptionalCreatable} from '@salesforce/kit'
import {readFile, writeFile} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import execSync from './exec-sync.js'

export class ZshRc extends AsyncOptionalCreatable {
  public static LOCATION = path.join(os.homedir(), '.zshrc')

  private contents!: string

  public append(str: string): void {
    if (!this.has(str)) {
      this.contents += `${os.EOL}${str}`
    }
  }

  public has(str: string): boolean {
    return this.contents.includes(str)
  }

  protected async init(): Promise<void> {
    if (process.platform === 'win32') return
    await this.read()
  }

  public async read(): Promise<string> {
    this.contents = await readFile(ZshRc.LOCATION, 'utf8')
    return this.contents
  }

  public source(): void {
    execSync(`source ${ZshRc.LOCATION}`, {silent: true})
  }

  public async write(): Promise<void> {
    await writeFile(ZshRc.LOCATION, this.contents)
  }
}
