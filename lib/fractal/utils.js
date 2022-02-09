import { collectionDisplayNames } from './supported-contracts'

export function getDisplayName(nft) {
  return (
    collectionDisplayNames[nft.assetIdentifier.split('::')[0]] ||
    nft.assetIdentifier.split('::')[1]
  )
}
