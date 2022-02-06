import chalk from 'chalk'
import { StacksMainnet } from 'micro-stacks/network'
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
} from 'micro-stacks/transactions'
import ora from 'ora'
import { pbcopy } from './copy'
import { UserNetwork } from './network'

export async function makeSmartContractCall(
  account,
  contractAddress,
  contractName,
  functionName,
  args,
  pcs
) {
  const status = ora('Loading transaction...').start()

  const txOptions = {
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: functionName,
    functionArgs: args,
    senderKey: account.stxPrivateKey,
    validateWithAbi: true,
    network: new UserNetwork(),
    postConditions: pcs,
    anchorMode: AnchorMode.Any,
  }
  //console.log(txOptions)

  status.text = 'Constructing transaction...'
  const tx = await makeContractCall(txOptions)

  status.text = 'Broadcasting transaction...'
  const broadcastResponse = await broadcastTransaction(tx, new UserNetwork())
    .then(res => {
      if (typeof res === 'string') {
        console.log(res)
        status.succeed(`Transaction ${getAbstractedTxid(res)} broadcast.`)
        const copied = pbcopy(res)
        if (copied) {
          console.log(chalk.green(`Transaction ID copied to clipboard`))
        } else {
          console.log(chalk.yellow('Could not copy TXID to clipboard'))
        }
        return res
      } else {
        status.fail(`Transaction failed: ${res.error}, ${res.reason}`)
        return res
      }
    })
    .catch(err => {
      status.fail(`Error broadcasting transaction: ${err.message}`)
      throw err
    })
  return broadcastResponse
}

function getAbstractedTxid(txid) {
  return txid.slice(0, 4) + '...' + txid.slice(-4)
}
