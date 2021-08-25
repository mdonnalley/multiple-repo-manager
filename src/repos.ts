/* eslint-disable camelcase */

import * as path from 'path';
import { mkdir } from 'fs/promises';
import { Octokit } from '@octokit/core';
import { Duration } from '@salesforce/kit';
import { exec } from 'shelljs';
import { cli } from 'cli-ux';
import * as chalk from 'chalk';
import { ConfigFile } from './configFile';
import { getToken } from './util';
import { Config } from './config';
import { Directory } from './directory';

export type CloneMethod = 'ssh' | 'https';

export type Repository = {
  name: string;
  fullName: string;
  org: string;
  urls: {
    html: string;
    clone: string;
    ssh: string;
  };
  updated: string;
  archived: boolean;
  defaultBranch: string;
  location?: string;
};

export type RepositoryResponse = {
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  html_url: string;
  clone_url: string;
  ssh_url: string;
  updated_at: string;
  archived: boolean;
  default_branch: string;
};

export interface RepoIndex {
  [key: string]: Repository;
}

export class Repos extends ConfigFile<RepoIndex> {
  public static REFRESH_TIME = Duration.hours(8);
  public directory!: Directory;
  private octokit!: Octokit;

  public constructor() {
    super('repos.json');
  }

  public getMatches(nameOrFullName: string): Repository[] {
    if (this.has(nameOrFullName)) {
      return [super.get(nameOrFullName)];
    }
    const matches = this.values().filter((v) => v.name === nameOrFullName);
    return matches ?? [];
  }

  public getOne(nameOrFullName: string): Repository {
    if (this.has(nameOrFullName)) {
      return super.get(nameOrFullName);
    } else {
      const matches = this.values().filter((v) => v.name === nameOrFullName);
      if (matches.length === 0) {
        throw new Error(`${nameOrFullName} has not been added yet.`);
      } else if (matches.length > 1) {
        const suggestions = matches.map((m) => m.fullName).join(', ');
        throw new Error(
          `Multiple repos found for ${nameOrFullName}. Please specify one of the following: ${suggestions}`
        );
      } else {
        return matches[0];
      }
    }
  }

  public async fetch(org: string, repo?: string | null): Promise<Repository[]> {
    if (repo) {
      const response = await this.octokit.request('GET /repos/{owner}/{repo}', { owner: org, repo });
      return [this.transform(response.data)];
    } else {
      const response = await this.octokit.request('GET /orgs/{org}/repos', { org });
      return response.data.map((r) => this.transform(r as RepositoryResponse));
    }
  }

  public async clone(repo: Repository, method: CloneMethod = 'ssh'): Promise<void> {
    const orgDir = path.join(this.directory.name, repo.org);
    await mkdir(orgDir, { recursive: true });
    const url = method === 'ssh' ? repo.urls.ssh : repo.urls.clone;
    exec(`git -C ${orgDir} clone ${url}`, { silent: true });

    try {
      this.set(repo.fullName, repo);
    } catch {
      // do nothing
    }
  }
  protected async init(): Promise<void> {
    await super.init();
    this.octokit = new Octokit({ auth: getToken() });
    const config = await Config.create();
    this.directory = await Directory.create({ name: config.get('directory') });

    if (this.needsRefresh()) await this.refresh();
  }

  private needsRefresh(): boolean {
    return new Date().getTime() - this.stats.mtime.getTime() > Repos.REFRESH_TIME.milliseconds;
  }

  private async refresh(): Promise<void> {
    const originalRepos = Object.keys(this.getContents());
    const orgs = Array.from(new Set(Object.values(this.getContents()).map((r) => r.org)));
    for (const org of orgs) {
      try {
        const orgRepos = await this.fetch(org);
        orgRepos.forEach((repo) => {
          if (originalRepos.includes(repo.fullName)) this.update(repo.fullName, repo);
        });
      } catch {
        cli.log(`${chalk.yellow('Warning')}: Failed to refresh ${org}`);
      }
    }
    await this.write();
  }

  private transform(repo: RepositoryResponse): Repository {
    const transformed = {
      name: repo.name,
      fullName: repo.full_name,
      org: repo.owner.login,
      archived: repo.archived,
      updated: repo.updated_at,
      urls: {
        clone: repo.clone_url,
        html: repo.html_url,
        ssh: repo.ssh_url,
      },
      defaultBranch: repo.default_branch,
      location: path.join(this.directory.name, repo.owner.login, repo.name),
    };
    return transformed;
  }
}
