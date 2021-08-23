import { access, readFile, stat, writeFile } from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { Stats } from 'fs';
import { AsyncOptionalCreatable } from '@salesforce/kit';
import { Directory } from './directory';

export abstract class ConfigFile<T> extends AsyncOptionalCreatable<string> {
  public static MPM_DIR_NAME = '.mpm';
  public static MPM_DIR = path.join(os.homedir(), ConfigFile.MPM_DIR_NAME);

  public stats: Stats;

  private contents: T;
  private filepath: string;

  public constructor(filename: string) {
    super(filename);
    this.filepath = path.join(ConfigFile.MPM_DIR, filename);
  }

  public async read(): Promise<T> {
    this.contents = JSON.parse(await readFile(this.filepath, 'utf-8')) as T;
    return this.contents;
  }

  public async write(newContents: T = this.contents): Promise<void> {
    await writeFile(this.filepath, JSON.stringify(newContents, null, 2));
  }

  public getContents(): T {
    return this.contents;
  }

  public get(key: keyof T): T[keyof T] {
    return this.contents[key];
  }

  public has(key: keyof T): boolean {
    const keys = Object.keys(this.getContents()) as Array<keyof T>;
    return keys.includes(key);
  }

  public set(key: keyof T, value: T[keyof T]): void {
    this.contents[key] = value;
  }

  public update(key: keyof T, value: T[keyof T]): void {
    this.contents[key] = Object.assign({}, this.contents[key], value);
  }

  public unset(key: keyof T): void {
    delete this.contents[key];
  }

  public async exists(): Promise<boolean> {
    try {
      await access(this.filepath);
      return true;
    } catch {
      return false;
    }
  }

  protected async init(): Promise<void> {
    await Directory.create({ name: ConfigFile.MPM_DIR });
    if (await this.exists()) {
      this.contents = await this.read();
    } else {
      this.contents = this.make();
      await this.write();
    }

    this.stats = await stat(this.filepath);
  }

  protected make(): T {
    return {} as T;
  }
}
