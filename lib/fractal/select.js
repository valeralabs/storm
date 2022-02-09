import ora from 'ora'
import { getNfts } from '../api'
import { supportedContracts } from './supported-contracts'
import { getDisplayName } from './utils'
import prompts from 'prompts'

export async function selectNftFromBalance(account) {
  const spinner = ora('Loading NFTs').start()

  const userNfts = await getNfts(account.address)

  const nfts = userNfts.filter(nft =>
    supportedContracts.includes(nft.assetIdentifier.split('::')[0])
  )

  const collectionChoices = nfts
    // remap params for display in prompts
    .map(nft => {
      return {
        title: getDisplayName(nft),
        value: nft.assetIdentifier,
        description: nft.assetIdentifier,
      }
    })
    // basically this removes duplicate objects from this map by collection title
    .filter((v, i, a) => a.findIndex(t => t.title === v.title) === i)

  spinner.succeed('NFTs loaded')

  const { collection } = await prompts({
    type: 'autocomplete',
    name: 'collection',
    message: 'Pick a collection',
    choices: collectionChoices,
    suggest: async (input, choices) => await autosearch(input, choices),
  }).catch(err => {
    console.log(chalk.red(err.message))
    process.exit(1)
  })

  const { nftValue } = await prompts({
    type: 'autocomplete',
    name: 'nftValue',
    message: 'Pick an NFT',
    choices: nfts
      .filter(nft => nft.assetIdentifier === collection)
      .map(nft => {
        return {
          title: `#${nft.value}`,
          ...nft,
        }
      }),
    suggest: async (input, choices) => await autosearch(input, choices),
  }).catch(err => {
    console.log(chalk.red(err.message))
    process.exit(1)
  })

  return nfts.find(
    nft => nft.assetIdentifier === collection && nft.value === nftValue
  )
}
