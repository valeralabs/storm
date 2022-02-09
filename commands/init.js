import animation from 'chalk-animation'
import ora from 'ora'
import chalk from 'chalk'
import prompts from 'prompts'
import { validateMnemonic } from 'micro-stacks/bip39'
import { createSecretKey, importSecretKey, secretKeyExists } from '../lib/vault'
const log = console.log

export default async function init() {
  const key = await secretKeyExists()

  if (key) {
    log(
      chalk.red(
        '\nStorm is already setup. If you want to change the key, run `storm reset`\n' +
          "If you want to change Storm's settings, run `storm config`\n"
      )
    )
    return process.exit(0)
  }

  let anim = animation.glitch(`\nS T O R M\n`)
  await new Promise(res => setTimeout(res, 1500))
  anim.stop()
  log('Hey there!')
  log('Welcome to the Storm CLI!')

  log('Storm is a secure authenticator and wallet available from your terminal')

  const response = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Ready?',
    initial: true,
  })

  if (response.value) {
    log('\nAwesome. To get started, we need to create or import a Secret Key.')
    log(
      "The Secret Key is stored securely in your operating system's keychain."
    )

    const response = await prompts({
      type: 'select',
      name: 'shouldCreateKey',
      message: 'Key retrieval',
      choices: [
        {
          title: 'Create a Key',
          description: "We'll create a new random Key for you",
          value: true,
        },
        {
          title: 'Import a Key',
          description: 'Use a Key you already have',
          value: false,
        },
      ],
      initial: 1,
    })

    if (response.shouldCreateKey) {
      const { password } = await prompts({
        type: 'password',
        name: 'password',
        message: 'Enter a password',
        validate: password =>
          password.length < 6 ? 'Password must be at least 6 characters' : true,
      })

      const spinner = ora('Creating Secret Key').start()
      const key = await createSecretKey(128, password)
      spinner.succeed(`Created Secret Key: ${key}`)
      log(chalk.green('\nSetup successful! Storm is ready.'))
      log(chalk.bgYellow.black(' ⚠ Ensure you have backed up your key! \n'))
    } else {
      const { key, password } = await prompts([
        {
          type: 'text',
          name: 'key',
          message: 'Enter your Secret Key',
          validate: key =>
            !validateMnemonic(key.trim()) ? 'Invalid Secret Key' : true,
        },
        {
          type: 'password',
          name: 'password',
          message: 'Enter a password',
          validate: password =>
            password.length < 6
              ? 'Password must be at least 6 characters'
              : true,
        },
      ])
      log()
      const spinner = ora('Importing Secret Key').start()
      await importSecretKey(key, password)
      spinner.succeed('Imported Secret Key')
      log(chalk.green('\nSetup successful! Storm is ready.'))
      log(chalk.bgYellow.black(' ⚠ Ensure you have backed up your key! \n'))
    }
  }
}
