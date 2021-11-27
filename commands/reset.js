import chalk from 'chalk'
import ora from 'ora'
import prompts from 'prompts'
import conf from 'conf'
import { deleteSecretKey } from '../lib/vault'

const config = new conf({
  projectName: 'storm',
})

export async function reset() {
  const { resetKey, resetSettings } = await prompts([
    {
      type: 'confirm',
      name: 'resetKey',
      message: 'Do you want to reset your key?',
      initial: false,
    },
    {
      type: 'confirm',
      name: 'resetSettings',
      message: 'Do you want to reset your settings?',
      initial: false,
    },
  ])
  if (resetKey) {
    const spinner = ora('Deleting key').start()
    await deleteSecretKey()
      .then(() => {
        spinner.succeed('Key deleted')
      })
      .catch(err => {
        spinner.fail(err.message)
      })
  }

  if (resetSettings) {
    const spinner = ora('Deleting settings').start()
    config.clear()
    spinner.succeed('Settings deleted')
  }

  if (!resetSettings && !resetKey) {
    console.log(chalk.red('Cancelled'))
  }
}
