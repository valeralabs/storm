import prompts from 'prompts'
import { autosearch } from '../lib/autosearch'
import { chooseAccount } from '../lib/accounts'
import { getTxs } from '../lib/api'

export async function searchTxs() {
  const account = await chooseAccount()

  const txs = await getTxs(account.address)

  const choices = txs.map(tx => {
    if (tx.tx_type === 'token_transfer') {
      return {
        title: `${
          tx.token_transfer.recipient_address != account.address
            ? 'Sent'
            : 'Received'
        } ${parseInt(tx.token_transfer.amount) / 1_000_000} STX`,
        description: getAbstractedTxid(tx.tx_id),
        name: tx.tx_id,
      }
    } else if (tx.tx_type === 'contract_call') {
      return {
        title: `${tx.contract_call.function_name} ← ${tx.contract_call.contract_id}`,
        description: getAbstractedTxid(tx.tx_id),
        name: tx.tx_id,
      }
    } else {
      return {
        title: tx.tx_id,
        description: getAbstractedTxid(tx.tx_id),
      }
    }
  })

  const { address } = await prompts({
    type: 'autocomplete',
    name: 'address',
    message: 'Find a transaction',
    choices: choices,
    suggest: async (input, choices) => await autosearch(input, choices),
  }).catch(err => {
    console.log(chalk.red(err.message))
    process.exit(1)
  })
}

function getAbstractedTxid(txid) {
  return txid.slice(0, 4) + '...' + txid.slice(-4)
}
