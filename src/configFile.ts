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
  public filepath: string;

  private contents: T;

  public constructor(filename: string) {
    super(filename);
    this.filepath = path.join(ConfigFile.MPM_DIR, filename);
  }

  public async read(): Promise<T> {
    this.contents = this.parse(await readFile(this.filepath, 'utf-8'));
    return this.contents;
  }

  public async write(newContents: T = this.contents): Promise<void> {
    await writeFile(this.filepath, this.format(newContents));
  }

  public getContents(): T {
    return this.contents;
  }

  public get(key: keyof T): T[keyof T] {
    return this.contents[key];
  }

  public entries(): Array<[keyof T, T[keyof T]]> {
    return Object.entries(this.getContents()) as Array<[keyof T, T[keyof T]]>;
  }

  public keys(): Array<keyof T> {
    return Object.keys(this.getContents()) as Array<keyof T>;
  }

  public has(key: keyof T): boolean {
    return this.keys().includes(key);
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

  protected parse(contents: string): T {
    return JSON.parse(contents) as T;
  }

  protected format(contents: T): string {
    return JSON.stringify(contents, null, 2);
  }
}
