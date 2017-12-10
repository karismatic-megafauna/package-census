const acorn = require("acorn/dist/acorn_loose");
const walk = require('acorn/dist/walk');
const fs = require('fs-extra');
const findIt = require('findit');
const path = require('path');
let myArgs = require('optimist').argv,
	help = 'Please provide the specified arguments';
let compList = [];
const searchPackages = ['react-redux', 'redux-modules', 'reselect'];
const appRoot = '../Procore/procore/wrench/src';

if ((myArgs.h) || (myArgs.help)) {
	process.exit(0);
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

const configOptions = fs.readJsonSync(configFile)
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
