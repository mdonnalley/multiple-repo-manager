/* eslint-disable camelcase */

import * as path from 'path';
import { mkdir } from 'fs/promises';
import { Octokit } from 'octokit';
import { Duration } from '@salesforce/kit';
import { CliUx } from '@oclif/core';
import { exec } from 'shelljs';
import * as chalk from 'chalk';
import { ConfigFile } from './configFile';
import { getToken } from './util';
import { Config } from './config';
import { Directory } from './directory';
import { Aliases } from './aliases';

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
  location: string;
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

export type Pull = {
  url: string;
  number: number;
  title: string;
  user: string;
  repo: string;
};

export class Repos extends ConfigFile<RepoIndex> {
  public static REFRESH_TIME = Duration.weeks(1);
  public directory!: Directory;
  private octokit!: Octokit;
  private aliases!: Aliases;

  public constructor() {
    super('repos.json');
  }

  public getNameOrFullName(nameOrFullNameOrAlias: string): string {
    return this.aliases.get(nameOrFullNameOrAlias) ?? nameOrFullNameOrAlias;
  }

  public getMatches(nameOrFullNameOrAlias: string): Repository[] {
    const nameOrFullName = this.getNameOrFullName(nameOrFullNameOrAlias);
    if (this.has(nameOrFullName)) {
      return [super.get(nameOrFullName)];
    }
    const matches = this.values().filter((v) => v.name === nameOrFullName);
    return matches ?? [];
  }

  public getOne(nameOrFullNameOrAlias: string): Repository {
    const nameOrFullName = this.getNameOrFullName(nameOrFullNameOrAlias);
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

  public getOrgs(): string[] {
    return Array.from(new Set(Object.values(this.getContents()).map((r) => r.org)));
  }

  public async fetch(org: string, repo?: string | null): Promise<Repository[]> {
    if (repo) {
      const response = await this.octokit.request('GET /repos/{owner}/{repo}', { owner: org, repo });
      return [this.transform(response.data)];
    } else {
      const response = await this.octokit.paginate('GET /orgs/{org}/repos', { org });
      return response.map((r) => this.transform(r as RepositoryResponse));
    }
  }

  public async fetchPulls(): Promise<Pull[]> {
    const config = await Config.create();
    const response = await this.octokit.paginate('GET /search/issues', {
      q: `is:pr is:open author:${config.get('username')}`,
    });
    const pulls = response
      // eslint-disable-next-line arrow-body-style
      .map((r) => {
        return {
          url: r.html_url,
          number: r.number,
          title: r.title,
          user: r.user.login,
          repo: r.repository_url.split('/').slice(-2).join('/'),
        } as Pull;
      })
      .filter((r) => this.has(r.repo));
    return pulls;
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
    this.aliases = await Aliases.create();
    if (this.needsRefresh()) await this.refresh();
  }

  private needsRefresh(): boolean {
    return new Date().getTime() - this.stats.mtime.getTime() > Repos.REFRESH_TIME.milliseconds;
  }

  private async refresh(): Promise<void> {
    const originalRepos = Object.keys(this.getContents());
    const orgs = this.getOrgs();
    for (const org of orgs) {
      try {
        const orgRepos = await this.fetch(org);
        orgRepos.forEach((repo) => {
          if (originalRepos.includes(repo.fullName)) this.update(repo.fullName, repo);
        });
      } catch {
        CliUx.ux.debug(`${chalk.yellow('Warning')}: Failed to refresh ${org}`);
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
