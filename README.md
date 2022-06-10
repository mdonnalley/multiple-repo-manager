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
* [`multi cd REPO`](#multi-cd-repo)
* [`multi setup`](#multi-setup)
* [`multi task KEYVALUE`](#multi-task-keyvalue)
* [`multi task get TASK`](#multi-task-get-task)

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

_See code: [src/commands/cd.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.4.0/src/commands/cd.ts)_

## `multi setup`

Setup multi

```
USAGE
  $ multi setup

DESCRIPTION
  Setup multi
```

_See code: [src/commands/setup.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.4.0/src/commands/setup.ts)_

## `multi task KEYVALUE`

Set or unset an executable task.

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

_See code: [src/commands/task.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.4.0/src/commands/task.ts)_

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
<!-- commandsstop -->
