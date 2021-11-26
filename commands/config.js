import prompts from 'prompts'
import { autosearch } from '../lib/autosearch'
import configApi from './config/api'
import changePassword from './config/password'

export async function config() {
  const { select } = await prompts({
    type: 'autocomplete',
    name: 'select',
    message: 'Configure Storm options',
    choices: [
      {
        title: 'Set API server',
        description:
          'Change the API used to fetch transactions and account data',
        value: 'api',
      },
      {
        title: 'Set Stacks node',
        description: 'Change the Stacks node used to broadcast transactions',
        value: 'node',
      },
      {
        title: 'Change password',
        description: 'Change your encryption password',
        value: 'password',
      },
    ],
    suggest: async (input, choices) => await autosearch(input, choices),
  })
  switch (select) {
    case 'api':
      await configApi()
      break
    case 'node':
      console.log('node')
      break
    case 'password':
      await changePassword()
      break
    default:
      break
  }
}
