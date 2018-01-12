# package-census
Get an idea of what is going on in your package.json, see trends in usage and other useful things

# Usage
While it is not on npm, clone this repo and specify a configuration JSON file with the following keys:

- searchPackages: an array of strings that are pacakges you would like to track
- appRoot: string that is the path to the root of the project you want to query

```json
{
  "searchPackages": ["lodash", "ramda", "underscore", "immutable"],
  "appRoot": "app/index.js"
}
```
Run the script:

`node componentUsage.js configFile.json`

Example output:
```json
[
  {
    "name": "lodash",
    "count": 38,
    "paths": ["..."]
  },
  {
    "name": "ramda",
    "count": 179,
    "paths": ["..."]
  },
  {
    "name": "underscore",
    "count": 3,
    "paths": ["..."]
  },
  {
    "name": "immutable",
    "count": 460,
    "paths": [...]
  }
]
```

And there you have it! Looks like _Underscore_ is some low hanging fruit and can be removed relatively easily! 
Go get'em tiger! 

# TODO
- [x] Read all the files in a directory, specify as arg
- [x] Gather all the imports into an object
- [x] read the following from a config file
   - [x] imports they care to look for (search packages :: Array)
   - [x] files to not look in (black listed files :: Array)
- [x] build up an object with some info about paths and usage of imports
- [ ] publish on npm

# Workflow
This script could be ran on:
- during an npm hook (post install)
- when a PR was created
- from commandline when curious

Ideally, it would be run consistently and used for reporting so during the build
step of your code is probably the best.

Phase two of this application would be having a UI layer that can visualize this
information as a gh-pages application.

# Script Psuedo Code
The following command is run:
`node componentUsage.js configFile.json`

1. `configFile` is read and `appRoot` becomes the starting point of the application
1. the config file also provides:
    1. if `searchPackages`:
        1. exist, then look for those during file read
        1. is empty, then return an Error helpful message
1. the files are read and parsed
1. the results are returned as a JSON object

