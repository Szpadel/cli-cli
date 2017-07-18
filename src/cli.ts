#!/usr/bin/env node
import {CliBootstrapper} from 'clicore'
import * as path from "path";

const packageJson = require('../package.json');
const cli = new CliBootstrapper({
    configFilename: '.cli.json',
    pkgName: packageJson.name,
    cliDescription: packageJson.description,
    cliVersion: packageJson.version,
    blueprintLocation: path.join(__dirname, 'blueprints'),
    cliBin: 'cli-cli'
});
cli.runCli(process.argv);
