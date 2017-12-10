const acorn = require("acorn/dist/acorn_loose");
const walk = require('acorn/dist/walk');
const fs = require('fs-extra');
const chalk = require('chalk');
const findIt = require('findit');
const path = require('path');
let myArgs = require('optimist').argv;
let compList = [];

if ( myArgs._.length === 0) {
  console.log('No config file found, please specify a config file');
  console.log('');
  console.log(`Be sure to specify the following keys in your config file:
   - ${chalk.green('searchPackages')}
   - ${chalk.green('appRoot')}
  `);
  process.exit(1);
}

// ---------------------------------------
// Functions
// ---------------------------------------
function initialize(list) {
  const componentScaffold = [];
  for (const comp in list) {
    componentScaffold.push({
      name: list[comp],
      count: 0,
      paths: [],
    });
  }
  return componentScaffold;
}

function matchComponent(fileString, filePath) {
  const ast = acorn.parse_dammit(fileString, { sourceType: 'module' })

  walk.simple(ast, {
    ImportDeclaration(n) {
      compList = compList.map(comp => {
        const isComp = comp.name.toLowerCase() === n.source.value.toLowerCase();
        return {
          ...comp,
          count: isComp ? comp.count + 1 : comp.count,
          paths: isComp ? comp.paths.concat(filePath) : comp.paths,
        }
      });
    },
  });
}

// Promise Factory
const walkDirectory = directory => new Promise((resolve) => {
  const finder = findIt(directory);
  finder.on('file', (filePath) => {
    const contents = fs.readFileSync(filePath, 'utf8');
    matchComponent(contents, filePath);
  });

  finder.on('end', () => resolve(directory));
});

// ---------------------------------------
// Script Body
// ---------------------------------------

const configFile = myArgs._[0];

fs.stat(configFile, (err, stat) => {
  if(err == null) {
    const configOptions = fs.readJsonSync(configFile)
    if (!configOptions.searchPackages) {
      console.log('');
      console.log(`${chalk.red('searchPackages')} was not defined in your config file,`);
      console.log('');
      console.log(`${chalk.blue(configFile)}:`);
      console.log('```');
      console.log(JSON.stringify(configOptions, null, 2));
      console.log('```');
      console.log('');
      console.log(`please specify ${chalk.red('searchPackages')} this key with an array of package names as strings.`);
      process.exit(1);
    } else if (!configOptions.appRoot) {
      console.log('');
      console.log(`${chalk.red('appRoot')} was not defined in the following config file`);
      console.log('');
      console.log(`${chalk.blue(configFile)}:`);
      console.log('```');
      console.log(JSON.stringify(configOptions, null, 2));
      console.log('```');
      console.log('');
      console.log(`please specify ${chalk.red('appRoot')} with a path to the root of the project you would like to search in.`);
      process.exit(1);
    } else {
      compList = initialize(configOptions.searchPackages);

      const directories = [configOptions.appRoot];

      const dirWalkPromises = directories.map(walkDirectory);
      Promise.all(dirWalkPromises).then(() => {
        if (!configOptions.showPaths) {
          compList = compList.map(comp => {
            return {
              name: comp.name,
              count: comp.count,
            }
          });
        }

        const formattedData = JSON.stringify(compList, null, 2);
        console.log(formattedData);
      });
    }
  } else if(err.code == 'ENOENT') {
    console.log(`${chalk.red(configFile)} does not exist, please specify correct path to config file`);
    console.log('');
    console.log(`Be sure to specify the following keys in your config file:
   - ${chalk.green('searchPackages')}
   - ${chalk.green('appRoot')}
  `);
  } else {
    console.log('Some other error: ', err.code);
  }
});
