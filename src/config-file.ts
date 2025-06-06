import {Stats} from 'node:fs'
import {access, readFile, stat, writeFile} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import {Directory} from './directory.js'

export abstract class ConfigFile<T extends Record<string, unknown>> {
  public static MPM_DIR = path.join(os.homedir(), '.multi')
  public filepath: string
  public stats!: Stats
  private contents!: T

  public constructor(filename: string) {
    this.filepath = path.join(ConfigFile.MPM_DIR, filename)
  }

  public entries(): Array<[keyof T, T[keyof T]]> {
    return Object.entries(this.getContents()) as Array<[keyof T, T[keyof T]]>
  }

  public async exists(filepath = this.filepath): Promise<boolean> {
    try {
      await access(filepath)
      return true
    } catch {
      return false
    }
  }

  protected format(contents: T): string {
    return JSON.stringify(contents, null, 2)
  }

  public get(key: keyof T): T[keyof T] {
    return this.contents[key]
  }

  public getContents(): T {
    return this.contents
  }

  public has(key: keyof T): boolean {
    return this.keys().includes(key)
  }

  public async init() {
    await new Directory({name: ConfigFile.MPM_DIR}).init()
    if (await this.exists()) {
      this.contents = await this.read()
    } else {
      this.contents = this.make()
      await this.write()
    }

    this.stats = await stat(this.filepath)

    return this
  }

  public keys(): Array<keyof T> {
    return Object.keys(this.getContents()) as Array<keyof T>
  }

  protected make(): T {
    return {} as T
  }

  protected parse(contents: string): T {
    return JSON.parse(contents) as T
  }

  public async read(): Promise<T> {
    this.contents = this.parse(await readFile(this.filepath, 'utf8'))
    return this.contents
  }

  public set(key: keyof T, value: T[keyof T]): void {
    this.contents[key] = value
  }

  public unset(key: keyof T): void {
    delete this.contents[key]
  }

  public update(key: keyof T, value: T[keyof T]): void {
    if (typeof this.contents[key] === 'string' && typeof value === 'string') {
      this.contents[key] = value
      return
    }

    // @ts-expect-error because we know that value is an object at this point.
    this.contents[key] = {...this.contents[key], ...value}
  }

  public values(): Array<T[keyof T]> {
    return Object.values(this.getContents()) as Array<T[keyof T]>
  }

  public async write(newContents: T = this.contents): Promise<void> {
    await writeFile(this.filepath, this.format(newContents))
  }
}
