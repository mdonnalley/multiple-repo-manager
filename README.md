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

### Examles

```yaml
open-circle: multi exec . open https://app.circleci.com/pipelines/github/{repo.fullName}
done-with-branch: |
  local current_branch=$(git rev-parse --abbrev-ref HEAD)
  multi exec . git checkout {repo.defaultBranch}
  git pull
  git remote prune origin
  git branch -D $current_branch
```

# Commands

<!-- commands -->
* [`multi add ENTITY`](#multi-add-entity)
* [`multi cd REPO`](#multi-cd-repo)
* [`multi diff ORG`](#multi-diff-org)
* [`multi exec REPO`](#multi-exec-repo)
* [`multi list`](#multi-list)
* [`multi open REPO`](#multi-open-repo)
* [`multi remove REPO`](#multi-remove-repo)
* [`multi setup`](#multi-setup)
* [`multi task KEYVALUE`](#multi-task-keyvalue)
* [`multi task get TASK`](#multi-task-get-task)
* [`multi view REPO`](#multi-view-repo)
* [`multi where REPO`](#multi-where-repo)

## `multi add ENTITY`

Add a github org or repo. Requires GH_TOKEN to be set in the environment.

```
USAGE
  $ multi add [ENTITY] [--method ssh|https]

ARGUMENTS
  ENTITY  Github org, repo, or url to add

FLAGS
  --method=<option>  [default: ssh] Method to use for cloning.
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

_See code: [src/commands/add.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.1.2/src/commands/add.ts)_

## `multi cd REPO`

cd into a repository.

```
USAGE
  $ multi cd [REPO]

ARGUMENTS
  REPO  Name of repository.

DESCRIPTION
  cd into a repository.
```

_See code: [src/commands/cd.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.1.2/src/commands/cd.ts)_

## `multi diff ORG`

Show repositories in an org that are not cloned locally. Requires GH_TOKEN to be set in the environment.

```
USAGE
  $ multi diff [ORG]

ARGUMENTS
  ORG  Github org

DESCRIPTION
  Show repositories in an org that are not cloned locally. Requires GH_TOKEN to be set in the environment.

EXAMPLES
  $ multi diff my-github-org
```

_See code: [src/commands/diff.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.1.2/src/commands/diff.ts)_

## `multi exec REPO`

Execute a command or script in a repository.

```
USAGE
  $ multi exec [REPO]

ARGUMENTS
  REPO  Name of repository to execute in. Use "." to specify the current working directory.

DESCRIPTION
  Execute a command or script in a repository.

ALIASES
  $ multi x

EXAMPLES
  Execute a script in a different repository

    $ multi exec my-repo yarn compile

  Execute a script in the current working directory

    $ multi exec . yarn compile

  Interpolate values into command execution

    $ multi exec . open https://app.circleci.com/pipelines/github/{repo.fullName}
```

_See code: [src/commands/exec.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.1.2/src/commands/exec.ts)_

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

_See code: [src/commands/list.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.1.2/src/commands/list.ts)_

## `multi open REPO`

Open a repository in github.

```
USAGE
  $ multi open [REPO] [-f <value> | -t issues|pulls|discussions|actions|wiki|security|pulse|settings]

ARGUMENTS
  REPO  [default: .] Name of repository.

FLAGS
  -f, --file=<value>  File to open in github.
  -t, --tab=<option>  Tab to open in github.
                      <options: issues|pulls|discussions|actions|wiki|security|pulse|settings>

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

_See code: [src/commands/open.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.1.2/src/commands/open.ts)_

## `multi remove REPO`

Remove a repository from your local file system.

```
USAGE
  $ multi remove [REPO]

ARGUMENTS
  REPO  Name of repository.

DESCRIPTION
  Remove a repository from your local file system.

ALIASES
  $ multi rm
```

_See code: [src/commands/remove.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.1.2/src/commands/remove.ts)_

## `multi setup`

Setup multi

```
USAGE
  $ multi setup [-d <value>]

FLAGS
  -d, --directory=<value>  Location to setup repositories.

DESCRIPTION
  Setup multi
```

_See code: [src/commands/setup.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.1.2/src/commands/setup.ts)_

## `multi task KEYVALUE`

Provide an empty to value to unset the task. This feature is not support on Windows.

```
USAGE
  $ multi task [KEYVALUE] [--interactive]

ARGUMENTS
  KEYVALUE  task=value

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

_See code: [src/commands/task.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.1.2/src/commands/task.ts)_

## `multi task get TASK`

Return the value of a task.

```
USAGE
  $ multi task get [TASK]

ARGUMENTS
  TASK  Name of task to get.

DESCRIPTION
  Return the value of a task.
```

## `multi view REPO`

View a repository.

```
USAGE
  $ multi view [REPO]

ARGUMENTS
  REPO  Name of repository.

DESCRIPTION
  View a repository.

ALIASES
  $ multi v
```

_See code: [src/commands/view.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.1.2/src/commands/view.ts)_

## `multi where REPO`

Print location of a repository.

```
USAGE
  $ multi where [REPO] [--remote]

ARGUMENTS
  REPO  Name of repository.

FLAGS
  --remote  Return url of repository.

DESCRIPTION
  Print location of a repository.
```

_See code: [src/commands/where.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.1.2/src/commands/where.ts)_
<!-- commandsstop -->
