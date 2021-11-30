import prompts from 'prompts'
import { validateMnemonic } from 'micro-stacks/bip39'
import { getSecretKey } from './vault'
import chalk from 'chalk'

export async function promptPassword() {
  try {
    const { password } = await prompts({
      type: 'password',
      name: 'password',
      message: 'Enter your password:',
      validate: async password =>
        validateMnemonic(await getSecretKey(password).catch(() => false)) ||
        'Incorrect password',
    })
    return password
  } catch (err) {
    console.log(chalk.red(err.message))
    process.exit(1)
  }
}
