import chalk from 'chalk'
import ora from 'ora'
import prompts from 'prompts'
import Conf from 'conf'
import { checkApi } from '../../lib/api'

const config = new Conf({
  projectName: 'storm',
})

export default async function configApi() {
  // log the current api with individually coloured protocol, host and port
  console.log(
    `Current API:`,
    chalk.magenta(config.get('api.protocol', 'https')) +
      `://` +
      chalk.magenta(config.get('api.host', 'mainnet.syvita.org')) +
      `:` +
      chalk.magenta(config.get('api.port', 443))
  )

  await prompts([
    {
      type: 'select',
      name: 'protocol',
      message: 'Select protocol',
      choices: [
        { title: 'HTTP', value: 'http' },
        { title: 'HTTPS', value: 'https' },
      ],
      initial: 1,
    },
    {
      type: 'text',
      name: 'host',
      message: 'Enter the API server host/IP',
      initial: config.get('api.host', 'mainnet.syvita.org'),
    },
    {
      type: 'number',
      name: 'port',
      message: 'Enter the API port',
      initial: config.get('api.port', '443'),
    },
  ]).then(async ({ protocol, host, port }) => {
    const spinner = ora('Checking API').start()
    await checkApi(protocol, host, port)
      .catch(err => {
        spinner.fail(`${err}`)
      })
      .then(working => {
        if (working) {
          spinner.succeed('API online')
          config.set('api.protocol', protocol)
          config.set('api.host', host)
          config.set('api.port', port)
          console.log(chalk.green('API configured successfully'))
        } else {
          spinner.fail('API offline')
          console.log(chalk.yellow("API wasn't changed"))
        }
      })
  })
}

export async function connectivityCheck() {
  const spinner = ora('Checking connectivity').start()
  const [protocol, host, port] = [
    config.get('api.protocol', 'https'),
    config.get('api.host', 'mainnet.syvita.org'),
    config.get('api.port', 443),
  ]
  return await checkApi(protocol, host, port)
    .catch(err => {
      spinner.fail(`${err}`)
    })
    .then(working => {
      if (working) {
        spinner.succeed('API online')
        return working
      } else {
        spinner.fail('API offline')
        return working
      }
    })
}
