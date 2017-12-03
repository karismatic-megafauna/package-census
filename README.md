# package-census
Get an idea of what is going on in your package.json, see trends in usage and other useful things

# TODO
- [ ] Read all the files in a directory, specify as arg
- [ ] Gather all the imports into an object
- [ ] read the following from a config file
   - [ ] imports they care to look for (search packages :: Array)
   - [ ] files to not look in (black listed files :: Array)
- [ ] build up an object with some info about paths and usage of imports

# Workflow
This script could be ran on:
- during an npm hook (post install)
- when a PR was created
- from commandline when curious

Ideally, it would be run consistently and used for reporting so during the build
step of your code is probably the best.

Phase two of this application would be having a UI layer that can visualize this
information as a gh-pages application.

# Input / Output
The following command is run:
`package-census my-lib-root`

1. `my-lib-root` becomes the starting point of the application
1. the config file is read:
    1. if `searchPackages`:
        1. exist, then look for those during file read
        1. is empty, then return an Error helpful message
    1. if `blackListedFiles`:
        1. exist, don't report on those files when encountered
        1. is empty, that is Ok
1. the files are read and parsed
1. the results are returned as a JSON object

