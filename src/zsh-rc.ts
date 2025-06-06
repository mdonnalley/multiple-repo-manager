import {readFile, writeFile} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import execSync from './exec-sync.js'

export class ZshRc {
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

  public async init() {
    if (process.platform === 'win32') return this
    await this.read()
    return this
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
