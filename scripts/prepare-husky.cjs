const { existsSync } = require('node:fs');
const { spawnSync } = require('node:child_process');

const isCi = process.env.CI === 'true';
const hasGitDirectory = existsSync('.git');

if (isCi || !hasGitDirectory) {
  const reason = isCi ? 'CI environment detected' : '.git directory not found';

  console.log(`Skipping Husky install: ${reason}.`);
  process.exit(0);
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(npmCommand, ['exec', '--', 'husky'], {
  stdio: 'inherit',
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 0);
