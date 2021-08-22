import { Octokit } from '@octokit/core';
import { ConfigFile, JsonMap } from './configFile';
import { getToken } from './util';

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

export interface RepoIndex extends JsonMap {
  [key: string]: Repository;
}

export class Repos extends ConfigFile<RepoIndex> {
  private octokit!: Octokit;

  public constructor() {
    super('repos.json');
  }

  public async fetch(org: string, repo: string | null): Promise<Repository[]> {
    if (repo) {
      const response = await this.octokit.request('GET /repos/{owner}/{repo}', { owner: org, repo });
      return [response.data] as Repository[];
    } else {
      const response = await this.octokit.request('GET /orgs/{org}/repos', { org });
      return response.data as Repository[];
    }
  }

  protected async init(): Promise<void> {
    this.octokit = new Octokit({ auth: getToken() });
    await super.init();
  }
}
