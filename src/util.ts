import * as os from 'os';
import * as path from 'path';
import { access, readFile } from 'fs/promises';
import { Repository } from './repos';

export const MPM_DIR_NAME = '.mpm';
export const MPM_DIR = path.join(os.homedir(), MPM_DIR_NAME);

export async function readRepos(): Promise<Record<string, Repository>> {
  const filepath = path.join(MPM_DIR, 'repos.json');
  try {
    return JSON.parse(await readFile(filepath, 'utf-8')) as Record<string, Repository>;
  } catch {
    throw new Error('No repos have been added.');
  }
}

export async function readRepo(repo: string): Promise<Repository> {
  const repos = await readRepos();
  if (repos[repo]) {
    return repos[repo];
  } else {
    throw new Error(`No repo named ${repo} found.`);
  }
}

export async function exists(filepath: string): Promise<boolean> {
  try {
    await access(filepath);
    return true;
  } catch {
    return false;
  }
}

export function getToken(): string {
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GH_TOKEN or GITHUB_TOKEN must be set in the environment');
  }
  return token;
}
