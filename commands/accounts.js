import { pbcopy } from '../lib/copy'
import chalk from 'chalk'
import ora from 'ora'
import prompts from 'prompts'
import { getAccountChoices } from '../lib/accounts'
import { autosearch } from '../lib/autosearch'
import { promptPassword } from '../lib/prompt'
import { getWallet } from '../lib/vault'

export async function getAccounts() {
  const password = await promptPassword()

  const spinner = ora('Loading wallet').start()

  const wallet = await getWallet(password).then(wallet => {
    spinner.text = 'Loading BNS names'
    return wallet
  })

  const accounts = await getAccountChoices(wallet).then(accounts => {
    spinner.succeed('Wallet loaded')
    return accounts
  })

  const { address } = await prompts({
    type: 'autocomplete',
    name: 'address',
    message: 'Choose an account',
    choices: accounts,
    suggest: async (input, choices) => await autosearch(input, choices),
  }).catch(err => {
    console.log(chalk.red(err.message))
    process.exit(1)
  })

  const copied = pbcopy(address)
  if (copied) {
    console.log(chalk.green(`Address copied to clipboard: ${address}`))
  } else {
    console.log(chalk.yellow('Could not copy address to clipboard'))
    console.log(chalk.yellow(`Address: ${address}`))
  }
}
