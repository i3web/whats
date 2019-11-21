#!/usr/bin/env node
const whats = require('../index');
const record = require('../lib/db');
const commander = require('commander');
const logSymbols = require('log-symbols');
const sqlite = require('sqlite3').verbose();
const { checkVers } = require('../lib/util/checkVers');
const {
  dropDB,
  tableCreated
} = require('../lib/db/handlers');
const dropCLI = require('../lib/db/dropCLI');

const program = new commander.Command();
const { config } = require('../lib/util/config');
const pkg = require('../package.json');
const version = pkg.version;

program.version(version, '-v, --vers', 'output the current version');

program
  .name('whats')
  .usage('<query> [options]')
  .option('-n, --normal', 'normalize text color of your terminal')
  .option('-f, --from <source>', 'the source language to translate')
  .option('-t, --to <target>', 'the target language')
  .option('-s, --say', 'use default system voice and speak')
  .option('-r, --record [limit: number | clear]', 'show the query record');

program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ whats love');
  console.log('  $ whats bonjour -f fr');
  console.log('  $ whats こんにちは -f ja -t en');
  console.log('  $ whats I love you very much');
  console.log('  $ whats -r clear');
  console.log('  $ whats -r 10');
  console.log('');
})

if (!process.argv.slice(2).length) {
  console.log('');
  return program.help();
}
if (!checkVers()) {
  return console.log(logSymbols.warning + ' 您的 Node.js 版本过低');
}

program.parse(process.argv);

config.say = !!program.say;
config.normalize = !!program.normal;

// deal with record commander
let limit;
const rawRecord = program.record;
const recordConfig = config.recordConfig;
const invaild = logSymbols.error + ' ' + `无效参数 (${rawRecord})，使用 -h 查看帮助`;
if (rawRecord && typeof rawRecord === 'string') {
  if (rawRecord === 'clear') {
    return dropCLI(() => dropDB('.whats.sqlite'));// use dropDB as closure to avoid path issue
  }
  if (!(limit = Number(rawRecord))) {
    return console.log(invaild);
  }
  recordConfig.limit = limit;
}

// For now, it's easily to fail to find the database file by spreading the database creation, 
// so we'll have to create it in the first place
const db = new sqlite.cached.Database('.whats.sqlite');
tableCreated('.whats.sqlite').then(created => {
  const dbOpts = { db, created };
  config.dbOpts = dbOpts;
  program.record
    ? record()
    : whats(program.from, program.to);
})
.catch(e => {
  console.log(logSymbols.error + ' ' + e.message);
  db.close();
});