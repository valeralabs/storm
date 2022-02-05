import { StacksMainnet } from 'micro-stacks/network'
import { fetchPrivate } from 'micro-stacks/common'
import Conf from 'conf'

const conf = new Conf({
  projectName: 'storm',
})

const apiBase = `${conf.get('api.protocol', 'https')}://${conf.get(
  'api.host',
  'mainnet.syvita.org'
)}:${conf.get('api.port', '443')}`

export class UserNetwork extends StacksMainnet {
  constructor(networkConfig = { url: apiBase, fetcher: fetchPrivate }) {
    super(networkConfig)
  }
}
