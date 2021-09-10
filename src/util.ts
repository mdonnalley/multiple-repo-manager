import * as path from 'path';

export function getToken(): string {
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GH_TOKEN or GITHUB_TOKEN must be set in the environment');
  }
  return token;
}

export function parseRepoNameFromPath(): string {
  return process.cwd().split(path.sep).reverse().slice(0, 2).reverse().join(path.sep);
}
