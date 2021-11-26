import chalk from 'chalk'
import prompts from 'prompts'
import { getSecretKey } from '../lib/vault'

export default async function key() {
  const { password } = await prompts({
    type: 'password',
    name: 'password',
    message: 'Enter your password:',
  })
  console.log(await getSecretKey(password))
}
