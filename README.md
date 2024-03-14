# Multiple Repo Manager

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/multiple-repo-manager.svg)](https://npmjs.org/package/multiple-repo-manager) [![CircleCI](https://circleci.com/gh/mdonnalley/multiple-repo-manager/tree/main.svg?style=shield)](https://circleci.com/gh/mdonnalley/multiple-repo-manager/tree/main) [![Downloads/week](https://img.shields.io/npm/dw/multiple-repo-manager.svg)](https://npmjs.org/package/multiple-repo-manager) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/mdonnalley/multiple-repo-manager/main/LICENSE.txt)

`multi` is a CLI for managing node packages across multiple Github organizations and repositories. Autocomplete and user defined aliases are supported for linux and osx users.

<!-- toc -->
* [Multiple Repo Manager](#multiple-repo-manager)
* [Getting Started](#getting-started)
* [Commands](#commands)
<!-- tocstop -->

# Getting Started

## Install

```sh-session
$ npm install -g multiple-repo-manager
$ multi --help [COMMAND]
USAGE
  $ multi COMMAND
...
```

## Setup

In order for `multi` to work, you must always have your github access token set in the environment - either as `GH_TOKEN` or `GITHUB_TOKEN`. See the [github docs](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) for how to do this.

After you've set your github token, run `multi setup`. This command will prompt you for the directory that you want your repos to live. It defaults to `~/repos`.

## Adding Organizations and Repositories

Once you've run `multi setup`, you're ready to begin adding organizations and/or repositories:

To add an organization:

```bash
multi add my-github-org
```

To add a repository:

```bash
multi add my-github-org/my-repo
```

## Tasks

One the main advantages of using `multi` is that you can define your own tasks. Theses tasks are stored at `~/.mutli/tasks.yml` and can set be set and unset using the `multi task` command.

### Examples

```yaml
open-circle: multi exec . -- open https://app.circleci.com/pipelines/github/{repo.fullName}
done-with-branch: |
  local current_branch=$(git rev-parse --abbrev-ref HEAD)
  multi exec . -- git checkout {repo.defaultBranch}
  git pull
  git remote prune origin
  git branch -D $current_branch
```

# Commands

<!-- commands -->
* [`multi add ENTITY`](#multi-add-entity)
* [`multi alias KEYVALUE`](#multi-alias-keyvalue)
* [`multi cd REPO`](#multi-cd-repo)
* [`multi diff ORG`](#multi-diff-org)
* [`multi exec REPO`](#multi-exec-repo)
* [`multi list`](#multi-list)
* [`multi open REPO`](#multi-open-repo)
* [`multi org discussions ORG`](#multi-org-discussions-org)
* [`multi org issues ORG`](#multi-org-issues-org)
* [`multi org list ORGS`](#multi-org-list-orgs)
* [`multi org overview ORG`](#multi-org-overview-org)
* [`multi org pulls ORG`](#multi-org-pulls-org)
* [`multi pulls`](#multi-pulls)
* [`multi refresh`](#multi-refresh)
* [`multi remove REPO`](#multi-remove-repo)
* [`multi setup`](#multi-setup)
* [`multi task KEYVALUE`](#multi-task-keyvalue)
* [`multi task get TASK`](#multi-task-get-task)
* [`multi version`](#multi-version)
* [`multi view REPO`](#multi-view-repo)
* [`multi where REPO`](#multi-where-repo)

## `multi add ENTITY`

Add a github org or repo. Requires GH_TOKEN to be set in the environment.

```
USAGE
  $ multi add ENTITY [-c <value>] [-d] [-f] [--method ssh|https]

ARGUMENTS
  ENTITY  Github org, repo, or url to add

FLAGS
  -c, --concurrency=<value>  [default: 4] Number of concurrent clones.
  -d, --dry-run              Print what would be done without doing it.
  -f, --force                Force overwrite of existing repos.
      --method=<option>      [default: ssh] Method to use for cloning.
                             <options: ssh|https>

DESCRIPTION
  Add a github org or repo. Requires GH_TOKEN to be set in the environment.

EXAMPLES
  Add a github org

    $ multi add my-github-org

  Add a github org by url

    $ multi add https://github.com/my-github-org

  Add a github repo by name

    $ multi add my-github-org/my-repo

  Add a github repo by url

    $ multi add https://github.com/my-github-org/my-repo
```

_See code: [src/commands/add.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/add.ts)_

## `multi alias KEYVALUE`

Set or unset an alias

```
USAGE
  $ multi alias KEYVALUE...

ARGUMENTS
  KEYVALUE...  alias=value

DESCRIPTION
  Set or unset an alias

  Provide an empty to value to unset the alias

EXAMPLES
  Set an alias

    $ multi alias myrepo=my-org/my-repo

  Unset an alias

    $ multi alias myrepo=
```

_See code: [src/commands/alias.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/alias.ts)_

## `multi cd REPO`

cd into a repository.

```
USAGE
  $ multi cd REPO

ARGUMENTS
  REPO  Name of repository.

DESCRIPTION
  cd into a repository.
```

_See code: [src/commands/cd.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/cd.ts)_

## `multi diff ORG`

Show repositories in an org that are not cloned locally. Requires GH_TOKEN to be set in the environment.

```
USAGE
  $ multi diff ORG

ARGUMENTS
  ORG  Github org

DESCRIPTION
  Show repositories in an org that are not cloned locally. Requires GH_TOKEN to be set in the environment.

EXAMPLES
  $ multi diff my-github-org
```

_See code: [src/commands/diff.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/diff.ts)_

## `multi exec REPO`

Execute a command or script in a repository.

```
USAGE
  $ multi exec REPO...

ARGUMENTS
  REPO...  Name of repository to execute in. Use "." to specify the current working directory.

DESCRIPTION
  Execute a command or script in a repository.

ALIASES
  $ multi x

EXAMPLES
  Execute a script in a different repository

    $ multi exec my-repo -- yarn compile

  Execute a script in the current working directory

    $ multi exec . -- yarn compile

  Interpolate values into command execution

    $ multi exec . -- open https://app.circleci.com/pipelines/github/{repo.fullName}
```

_See code: [src/commands/exec.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/exec.ts)_

## `multi list`

List all repositories.

```
USAGE
  $ multi list

DESCRIPTION
  List all repositories.

ALIASES
  $ multi ls
```

_See code: [src/commands/list.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/list.ts)_

## `multi open REPO`

Open a repository in github.

```
USAGE
  $ multi open REPO [-f <value> | -t actions|discussions|issues|pulls|pulse|security|settings|wiki]

ARGUMENTS
  REPO  [default: .] Name of repository.

FLAGS
  -f, --file=<value>  File to open in github.
  -t, --tab=<option>  Tab to open in github.
                      <options: actions|discussions|issues|pulls|pulse|security|settings|wiki>

DESCRIPTION
  Open a repository in github.

ALIASES
  $ multi o

EXAMPLES
  Open the main page of a github repository

    $ multi open my-repo

  Open the issues tab of a github repository

    $ multi open my-repo --tab issues

  Open a specific file in a github repository

    $ multi open my-repo --file path/to/my/code.ts
```

_See code: [src/commands/open.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/open.ts)_

## `multi org discussions ORG`

List all open discussions for added repos in an org. Requires GH_TOKEN to be set in the environment.

```
USAGE
  $ multi org discussions ORG [-b created|repo|author|updated] [-s <value>]

ARGUMENTS
  ORG  Github org

FLAGS
  -b, --sort-by=<option>  [default: repo] Sort by
                          <options: created|repo|author|updated>
  -s, --since=<value>     Only show discussions updated after this date

DESCRIPTION
  List all open discussions for added repos in an org. Requires GH_TOKEN to be set in the environment.

EXAMPLES
  $ multi org discussions my-github-org --since 1/1/24

  $ multi org discussions my-github-org --since friday
```

_See code: [src/commands/org/discussions.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/org/discussions.ts)_

## `multi org issues ORG`

List all open issues for added repos in an org. Requires GH_TOKEN to be set in the environment.

```
USAGE
  $ multi org issues ORG -s <value> [-b created|repo|author|updated]

ARGUMENTS
  ORG  Github org

FLAGS
  -b, --sort-by=<option>  [default: repo] Sort by
                          <options: created|repo|author|updated>
  -s, --since=<value>     (required) Only show issues updated after this date

DESCRIPTION
  List all open issues for added repos in an org. Requires GH_TOKEN to be set in the environment.

EXAMPLES
  $ multi org issues my-github-org --since 1/1/24

  $ multi org issues my-github-org --since friday
```

_See code: [src/commands/org/issues.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/org/issues.ts)_

## `multi org list ORGS`

Show all repositories in the org. Requires GH_TOKEN to be set in the environment.

```
USAGE
  $ multi org list ORGS...

ARGUMENTS
  ORGS...  Github org

DESCRIPTION
  Show all repositories in the org. Requires GH_TOKEN to be set in the environment.

ALIASES
  $ multi list org

EXAMPLES
  $ multi org list my-github-org
```

_See code: [src/commands/org/list.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/org/list.ts)_

## `multi org overview ORG`

Provides issue, pull request, and discussion counts for the request repositories. Requires GH_TOKEN to be set in the environment.

```
USAGE
  $ multi org overview ORG [--json] [-d] [-b repo|issues|pulls] [-f <value>]

ARGUMENTS
  ORG  Github org

FLAGS
  -b, --sort-by=<option>   [default: repo] Sort by
                           <options: repo|issues|pulls>
  -d, --discussions        Include discussions
  -f, --filter=<value>...  Filter out repositories by minimatch pattern

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Provides issue, pull request, and discussion counts for the request repositories. Requires GH_TOKEN to be set in the
  environment.

EXAMPLES
  Get an overview of the issues and PRs for an org

    $ multi org overview my-github-org

  Get an overview of the issues, PRs, and discussions for an org

    $ multi org overview my-github-org --discussions

  Filter out repositories by minimatch pattern

    $ multi org overview my-github-org --filter "my-repo-*"
```

_See code: [src/commands/org/overview.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/org/overview.ts)_

## `multi org pulls ORG`

List all open pull requests for added repos in an org. Requires GH_TOKEN to be set in the environment.

```
USAGE
  $ multi org pulls ORG [-i | -d] [-b created|repo|author] [-s <value>]

ARGUMENTS
  ORG  Github org

FLAGS
  -b, --sort-by=<option>        [default: repo] Sort by
                                <options: created|repo|author>
  -d, --only-dependabot         Only show dependabot
  -i, --[no-]ignore-dependabot  Ignore dependabot
  -s, --since=<value>           Only show pull requests created after this date

DESCRIPTION
  List all open pull requests for added repos in an org. Requires GH_TOKEN to be set in the environment.

EXAMPLES
  $ multi org pulls my-github-org

  $ multi org pulls my-github-org --ignore-dependabot

  $ multi org pulls my-github-org --only-dependabot

  $ multi org pulls my-github-org --since 1/1/24

  $ multi org pulls my-github-org --since friday
```

_See code: [src/commands/org/pulls.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/org/pulls.ts)_

## `multi pulls`

List all your pull requests for added repositories. Requires GH_TOKEN to be set in the environment.

```
USAGE
  $ multi pulls

DESCRIPTION
  List all your pull requests for added repositories. Requires GH_TOKEN to be set in the environment.

EXAMPLES
  $ multi pulls
```

_See code: [src/commands/pulls.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/pulls.ts)_

## `multi refresh`

Refresh the list of repositories and corresponding metadata.

```
USAGE
  $ multi refresh [-o <value>]

FLAGS
  -o, --org=<value>...  Github org to refresh.

DESCRIPTION
  Refresh the list of repositories and corresponding metadata.
```

_See code: [src/commands/refresh.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/refresh.ts)_

## `multi remove REPO`

Remove a repository from your local file system.

```
USAGE
  $ multi remove REPO

ARGUMENTS
  REPO  Name of repository.

DESCRIPTION
  Remove a repository from your local file system.

ALIASES
  $ multi rm
```

_See code: [src/commands/remove.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/remove.ts)_

## `multi setup`

Setup multi

```
USAGE
  $ multi setup

DESCRIPTION
  Setup multi
```

_See code: [src/commands/setup.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/setup.ts)_

## `multi task KEYVALUE`

Set or unset an executable task.

```
USAGE
  $ multi task KEYVALUE... [--interactive]

ARGUMENTS
  KEYVALUE...  task=value

FLAGS
  --interactive  Open a vim editor to add your task

DESCRIPTION
  Set or unset an executable task.

  Provide an empty to value to unset the task. This feature is not support on Windows.

EXAMPLES
  Set a task

    $ multi task build=yarn build

  Set a task that uses multi exec

    $ multi task circle=multi exec . open https://app.circleci.com/pipelines/github/{repo.fullName}

  Unset a task

    $ multi task build=

  Set a task interactively

    $ multi task build --interactive
```

_See code: [src/commands/task.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/task.ts)_

## `multi task get TASK`

Return the value of a task.

```
USAGE
  $ multi task get TASK

ARGUMENTS
  TASK  Name of task to get

DESCRIPTION
  Return the value of a task.
```

_See code: [src/commands/task/get.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/task/get.ts)_

## `multi version`

Print the version of multi

```
USAGE
  $ multi version

DESCRIPTION
  Print the version of multi
```

_See code: [src/commands/version.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/version.ts)_

## `multi view REPO`

View a repository.

```
USAGE
  $ multi view REPO

ARGUMENTS
  REPO  Name of repository.

DESCRIPTION
  View a repository.

ALIASES
  $ multi v
```

_See code: [src/commands/view.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/view.ts)_

## `multi where REPO`

Print location of a repository.

```
USAGE
  $ multi where REPO [--remote]

ARGUMENTS
  REPO  Name of repository.

FLAGS
  --remote  Return url of repository.

DESCRIPTION
  Print location of a repository.
```

_See code: [src/commands/where.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v4.9.1/src/commands/where.ts)_
<!-- commandsstop -->
