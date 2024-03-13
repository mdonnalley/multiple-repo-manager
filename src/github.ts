import type {Endpoints} from '@octokit/types'

import {Errors} from '@oclif/core'
import {paginateGraphql} from '@octokit/plugin-paginate-graphql'
import {requestLog} from '@octokit/plugin-request-log'
import makeDebug from 'debug'
import {join} from 'node:path'
import {Octokit} from 'octokit'

import {Config, Configuration} from './config.js'

const debug = makeDebug('github')

function getToken(): string {
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN
  if (!token) {
    throw new Errors.CLIError('GH_TOKEN or GITHUB_TOKEN must be set in the environment')
  }

  return token
}

export type Pull = {
  created: string
  labels: string[]
  number: number
  repo: string
  title: string
  url: string
  user: string | undefined
}

export type Issue = {
  created: string
  labels: string[]
  number: number
  repo: string
  title: string
  updated: string
  url: string
  user: string
}

type DiscussionResponse = {
  author: {login: string}
  category: {name: string}
  closed: boolean
  createdAt: string
  id: string
  number: number
  repository: {name: string}
  title: string
  updatedAt: string
  url: string
}

export type Discussion = {
  category: string
  created: string
  id: string
  number: number
  repo: string
  title: string
  updated: string
  url: string
  user: string
}

type GraphQLResponse<T> = {
  [key: string]: {
    [key: string]: {
      nodes: T[]
    }
  }
}

export type Repository = {
  archived: boolean | undefined
  defaultBranch: string | undefined
  fullName: string
  location: string
  name: string
  org: string
  private: boolean
  updated: null | string | undefined
  urls: {
    clone: string | undefined
    html: string
    ssh: string | undefined
  }
}

type ElementOf<A> = A extends readonly (infer T)[] ? T : never
type PullResponse = ElementOf<Endpoints['GET /repos/{owner}/{repo}/pulls']['response']['data']>
type RepositoryResponse = Endpoints['GET /repos/{owner}/{repo}']['response']['data']
type UserRepositoryResponse = ElementOf<Endpoints['GET /user/repos']['response']['data']>
type OrgRepositoryResponse = ElementOf<Endpoints['GET /orgs/{org}/repos']['response']['data']>
type PrSearchResponse = ElementOf<Endpoints['GET /search/issues']['response']['data']['items']>

function normalizePull(pull: PrSearchResponse | PullResponse, repoName: string): Pull {
  return {
    created: pull.created_at,
    labels: pull.labels.map((l) => l.name).filter((l): l is string => l !== undefined),
    number: pull.number,
    repo: repoName,
    title: pull.title,
    url: pull.html_url,
    user: pull.user?.login,
  }
}

function normalizeRepo(
  repo: OrgRepositoryResponse | RepositoryResponse | UserRepositoryResponse,
  baseDir: string,
): Repository {
  return {
    archived: repo.archived,
    defaultBranch: repo.default_branch,
    fullName: repo.full_name,
    location: join(baseDir, repo.owner.login, repo.name),
    name: repo.name,
    org: repo.owner.login,
    private: repo.private,
    updated: repo.updated_at,
    urls: {
      clone: repo.clone_url,
      html: repo.html_url,
      ssh: repo.ssh_url,
    },
  }
}

export class Github {
  private config!: Config
  private octokit!: Octokit

  constructor() {
    this.octokit = new (Octokit.plugin(paginateGraphql).plugin(requestLog))({
      auth: getToken(),
      log: {
        debug: debug.extend('debug'),
        error: debug.extend('error'),
        info: debug.extend('info'),
        warn: debug.extend('warn'),
      },
    })
  }

  public async orgRepositories(org: string): Promise<Repository[]> {
    const directory = await this.getFromConfig('directory')
    if (org === (await this.getFromConfig('username'))) {
      const response = await this.octokit.paginate('GET /user/repos', {
        affiliation: 'owner',
      })
      return response.map((r) => normalizeRepo(r, directory))
    }

    const response = await this.octokit.paginate('GET /orgs/{org}/repos', {org})
    return response.map((r) => normalizeRepo(r, directory))
  }

  public async repoDiscussions(repos: Repository[]): Promise<Discussion[]> {
    const query = `query paginate($cursor: String) {
      ${repos
        .map(
          ({name, org}, index) => `repo${index + 1}: repository(owner: "${org}", name: "${name}") {
            discussions(first: 20, after: $cursor) {
              # type: DiscussionConnection
              totalCount # Int!

              pageInfo {
                # type: PageInfo (from the public schema)
                startCursor
                endCursor
                hasNextPage
                hasPreviousPage
              }

              nodes {
                # type: Discussion
                author { login }
                category { name }
                createdAt
                id
                number
                repository { name }
                title
                updatedAt
                url
                closed
              }
            }
          }`,
        )
        .join('\n')}
        }`

    const response = await this.octokit.graphql.paginate<GraphQLResponse<DiscussionResponse>>(query)
    return Object.values(response).flatMap((r) =>
      Object.values(r).flatMap((r) =>
        r.nodes
          .filter((n) => !n.closed)
          .map((n) => ({
            category: n.category.name,
            created: n.createdAt,
            id: n.id,
            number: n.number,
            repo: n.repository.name,
            title: n.title,
            updated: n.updatedAt,
            url: n.url,
            user: n.author.login,
          })),
      ),
    )
  }

  public async repoIssues(repos: Repository[], opts?: {since?: string}): Promise<Issue[]> {
    const all = await Promise.all(
      repos.map(async (repo) => {
        const response = await this.octokit.paginate('GET /repos/{owner}/{repo}/issues', {
          owner: repo.org,
          repo: repo.name,
          since: opts?.since,
          state: 'open',
        })
        const issues = response
          .filter((r) => !r.pull_request)
          .map(
            (r) =>
              ({
                created: r.created_at,
                labels: r.labels.map((l) => (typeof l === 'string' ? l : l.name)),
                number: r.number,
                repo: repo.name,
                title: r.title,
                updated: r.updated_at,
                url: r.html_url,
                user: r.user?.login,
              }) as Issue,
          )
        return issues
      }),
    )

    return all.filter((r) => r.length > 0).flat()
  }

  public async repoPulls(repos: Repository[]): Promise<Pull[]> {
    const all = await Promise.all(
      repos.map(async (repo) => {
        const response = await this.octokit.paginate('GET /repos/{owner}/{repo}/pulls', {
          owner: repo.org,
          repo: repo.name,
          state: 'open',
        })
        return response.map((r) => normalizePull(r, repo.name))
      }),
    )

    return all.filter((r) => r.length > 0).flat()
  }

  public async repository(org: string, repo: string): Promise<Repository> {
    const response = await this.octokit.request('GET /repos/{owner}/{repo}', {owner: org, repo})
    return normalizeRepo(response.data, await this.getFromConfig('directory'))
  }

  public async userPulls(options?: {repos?: Repository[]}): Promise<Pull[]> {
    const reposFilter = options?.repos ? `repo:${options.repos.map((r) => `repo:${r.fullName}`).join(' ')}` : ''
    const query = `is:pr is:open author:${await this.getFromConfig('username')} ${reposFilter}`
    debug(`GET /search/issues?q=${query}`)
    const response = await this.octokit.paginate('GET /search/issues', {q: query})
    return response.map((r) => normalizePull(r, r.repository_url.split('/').slice(-2).join('/')))
  }

  private async getFromConfig(key: keyof Configuration): Promise<string> {
    if (!this.config) {
      this.config = await new Config().init()
    }

    return this.config.get(key)
  }
}
