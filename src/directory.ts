import { access, mkdir } from 'fs/promises';
import { AsyncCreatable } from '@salesforce/kit';

export class Directory extends AsyncCreatable {
  public constructor(private options: Directory.Options) {
    super(options);
  }

  public get name(): string {
    return this.options.name;
  }

  protected async init(): Promise<void> {
    try {
      await access(this.options.name);
    } catch {
      await mkdir(this.options.name, { recursive: true });
    }
  }
}

export namespace Directory {
  export interface Options {
    name: string;
  }
}
