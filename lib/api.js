import fetch from 'node-fetch'
import Conf from 'conf'
import ora from 'ora'
const conf = new Conf({
  projectName: 'storm',
})

const apiBase = `${conf.get('api.protocol', 'https')}://${conf.get(
  'api.host',
  'mainnet.syvita.org'
)}:${conf.get('api.port', '443')}`

export async function checkApi(protocol, host, port) {
  const url = `${protocol}://${host}:${port}/extended/v1/status`
  const response = await fetch(url)
  const json = await response.json()
  return json.status === 'ready'
}

export async function getBnsName(address) {
  const url = `${apiBase}/v1/addresses/stacks/${address}`
  const response = await fetch(url)
  const json = await response.json()
  return json.names[0]
}

export async function getTxs(address) {
  const spinner = ora('Loading transactions').start()
  const baseReq = `${apiBase}/extended/v1/address/${address}/transactions?limit=50&unanchored=true&offset=`
  const first50 = await (await fetch(baseReq + '0')).json()
  const total = first50.total

  spinner.text = 'Loading cache'
  const cache = conf.get(`cache.txs.${address}`, [])
  spinner.text = `Found ${cache.length} transactions in cache`

  if (cache.length === total) {
    // all transactions are cached
    spinner.succeed(
      `Loaded ${cache.length}` +
        (cache.length === 1
          ? ' transaction from cache'
          : ' transactions from cache')
    )
    return cache
  } else {
    // some or no transactions are cached
    const missingTxs = total - cache.length
    let txsLeft = missingTxs
    spinner.text = `Loading ${missingTxs} transactions from API`
    const offsets = getOffsets(missingTxs)

    let txs = await Promise.all(
      // load missing transactions from API
      offsets.map(async offset => {
        const res = await (await fetch(baseReq + offset)).json()
        txsLeft -= res.results.length
        spinner.text = `Loading ${txsLeft}/${missingTxs} transactions from API`
        return res.results
      })
    )
      .catch(console.error)
      .then(txs => {
        txs = txs.flat()
        return [...txs, ...cache]
      })
    // re-add first 50 transactions to txs
    txs = first50.results.concat(txs)

    spinner.text = `Updating cache with ${missingTxs} new transactions`
    conf.set(`cache.txs.${address}`, txs)
    spinner.succeed(
      `Loaded ${txs.length}` +
        (txs.length === 1 ? ' transaction' : ' transactions')
    )

    return txs
  }
}

function getOffsets(total) {
  let offsets = []
  let offset = 50
  while (offset <= total) {
    offsets.push(offset)
    offset += 50
  }
  return offsets
}

export async function getNfts(address) {
  const url = `https://api.stacksdata.info/nft/assets/${address}`
  const res = await fetch(url)
  return await res.json()
}
