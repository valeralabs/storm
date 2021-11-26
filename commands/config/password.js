import ora from 'ora'
import prompts from 'prompts'
import bip39 from 'bip39'
import { getSecretKey, importSecretKey } from '../../lib/vault'

export default async function changePassword() {
  await prompts([
    {
      type: 'password',
      name: 'oldPw',
      message: 'Enter old password',
      validate: async old =>
        bip39.validateMnemonic(await getSecretKey(old))
          ? true
          : 'Incorrect password',
    },
    {
      type: 'password',
      name: 'newPw',
      message: 'Enter new password',
      validate: newPassword =>
        newPassword.length >= 6
          ? true
          : 'Password must be at least 6 characters long',
    },
  ]).then(async ({ oldPw, newPw }) => {
    const spinner = ora('Changing password').start()
    try {
      const secretKey = await getSecretKey(oldPw)
      await importSecretKey(secretKey, newPw).then(() => {
        spinner.succeed('Password changed')
      })
    } catch (e) {
      spinner.fail(e.message)
      return
    }
  })
}
