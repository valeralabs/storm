import { pbcopy } from '../lib/copy'
import chalk from 'chalk'
import { chooseAccount } from '../lib/accounts'

export async function getAccounts() {
  const account = await chooseAccount()
  const address = account.address

  const copied = pbcopy(address)
  if (copied) {
    console.log(chalk.green(`Address copied to clipboard`))
  } else {
    console.log(chalk.yellow('Could not copy address to clipboard'))
    console.log(chalk.yellow(`Address: ${address}`))
  }
}
