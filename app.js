const inquirer = require('inquirer');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');

//fields
let cuentas = {};


async function configurarCuenta(cuenta) {
  await exec(`git config --global user.name "${cuenta.name}"`);
  await exec(`git config --global user.email "${cuenta.email}"`);
}

async function printCredenciales() {
  const { stdout: name } = await exec('git config --global user.name');
  const { stdout: email } = await exec('git config --global user.email');

  console.log(`usuario: ${name.replace(/(\r\n|\n|\r)/gm, "")}`);
  console.log(`correo: ${email.replace(/(\r\n|\n|\r)/gm, "")}`);
}

async function readFile() {
  return new Promise((resolve, reject) => {
    fs.readFile(__dirname + '/accounts.json', (err, data) => {
      if (err) reject(err);
      resolve(JSON.parse(data));
    });
  });
}

async function main() {
  fileData = await readFile();
  cuentas = fileData.accounts;

  let choices = cuentas.map((cuenta, index) => `${index}. ${cuenta.name} (${cuenta.alias})`);
  choices.push(choices.length + '. cancelar');

  console.log('==== gitchoose: Confirgirar credenciales globales de git ====');
  console.log('Credenciales actuales:');
  await printCredenciales();
  inquirer.prompt([
    {
      type: 'list',
      name: 'response',
      message: 'que cuenta de git quieres usar de manera global?',
      choices
    },
  ]).then(answers => {
    const index = answers.response.charAt(0);
    if (index == choices.length - 1) { return; }
    const cuenta = cuentas[index];
    configurarCuenta(cuenta).then(() => {
      console.log('==== Nuevas credenciales globales de git ====');
      printCredenciales();
      setTimeout(() => { }, 2000);
    });
  });
}

main();