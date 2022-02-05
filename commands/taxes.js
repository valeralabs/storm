import { chooseAccount } from '../lib/accounts'
import { getTxs } from '../lib/api'

const EXCHANGE_ADDRESSES = [
  // kucoin
  'SPX8T06E8FJQ33CX8YVR9CC6D9DSTF6JE0Y8R7DS',
  // binance
  'SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS',
]

export async function getExchangeTransfers() {
  const account = await chooseAccount()
  const txs = await getTxs(account.address)

  console.log(JSON.stringify(txs))

  const transfersToExchanges = txs.filter(tx => {
    return (
      tx.tx_type === 'token_transfer' &&
      EXCHANGE_ADDRESSES.includes(tx.token_transfer.recipient_address)
    )
  })

  let deDuuped = []

  transfersToExchanges.forEach(c => {
    if (!deDuuped.includes(c)) {
      deDuuped.push(c)
    }
  })

  let totalStxToExchanges = 0

  deDuuped.map(tx => {
    const amount = parseInt(tx.token_transfer.amount)
    totalStxToExchanges += amount
    const { burn_block_time, burn_block_time_iso } = tx
    // console.log(burn_block_time_iso)
    // console.log(
    //   `${amount / 1_000_000} STX sold on ${new Date(burn_block_time_iso)}`
    // )
  })

  console.log(deDuuped.length)
  console.log(`Total STX: ${deDuuped / 1_000_000}`)

  const MIA_INBOUND = txs.filter(tx => {
    const c = tx.contract_call
    if (!c) return false
    const inbound =
      c.contract_id ===
        'SP466FNC0P7JWTNM2R9T199QRZN1MYEDTAR0KP27.miamicoin-token' &&
      c.function_name === 'transfer' &&
      c.function_args[2]
        ? c.function_args[2].repr === account.address
        : false
    return inbound ? tx : undefined
  })

  console.log(`Detected ${MIA_INBOUND.length} inbound transactions of MIA`)
}
