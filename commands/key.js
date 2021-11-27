import { promptPassword } from '../lib/prompt'
import { getSecretKey } from '../lib/vault'

export default async function key() {
  const password = await promptPassword()
  console.log(await getSecretKey(password))
}
