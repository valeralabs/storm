import { getWallet } from '../lib/vault'
import prompts from 'prompts'
import ora from 'ora'
import { autosearch } from '../lib/autosearch'
import {
  blake3Hash,
  getSigningKey,
  private2address,
  signSecp,
  verifySecpAddress,
} from '../lib/crypto'
import { promptPassword } from '../lib/prompt'
import chalk from 'chalk'
import { getAccountChoices } from '../lib/accounts'

export async function signMsg() {
  const password = await promptPassword()
  const spinner = ora('Loading wallet').start()
  const wallet = await getWallet(password).then(wallet => {
    spinner.text = 'Loading BNS names'
    return wallet
  })

  const choices = await getAccountChoices(wallet).then(choices => {
    spinner.succeed('Loaded wallet')
    return choices
  })

  const { address, msg } = await prompts([
    {
      type: 'autocomplete',
      name: 'address',
      message: 'Choose an account',
      choices: choices,
      suggest: async (input, choices) => await autosearch(input, choices),
    },
    {
      type: 'text',
      name: 'msg',
      message: `Enter the message you want to sign`,
      validate: value => value.length > 0 || 'Please enter a message',
    },
  ]).catch(err => {
    console.log(chalk.red(err.message))
    process.exit(1)
  })

  const hasher = ora('Hashing message').start()
  const msgHash = await blake3Hash(msg).then(hash => {
    hasher.succeed(`Hashed message: ${hash}`)
    return hash
  })

  const signer = ora('Signing message').start()

  const account = wallet.accounts.find(
    account => private2address(account.stxPrivateKey, true) === address
  )
  const signingKey = getSigningKey(account.stxPrivateKey)
  const signature = await signSecp(signingKey, msgHash)
    .then(signature => {
      signer.succeed(`Signed message: ${signature}`)
      return signature
    })
    .catch(err => {
      signer.fail(`Failed to sign message: ${err}`)
    })

  const verifier = ora('Verifying signature').start()

  const verification = await verifySecpAddress(
    address,
    msgHash,
    signature
  ).then(verified => {
    if (verified) {
      verifier.succeed(`Verified signature`)
    } else {
      verifier.fail(`Failed to verify signature`)
    }
    return verified
  })
}
