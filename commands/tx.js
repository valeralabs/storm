import prompts from 'prompts'
import { autosearch } from '../lib/autosearch'
import { chooseAccount } from '../lib/accounts'
import { getTxs } from '../lib/api'
import { table } from 'table'
import chalk from 'chalk'

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
        value: tx.tx_id,
      }
    } else if (tx.tx_type === 'contract_call') {
      return {
        title: `${tx.contract_call.function_name} ← ${tx.contract_call.contract_id}`,
        description: getAbstractedTxid(tx.tx_id),
        value: tx.tx_id,
      }
    } else {
      return {
        title: tx.tx_id,
        description: getAbstractedTxid(tx.tx_id),
        value: tx.tx_id,
      }
    }
  })

  const { txid } = await prompts({
    type: 'autocomplete',
    name: 'txid',
    message: 'Find a transaction',
    choices: choices,
    suggest: async (input, choices) => await autosearch(input, choices),
  }).catch(err => {
    console.log(chalk.red(err.message))
    process.exit(1)
  })

  const tx = txs.find(tx => tx.tx_id === txid)

  const constructTable = tx => {
    switch (tx.tx_type) {
      case 'token_transfer':
        return table([
          [chalk.bold('Transaction ID'), tx.tx_id],
          [chalk.bold('Transaction Type'), tx.tx_type],
          [
            chalk.bold('Amount'),
            parseInt(tx.token_transfer.amount) / 1_000_000 + ' STX',
          ],
          [
            chalk.bold('Recipient Address'),
            tx.token_transfer.recipient_address,
          ],
          [chalk.bold('Sender Address'), tx.sender_address],
        ])
      case 'contract_call':
        return table([
          [chalk.bold('Transaction ID'), tx.tx_id],
          [chalk.bold('Transaction Type'), tx.tx_type],
          [chalk.bold('Contract ID'), tx.contract_call.contract_id],
          [chalk.bold('Function Name'), tx.contract_call.function_name],
          [chalk.bold('Sender Address'), tx.sender_address],
          [chalk.bold('Status'), tx.tx_status],
          [
            chalk.bold('Post-conditions'),
            tx.post_condition_mode === 'deny'
              ? tx.post_conditions
                  .map(pc => {
                    return [
                      `${pc.principal.address} ${pc.condition_code} ${pc.amount} of ${pc.asset.asset_name}`,
                    ]
                  })
                  .flat()
                  .join('\n')
              : 'Allow mode',
          ],
          [chalk.bold('Block height'), tx.block_height],
          [chalk.bold('Block hash'), tx.block_hash],
          [chalk.bold('Canonical'), tx.canonical],
          [chalk.bold('Result'), tx.tx_result.repr],
          [
            chalk.bold('Size'),
            [
              `Read count: ${tx.execution_cost_read_count}`,
              `Write count: ${tx.execution_cost_write_count}`,
              `Read length: ${tx.execution_cost_read_length}`,
              `Write length: ${tx.execution_cost_write_length}`,
              `Runtime: ${tx.execution_cost_runtime}`,
            ].join('\n'),
          ],
          [
            chalk.bold('Function arguments'),
            tx.contract_call.function_args
              .map(arg => {
                return `${chalk.bold(arg.name)} - ${arg.repr} (${arg.type})`
              })
              .join('\n'),
          ],
        ])
      default:
        return table([
          [chalk.bold('Transaction ID'), tx.tx_id],
          [chalk.bold('Transaction Type'), tx.tx_type],
        ])
    }
  }

  console.log(constructTable(tx))
}

function getAbstractedTxid(txid) {
  return txid.slice(0, 4) + '...' + txid.slice(-4)
}
