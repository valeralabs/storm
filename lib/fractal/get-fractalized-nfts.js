import { fetchReadOnlyFunction } from 'micro-stacks/api'
import { principalCV } from 'micro-stacks/clarity'
import { UserNetwork } from '../network'

const FRACTAL_CONTRACT_ADDRESS = 'SP343J7DNE122AVCSC4HEK4MF871PW470ZSXJ5K66'
const FRACTAL_CONTRACT_NAME = `fractal-v1-8`

export async function getFractalizedNfts(account) {
  const network = new UserNetwork()

  console.log({
    url: network.getCoreApiUrl(),
    contractAddress: FRACTAL_CONTRACT_ADDRESS,
    contractName: FRACTAL_CONTRACT_NAME,
    functionArgs: [principalCV(account.address)],
    sender: FRACTAL_CONTRACT_ADDRESS,
    functionName: 'get-user-fractals',
  })

  // fetch read only function
  const read_only_function = await fetchReadOnlyFunction({
    url: network.getCoreApiUrl(),
    contractAddress: FRACTAL_CONTRACT_ADDRESS,
    contractName: FRACTAL_CONTRACT_NAME,
    functionArgs: [principalCV(account.address)],
    sender: account.address,
    functionName: 'get-user-fractals',
  })

  console.log(read_only_function)
}
