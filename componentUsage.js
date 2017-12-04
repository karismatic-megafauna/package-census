let myArgs = require('optimist').argv,
	help = 'Please provide the specified arguments';

if ((myArgs.h)||(myArgs.help)) {
	console.log(help);
	process.exit(0);
}
console.log('myArgs: ', myArgs);

const fs = require('fs');
const findIt = require('findit');
const path = require('path');
const isRelease = process.env.RELEASE || false;
let compList = [];

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
			hasTests: err === null,
		});
	}
  return componentScaffold;
}

function matchComponent(fileString, filePath) {
    // PARSE TO AST
    //  - get all imports
    //  - get all places our searchPackages are used
    // const isParent = fileString.indexOf(`/${comp.name}/`) !== -1;
    // const isChild = fileString.indexOf(`/${comp.name}'`) !== -1;
    // if (isParent || isChild ) {
    //   comp.count += 1;
    //   comp.paths.push(filePath);
    // }
}

function filterComponents(reqComps, allComps) {
  return reqComps.map((reqComp) => {
    const foundComponent = allComps.filter(comp => comp === reqComp)[0];
    if (foundComponent !== undefined) {
      return foundComponent;
    }
  });
}

// Promise Factory
const walkDirectory = directory => new Promise((resolve) => {
  const finder = findIt(directory);
  finder.on('file', (filePath) => {
    const contents = fs.readFileSync(filePath, 'utf8');
    const isJS = path.extname(filePath) === '.js';
    const isJSX = path.extname(filePath) === '.jsx';
    if ( isJS || isJSX ) {
      // pass contents to Acorn
      matchComponent(contents, filePath);
    }
  });

  finder.on('end', () => resolve(directory));
});

// ---------------------------------------
// Script Body
// ---------------------------------------

const searchPackages = ['lodash', 'ramda', 'underscore', 'immutable'];
compList = initialize(searchPackages);

const appRoot = './testData/MyProjectRoot';
const directories = [appRoot];

const dirWalkPromises = directories.map(walkDirectory);
Promise.all(dirWalkPromises).then(() => {
  const metaInfo = compList.reduce((acc, curr) => {
    const isMostUsed = curr.count >= acc.count;
    return {
      grandTotal: acc.grandTotal + curr.count,
      mostUsed: isMostUsed ? curr.name : acc.mostUsed,
      count: isMostUsed ? curr.count : acc.count,
    };
  }, { grandTotal: 0, mostUsed: '', count: 0 });

  const compListTotals = {
    componentList: compList,
    grandTotal: metaInfo.grandTotal,
    mostUsed: {
      name: metaInfo.mostUsed,
      count: metaInfo.count,
    },
  };
	const formattedData = JSON.stringify(compListTotals, null, 2);

	return console.log(formattedData);
});
