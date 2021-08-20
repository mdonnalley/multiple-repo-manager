import * as path from 'path';
import { mkdir, access, writeFile, readFile } from 'fs/promises';
import { Octokit } from 'octokit';
import { exec } from 'shelljs';
import * as chalk from 'chalk';
import { Command, Flags } from '@oclif/core';
import { MPM_DIR } from '../util';

async function initDir(directory: string): Promise<void> {
  try {
    await access(directory);
  } catch {
    await mkdir(directory, { recursive: true });
  }
}

function getToken(): string {
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GH_TOKEN or GITHUB_TOKEN must be set in the environment');
  }
  return token;
}

function clone(url: string, dir: string): void {
  exec(`git -C ${dir} clone ${url}`, { silent: true });
}

async function addToCache(contents: Record<string, unknown>): Promise<void> {
  const filepath = path.join(MPM_DIR, 'repos.json');
  let existing: Record<string, unknown> = {};
  try {
    existing = JSON.parse(await readFile(filepath, 'utf-8')) as Record<string, unknown>;
  } catch {
    // do nothing
  }
  const merged = Object.assign(existing, contents);
  await writeFile(filepath, JSON.stringify(merged, null, 2));
}

export class Add extends Command {
  public static readonly description = 'Add a github org. Requires GH_TOKEN to be set in the environment';
  public static readonly flags = {
    directory: Flags.string({
      description: 'location to clone repo',
      char: 'd',
      required: true,
    }),
    'github-org': Flags.string({
      description: 'github org to clone',
      char: 'g',
      required: true,
    }),
    method: Flags.string({
      description: 'method to use for cloning',
      default: 'ssh',
      options: ['ssh', 'https'],
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Add);
    const directory = path.resolve(flags.directory);
    await initDir(directory);
    await initDir(MPM_DIR);
    const octokit = new Octokit({ auth: getToken() });
    const repos = await octokit.request('GET /orgs/{org}/repos', { org: flags['github-org'] });
    this.log(`Cloning all ${chalk.cyan.bold(flags['github-org'])} repositories into ${flags.directory}`);
    const cached = {} as Record<string, unknown>;
    for (const repo of repos.data) {
      const url = flags.method === 'ssh' ? repo.ssh_url : repo.clone_url;
      this.log(`  * ${chalk.bold(url)}`);
      clone(url, flags.directory);
      cached[repo.name] = repo;
      break;
    }
    await addToCache(cached);
  }
}
