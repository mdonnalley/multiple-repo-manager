import * as os from 'os';
import * as path from 'path';
import { readFile } from 'fs/promises';

export const MPM_DIR_NAME = '.mpm';
export const MPM_DIR = path.join(os.homedir(), MPM_DIR_NAME);

export type Repository = {
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  html_url: string;
  clone_url: string;
  ssh_url: string;
};

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
