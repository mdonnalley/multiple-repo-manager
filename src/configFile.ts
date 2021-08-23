import { access, readFile, stat, writeFile } from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { Stats } from 'fs';
import { AsyncOptionalCreatable } from '@salesforce/kit';
import { Directory } from './directory';

export interface JsonMap<T = unknown> {
  [key: string]: T;
}

export abstract class ConfigFile<T extends JsonMap> extends AsyncOptionalCreatable<string> {
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
    if (await this.exists(this.filepath)) {
      const config = JSON.parse(await readFile(this.filepath, 'utf-8')) as T;
      this.contents = config;
      return this.contents;
    } else {
      this.contents = this.make();
      await this.write();
      return this.contents;
    }
  }

  public async write(newContents: T = this.contents): Promise<void> {
    await writeFile(this.filepath, JSON.stringify(newContents, null, 2));
  }

  public get(key: keyof T): T[keyof T] {
    return this.contents[key];
  }

  public getContents(): T {
    return this.contents;
  }

  public set(key: keyof T, value: T[keyof T]): void {
    this.contents[key] = value;
  }

  public async exists(filepath: string): Promise<boolean> {
    try {
      await access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  protected async init(): Promise<void> {
    await Directory.create({ name: ConfigFile.MPM_DIR });
    this.contents = await this.read();
    this.stats = await stat(this.filepath);
  }

  protected make(): T {
    return {} as T;
  }
}
