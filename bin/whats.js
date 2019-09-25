#!/usr/bin/env node
const whats = require('../index');
const commander = require('commander');
const program = new commander.Command();

const { normal } = require('../lib/util/config');
const pkg = require('../package.json');
const version = pkg.version;

program.version(version, '-v, --vers', 'output the current version');

program
  .name('whats')
  .usage('<word> [options]')
  .option('-n, --normal', 'normalize text color of your terminal')
  // .option('-s, --sent <sentence>', 'translate a sentence enclosed in single quotation')
  // .option('-f, --from <source>', 'the source language to translate')
  // .option('-t, --to <target>', 'the target language');

program.on('--help', () => {
  console.log('')
  console.log('Examples:');
  console.log('  $ whats love');
  console.log('  $ whats 爱');
  // console.log('  $ whats l’amour --from fr --to zh-CHS');
  // console.log(`  $ whats -s '爱一个人的感觉'`);
  console.log('');
})

if (!process.argv.slice(2).length) {
  console.log('');
  return program.help();
}

program.parse(process.argv);

normal.normalize = !!program.normal;

whats(program.from, program.to);