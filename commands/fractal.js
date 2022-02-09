import prompts from 'prompts'
import { autosearch } from '../lib/autosearch'
import { chooseAccount } from '../lib/accounts'
import chalk from 'chalk'
import { getDisplayName } from '../lib/fractal/utils'

import { makeSmartContractCall } from '../lib/transactions'
import { contractPrincipalCV, uintCV } from 'micro-stacks/clarity'
import {
  createAssetInfo,
  makeStandardNonFungiblePostCondition,
  NonFungibleConditionCode,
} from 'micro-stacks/transactions'
import { getFractalizedNfts } from '../lib/fractal/get-fractalized-nfts'
import { selectNftFromBalance } from '../lib/fractal/select'

const FRACTAL_CONTRACT_ADDRESS = 'SP343J7DNE122AVCSC4HEK4MF871PW470ZSXJ5K66'
const FRACTAL_CONTRACT_NAME = `fractal-v1-8`

export async function ftl() {
  const account = await chooseAccount()

  const { action } = await prompts({
    type: 'autocomplete',
    name: 'action',
    message: 'What do you want to do?',
    choices: [
      {
        title: 'Fractalize',
        description: 'Split an NFT into many Fractals.',
      },
      {
        title: 'Transfer',
        //description: 'Transfer some fractals to another account.',
        description: "⚠️ Doesn't work yet",
      },
      {
        title: 'Defractalize',
        //description: 'Merge Fractals into their NFT.',
        description: "⚠️ Doesn't work yet",
      },
    ],
    suggest: async (input, choices) => await autosearch(input, choices),
  }).catch(err => {
    console.log(chalk.red(err.message))
    process.exit(1)
  })

  switch (action) {
    case 'Fractalize':
      await fractalize(account)
      break
    case 'Transfer':
      await transfer(account)
      break
    case 'Defractalize':
      await defractalize(account)
      break
  }
}

async function fractalize(account) {
  const selectedNft = await selectNftFromBalance(account)

  const { fractalCount } = await prompts({
    type: 'number',
    name: 'fractalCount',
    message: `How many pieces do you want to split #${selectedNft.value} into?`,
    initial: 10,
    style: 'default',
    min: 1,
  }).catch(err => {
    console.log(chalk.red(err.message))
    process.exit(1)
  })

  console.log(
    chalk.gray('Fractalizing'),
    chalk.blue(`#${selectedNft.value}`),
    chalk.gray('from'),
    chalk.blue(getDisplayName(selectedNft)),
    chalk.gray('into'),
    chalk.blue(`${fractalCount} pieces`) + chalk.gray('...')
  )

  const standardNonFungiblePostCondition = makeStandardNonFungiblePostCondition(
    account.address, // user address...
    NonFungibleConditionCode.DoesNotOwn, // does not own this nft...
    createAssetInfo(
      selectedNft.assetIdentifier.split('.')[0], // contract address
      selectedNft.assetIdentifier.split('.')[1].split('::')[0], // contract name
      selectedNft.assetIdentifier.split('::')[1] // asset identifier in contract
    ),
    uintCV(Number(selectedNft.value)) // nft sip9 id
    // ... after this transaction is complete, otherwise abort
  )

  // a wrapper around microstacks that renders status and broadcast etc as it
  // makes the transaction
  await makeSmartContractCall(
    account,
    FRACTAL_CONTRACT_ADDRESS,
    FRACTAL_CONTRACT_NAME,
    'fractalize-nft',
    [
      contractPrincipalCV(
        selectedNft.assetIdentifier.split('.')[0],
        selectedNft.assetIdentifier.split('.')[1].split('::')[0]
      ),
      uintCV(Number(selectedNft.value)),
      uintCV(fractalCount),
    ],
    [standardNonFungiblePostCondition]
  )
}

async function transfer(account) {}

async function defractalize(account) {
  //const spinner = ora('Loading fractalized NFTs').start()

  await getFractalizedNfts(account)
}
