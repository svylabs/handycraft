#!/usr/bin/env node

const { Command } = require('commander');
const { new_command, open_command } = require('../lib/commands/app');


const program = new Command();
program.version('0.0.1');
const app = program.command('app');

app.command('new <name> <description>')
    .description('Creates a new directory with "name" and app json file locally')
    .action(new_command);

app.command('open <source> <url>')
    .description("Opens the app in the browser")
    .action(open_command);

program.parse(process.argv);