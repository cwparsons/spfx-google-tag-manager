//@ts-check
const fs = require('fs');

const solutionConfigPath = './config/package-solution.json';

const nextPkgVersion = process.env.npm_package_version;
console.log(`Next version: ${nextPkgVersion}`);

// Get the version passed in as argument
const nextVersion = nextPkgVersion.indexOf('-') === -1 ?
    nextPkgVersion : nextPkgVersion.split('-')[0];

// Read package-solution file
const solutionFileContent = fs.readFileSync(solutionConfigPath, 'UTF-8');

// Parse file as json
const solutionContents = JSON.parse(solutionFileContent);

// Set property of version to next version
solutionContents.solution.version = nextVersion + '.0';

fs.writeFileSync(
  solutionConfigPath,
  // Convert file back to proper json
  JSON.stringify(solutionContents, null, 2),
  'UTF-8'
);
