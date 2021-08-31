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
* [`multi alias KEYVALUE`](#multi-alias-keyvalue)
* [`multi alias resolve ALIAS`](#multi-alias-resolve-alias)
* [`multi cd REPO`](#multi-cd-repo)
* [`multi exec REPO`](#multi-exec-repo)
* [`multi list`](#multi-list)
* [`multi open REPO`](#multi-open-repo)
* [`multi remove REPO`](#multi-remove-repo)
* [`multi setup`](#multi-setup)
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

_See code: [src/commands/add.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.0.0-beta.1/src/commands/add.ts)_

## `multi alias KEYVALUE`

Provide an empty to value to unset the alias. This feature is not support on Windows.

```
USAGE
  $ multi alias [KEYVALUE] [--interactive]

ARGUMENTS
  KEYVALUE  alias=value

FLAGS
  --interactive  Open a vim editor to add your alias

DESCRIPTION
  Set or unset an executable alias.

  Provide an empty to value to unset the alias. This feature is not support on Windows.

EXAMPLES
  Set an alias

    $ multi alias build=yarn build

  Set an alias that uses multi exec

    $ multi alias circle=multi exec . open https://app.circleci.com/pipelines/github/{repo.fullName}

  Unset an alias

    $ multi alias build=

  Set an alias interactively

    $ multi alias build --interactive
```

_See code: [src/commands/alias.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.0.0-beta.1/src/commands/alias.ts)_

## `multi alias resolve ALIAS`

Return the value of an alias.

```
USAGE
  $ multi alias resolve [ALIAS]

ARGUMENTS
  ALIAS  Name of alias to resolve.

DESCRIPTION
  Return the value of an alias.
```

## `multi cd REPO`

cd into a github repository.

```
USAGE
  $ multi cd [REPO]

ARGUMENTS
  REPO  Name of repository.

DESCRIPTION
  cd into a github repository.
```

_See code: [src/commands/cd.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.0.0-beta.1/src/commands/cd.ts)_

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

_See code: [src/commands/exec.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.0.0-beta.1/src/commands/exec.ts)_

## `multi list`

List all added repositories.

```
USAGE
  $ multi list

DESCRIPTION
  List all added repositories.

ALIASES
  $ multi ls
```

_See code: [src/commands/list.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.0.0-beta.1/src/commands/list.ts)_

## `multi open REPO`

Open a github repository.

```
USAGE
  $ multi open [REPO]

ARGUMENTS
  REPO  [default: .] Name of repository.

DESCRIPTION
  Open a github repository.

ALIASES
  $ multi o
```

_See code: [src/commands/open.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.0.0-beta.1/src/commands/open.ts)_

## `multi remove REPO`

Remove a github repository from your local filesystem.

```
USAGE
  $ multi remove [REPO]

ARGUMENTS
  REPO  Name of repository.

DESCRIPTION
  Remove a github repository from your local filesystem.

ALIASES
  $ multi rm
```

_See code: [src/commands/remove.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.0.0-beta.1/src/commands/remove.ts)_

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

_See code: [src/commands/setup.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.0.0-beta.1/src/commands/setup.ts)_

## `multi view REPO`

View a github repository.

```
USAGE
  $ multi view [REPO]

ARGUMENTS
  REPO  Name of repository.

DESCRIPTION
  View a github repository.

ALIASES
  $ multi v
```

_See code: [src/commands/view.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.0.0-beta.1/src/commands/view.ts)_

## `multi where REPO`

Print location of a github repository.

```
USAGE
  $ multi where [REPO] [--remote]

ARGUMENTS
  REPO  Name of repository.

FLAGS
  --remote  Return url of repository.

DESCRIPTION
  Print location of a github repository.
```

_See code: [src/commands/where.ts](https://github.com/mdonnalley/multiple-repo-manager/blob/v2.0.0-beta.1/src/commands/where.ts)_
<!-- commandsstop -->
