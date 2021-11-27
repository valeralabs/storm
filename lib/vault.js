import keytar from 'keytar'
import { validateMnemonic } from 'micro-stacks/bip39'
import {
  generateSecretKey,
  generateWallet,
  encryptMnemonic,
  decryptMnemonic,
} from 'micro-stacks/wallet-sdk'
import { restoreWalletAccounts } from '@stacks/wallet-sdk'
import { bytesToBigInt, bytesToHex } from 'micro-stacks/common'
import { getRandomBytes } from 'micro-stacks/crypto'

// functions:
// create new secret key
// retrieve secret key

async function encryptAndSaveMnemonic(secretKey, password) {
  if (!secretKey) throw Error('Missing secretKey')
  if (!password) throw Error('Missing password')
  const encryptedSecretKey = await encryptMnemonic(secretKey, password)
  await keytar.setPassword('storm', `secretKey`, bytesToHex(encryptedSecretKey))
  return encryptedSecretKey
}

export async function createSecretKey(entropy = 128, password) {
  const secretKey = generateSecretKey(entropy)
  await encryptAndSaveMnemonic(secretKey, password)
  return secretKey
}

export async function importSecretKey(secretKey, password) {
  if (validateMnemonic(secretKey)) {
    await encryptAndSaveMnemonic(secretKey, password)
  } else {
    throw new Error('Invalid mnemonic')
  }
}

export async function getSecretKey(password) {
  const encryptedSecretKey = await keytar.getPassword('storm', `secretKey`)
  if (encryptedSecretKey) return decryptMnemonic(encryptedSecretKey, password)
  return null
}

export async function secretKeyExists() {
  return (await keytar.getPassword('storm', `secretKey`)) !== null
}

export async function deleteSecretKey() {
  await keytar.deletePassword('storm', `secretKey`)
}

function getWalletPassword() {
  return bytesToBigInt(getRandomBytes(16)).toString(36).slice(2)
}

export async function getWallet(password) {
  return await restoreWalletAccounts({
    wallet: await generateWallet(
      await getSecretKey(password),
      getWalletPassword()
    ),
    gaiaHubUrl: 'https://hub.blockstack.org',
  })
}
