import { StacksMainnet } from 'micro-stacks/network'
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
} from 'micro-stacks/transactions'
import ora from 'ora'
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
      status.succeed(`Transaction ${res} broadcast.`)
      return res
    })
    .catch(err => {
      status.fail(`Error broadcasting transaction: ${err.message}`)
      throw err
    })
  return broadcastResponse
}
