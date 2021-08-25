import * as os from 'os';
import * as path from 'path';

export const MPM_DIR_NAME = '.multi';
export const MPM_DIR = path.join(os.homedir(), MPM_DIR_NAME);

export function getToken(): string {
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GH_TOKEN or GITHUB_TOKEN must be set in the environment');
  }
  return token;
}
