# Multiple Package Manager (mpm)

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/multiple-package-manager.svg)](https://npmjs.org/package/multiple-package-manager) [![CircleCI](https://circleci.com/gh/mdonnalley/multiple-package-manager/tree/main.svg?style=shield)](https://circleci.com/gh/mdonnalley/multiple-package-manager/tree/main) [![Downloads/week](https://img.shields.io/npm/dw/multiple-package-manager.svg)](https://npmjs.org/package/multiple-package-manager) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/mdonnalley/multiple-package-manager/main/LICENSE.txt)

`mpm` is a CLI for managing node packages across multiple Github organizations and repositories.

<!-- toc -->
* [Multiple Package Manager (mpm)](#multiple-package-manager-mpm)
* [Getting Started](#getting-started)
* [Commands](#commands)
<!-- tocstop -->

# Getting Started

## Install

```sh-session
$ npm install -g multiple-package-manager
$ mpm --version
multiple-package-manager/1.1.1 darwin-x64 node-v14.15.4
$ mpm --help [COMMAND]
USAGE
  $ mpm COMMAND
...
```

## Setup

In order for `mpm` to work, you must always have your github access token set in the environment - either as `GH_TOKEN` or `GITHUB_TOKEN`. See the [github docs](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) for how to do this.

After you've set your github token, run `mpm setup`. This command will prompt you for the directory that you want your repos to live. It defaults to `~/repos`.

## Adding Organizations and Repositories

Once you've run `mpm setup`, you're ready to begin adding organizations and/or repositories:

To add an organization:

```bash
mpm add my-github-org
```

To add a repository:

```bash
mpm add my-github-org/my-repo
```

# Commands

<!-- commands -->
* [`mpm add ENTITY`](#mpm-add-entity)
* [`mpm cd REPO`](#mpm-cd-repo)
* [`mpm exec REPO`](#mpm-exec-repo)
* [`mpm list`](#mpm-list)
* [`mpm open REPO`](#mpm-open-repo)
* [`mpm remove REPO`](#mpm-remove-repo)
* [`mpm setup`](#mpm-setup)
* [`mpm view REPO`](#mpm-view-repo)
* [`mpm where REPO`](#mpm-where-repo)

## `mpm add ENTITY`

Add a github org. Requires GH_TOKEN to be set in the environment.

```
USAGE
  $ mpm add [ENTITY] [--method ssh|https]

ARGUMENTS
  ENTITY  Github org, repo, or url to add

FLAGS
  --method=<option>  [default: ssh] Method to use for cloning.
                     <options: ssh|https>

DESCRIPTION
  Add a github org. Requires GH_TOKEN to be set in the environment.
```

_See code: [src/commands/add.ts](https://github.com/mdonnalley/multiple-package-manager/blob/v1.1.1/src/commands/add.ts)_

## `mpm cd REPO`

cd into a github repository.

```
USAGE
  $ mpm cd [REPO]

ARGUMENTS
  REPO  Name of repository.

DESCRIPTION
  cd into a github repository.
```

_See code: [src/commands/cd.ts](https://github.com/mdonnalley/multiple-package-manager/blob/v1.1.1/src/commands/cd.ts)_

## `mpm exec REPO`

Execute a command org script in a repository.

```
USAGE
  $ mpm exec [REPO]

ARGUMENTS
  REPO  Name of repository to execute in.

DESCRIPTION
  Execute a command org script in a repository.

ALIASES
  $ mpm x
```

_See code: [src/commands/exec.ts](https://github.com/mdonnalley/multiple-package-manager/blob/v1.1.1/src/commands/exec.ts)_

## `mpm list`

List all added repositories.

```
USAGE
  $ mpm list

DESCRIPTION
  List all added repositories.

ALIASES
  $ mpm ls
```

_See code: [src/commands/list.ts](https://github.com/mdonnalley/multiple-package-manager/blob/v1.1.1/src/commands/list.ts)_

## `mpm open REPO`

Open a github repository.

```
USAGE
  $ mpm open [REPO]

ARGUMENTS
  REPO  Name of repository.

DESCRIPTION
  Open a github repository.

ALIASES
  $ mpm o
```

_See code: [src/commands/open.ts](https://github.com/mdonnalley/multiple-package-manager/blob/v1.1.1/src/commands/open.ts)_

## `mpm remove REPO`

Remove a github repository from your local filesystem.

```
USAGE
  $ mpm remove [REPO]

ARGUMENTS
  REPO  Name of repository.

DESCRIPTION
  Remove a github repository from your local filesystem.

ALIASES
  $ mpm rm
```

_See code: [src/commands/remove.ts](https://github.com/mdonnalley/multiple-package-manager/blob/v1.1.1/src/commands/remove.ts)_

## `mpm setup`

Setup mpm

```
USAGE
  $ mpm setup [-d <value>]

FLAGS
  -d, --directory=<value>  Location to setup repositories.

DESCRIPTION
  Setup mpm
```

_See code: [src/commands/setup.ts](https://github.com/mdonnalley/multiple-package-manager/blob/v1.1.1/src/commands/setup.ts)_

## `mpm view REPO`

View a github repository.

```
USAGE
  $ mpm view [REPO]

ARGUMENTS
  REPO  Name of repository.

DESCRIPTION
  View a github repository.

ALIASES
  $ mpm v
```

_See code: [src/commands/view.ts](https://github.com/mdonnalley/multiple-package-manager/blob/v1.1.1/src/commands/view.ts)_

## `mpm where REPO`

Print location of a github repository.

```
USAGE
  $ mpm where [REPO] [--remote]

ARGUMENTS
  REPO  Name of repository.

FLAGS
  --remote  Return url of repository

DESCRIPTION
  Print location of a github repository.
```

_See code: [src/commands/where.ts](https://github.com/mdonnalley/multiple-package-manager/blob/v1.1.1/src/commands/where.ts)_
<!-- commandsstop -->
