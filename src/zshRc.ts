import * as path from 'path';
import * as os from 'os';
import { writeFile, readFile } from 'fs/promises';
import { exec } from 'shelljs';
import { AsyncOptionalCreatable } from '@salesforce/kit';

export class ZshRc extends AsyncOptionalCreatable {
  public static LOCATION = path.join(os.homedir(), '.zshrc');

  private contents!: string;

  public constructor() {
    super();
  }

  public async read(): Promise<string> {
    this.contents = await readFile(ZshRc.LOCATION, 'utf-8');
    return this.contents;
  }

  public async write(): Promise<void> {
    await writeFile(ZshRc.LOCATION, this.contents);
  }

  public has(str: string): boolean {
    return this.contents.includes(str);
  }

  public append(str: string): void {
    if (!this.has(str)) {
      this.contents += `${os.EOL}${str}`;
    }
  }

  public source(): void {
    exec(`source ${ZshRc.LOCATION}`);
  }

  protected async init(): Promise<void> {
    if (process.platform === 'win32') return;
    await this.read();
  }
}
