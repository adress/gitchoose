const inquirer = require('inquirer');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const yargs = require('yargs');

//fields
let accountList = {};


async function configurarCuenta(account, isGlobal) {
  if (isGlobal) {
    await exec(`git config --global user.name "${account.name}"`);
    await exec(`git config --global user.email "${account.email}"`);
  } else {
    await exec(`git config user.name "${account.name}"`);
    await exec(`git config user.email "${account.email}"`);
  }
}

async function printCredenciales(isGlobal) {
  if (isGlobal) {
    const { stdout: name } = await exec('git config --global user.name');
    const { stdout: email } = await exec('git config --global user.email');
    console.log(`usuario: ${name.replace(/(\r\n|\n|\r)/gm, "")}`);
    console.log(`correo: ${email.replace(/(\r\n|\n|\r)/gm, "")}`);
  } else {
    const { stdout: name } = await exec('git config user.name');
    const { stdout: email } = await exec('git config user.email');
    console.log(`usuario: ${name.replace(/(\r\n|\n|\r)/gm, "")}`);
    console.log(`correo: ${email.replace(/(\r\n|\n|\r)/gm, "")}`);
  }
}

async function readFile() {
  return new Promise((resolve, reject) => {
    fs.readFile(__dirname + '/accounts.json', (err, data) => {
      if (err) reject(err);
      resolve(JSON.parse(data));
    });
  });
}

async function main(isGlobal) {
  fileData = await readFile();
  accountList = fileData.accounts;

  let choices = accountList.map((account, index) => `${index}. ${account.name} (${account.alias})`);
  choices.push(choices.length + '. cancelar');

  const scopeType = isGlobal ? 'global' : 'local';
  console.log(`==== gitchoose: Confirgirar credenciales ${scopeType} de git ====`);
  console.log('Credenciales actuales:');
  await printCredenciales();
  inquirer.prompt([
    {
      type: 'list',
      name: 'response',
      message: `que cuenta de git quieres usar de manera ${scopeType}?`,
      choices
    },
  ]).then(answers => {
    const index = answers.response.charAt(0);
    if (index == choices.length - 1) { return; }
    const cuenta = accountList[index];
    configurarCuenta(cuenta, isGlobal).then(() => {
      console.log(`==== Nuevas credenciales ${scopeType} de git ====`);
      printCredenciales(isGlobal);
      setTimeout(() => { }, 2000);
    });
  });
}


const argv = yargs
  .option('g', {
    alias: 'global',
    describe: 'Configurar credenciales globales de git',
    type: 'boolean',
    demandOption: false // no es obligatorio
  })
  .help()
  .argv;


console.log(argv.g)

main(argv.g? true : false);