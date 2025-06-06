import {includeIgnoreFile} from '@eslint/compat'
import oclif from 'eslint-config-oclif'
import prettier from 'eslint-config-prettier'
import xoReactSpace from 'eslint-config-xo-react/space'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const gitignorePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.gitignore')

export default [
  includeIgnoreFile(gitignorePath),
  ...oclif,
  prettier,
  ...xoReactSpace,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      'import/default': 'off',
      'lines-between-class-members': 'off',
      'no-await-in-loop': 'off',
      'no-useless-escape': 'off',
      'react/jsx-tag-spacing': 'off',
      'unicorn/no-await-expression-member': 'off',
    },
  },
]
