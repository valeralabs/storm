import keytar from 'keytar'
import StringCrypto from 'string-crypto'
import bip39 from 'bip39'
import { generateSecretKey, generateWallet } from 'micro-stacks/wallet-sdk'
import { restoreWalletAccounts } from '@stacks/wallet-sdk'

// functions:
// create new secret key
// retrieve secret key

export async function createSecretKey(entropy, password) {
  if (!entropy) {
    entropy = 128
  }

  const { encryptString } = new StringCrypto()
  const secretKey = generateSecretKey(entropy)
  const encryptedSecretKey = await encryptString(secretKey, password)
  await keytar.setPassword('storm', `secretKey`, encryptedSecretKey)
  return secretKey
}

export async function importSecretKey(key, password) {
  if (bip39.validateMnemonic(key)) {
    const { encryptString } = new StringCrypto()
    const encryptedSecretKey = await encryptString(key, password)
    await keytar.setPassword('storm', `secretKey`, encryptedSecretKey)
  } else {
    throw new Error('Invalid mnemonic')
  }
}

export async function getSecretKey(password) {
  const encryptedSecretKey = await keytar.getPassword('storm', `secretKey`)
  if (encryptedSecretKey) {
    const { decryptString } = new StringCrypto()
    return decryptString(encryptedSecretKey, password)
  } else {
    return null
  }
}

export async function secretKeyExists() {
  const encryptedSecretKey = await keytar.getPassword('storm', `secretKey`)
  return encryptedSecretKey == null ? false : true
}

export async function deleteSecretKey() {
  await keytar.deletePassword('storm', `secretKey`)
}

function getWalletPassword() {
  return Math.random().toString(36).slice(2)
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
