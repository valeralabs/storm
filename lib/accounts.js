import { getStxAddressFromAccount } from 'micro-stacks/wallet-sdk'
import ora from 'ora'
import prompts from 'prompts'
import { getBnsName } from './api'
import { autosearch } from './autosearch'
import { promptPassword } from './prompt'
import { getWallet } from './vault'
import { connectivityCheck } from '../commands/config/api'

export async function getAccountChoices(wallet) {
  return await Promise.all(
    wallet.accounts.map(async account => {
      const address = getStxAddressFromAccount(account)
      const name = await getBnsName(address)
      return {
        title: address,
        description: name,
      }
    })
  )
}

export async function chooseAccount() {
  await connectivityCheck()
  const password = await promptPassword()

  const spinner = ora('Loading wallet').start()
  const wallet = await getWallet(password).then(wallet => {
    spinner.text = 'Loading BNS names'
    return wallet
  })

  const accountChoices = await getAccountChoices(wallet).then(accounts => {
    spinner.succeed('Wallet loaded')
    return accounts
  })

  const { address } = await prompts({
    type: 'autocomplete',
    name: 'address',
    message: 'Choose an account',
    choices: accountChoices,
    suggest: async (input, choices) => await autosearch(input, choices),
  }).catch(err => {
    console.log(chalk.red(err.message))
    process.exit(1)
  })

  return {
    ...wallet.accounts.find(
      account => getStxAddressFromAccount(account) === address
    ),
    username: accountChoices.find(choice => choice.title === address)
      .description,
    address,
  }
}
