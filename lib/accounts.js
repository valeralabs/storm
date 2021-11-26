import { getStxAddressFromAccount } from 'micro-stacks/wallet-sdk'
import { getBnsName } from './api'

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
