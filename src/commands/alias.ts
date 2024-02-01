import {Args, Command} from '@oclif/core'

import {Aliases} from '../aliases.js'

export default class Alias extends Command {
  public static args = {
    keyValue: Args.string({
      description: 'alias=value',
      required: true,
    }),
  }

  public static description = 'Provide an empty to value to unset the alias'
  public static examples = [
    {
      command: '<%= config.bin %> <%= command.id %> myrepo=my-org/my-repo',
      description: 'Set an alias',
    },
    {
      command: '<%= config.bin %> <%= command.id %> myrepo=',
      description: 'Unset an alias',
    },
  ]

  public static flags = {}
  public static strict = false

  public static summary = 'Set or unset an alias'

  public async run(): Promise<void> {
    const {args} = await this.parse(Alias)
    const {keyValue} = args

    const aliases = await Aliases.create()
    const [alias, value] = keyValue.split('=')
    if (value) {
      aliases.set(alias, value)
    } else {
      aliases.unset(alias)
    }

    await aliases.write()
    if (value) {
      this.log(`${alias} was successfully created.`)
    } else {
      this.log(`${alias} was successfully removed.`)
    }
  }
}
