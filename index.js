#! /usr/bin/env node
import { program } from 'commander'
import init from './commands/init'
import { config } from './commands/config'
import { signMsg } from './commands/wallet'
import { reset } from './commands/reset'
import key from './commands/key'

program.command('key').description('Get your Key').action(key)

program.command('init').description('Set up Storm').action(init)

program
  .command('reset')
  .description('Reset your Storm Key & settings')
  .action(reset)

program.command('config').description('Configure Storm').action(config)

program
  .command('sign')
  .description('Sign a message from one of your Stacks accounts')
  .action(signMsg)

program.parse()
