#! /usr/bin/env node
import { program } from "commander";
import list from "./commands/list";
import init from "./commands/init";
import { deleteKey } from "./commands/delete-key";
import { config } from "./commands/config";
import { signMsg } from "./commands/wallet";

program
    .command('list')
    .description('List all the tasks')
    .action(list)

program
    .command('init')
    .description('Set up Storm')
    .action(init)

program
    .command('reset')
    .description('Delete your Storm key')
    .action(deleteKey)

program 
    .command('config')
    .description('Configure Storm')
    .action(config)

program 
    .command('sign')
    .description('Sign a message from one of your Stacks accounts')
    .action(signMsg)

program.parse()