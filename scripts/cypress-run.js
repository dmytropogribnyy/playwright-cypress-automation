#!/usr/bin/env node
/**
 * Cross-platform Cypress launcher.
 * Removes ELECTRON_RUN_AS_NODE from the environment before spawning Cypress
 * so it does not behave as a plain Node.js process in affected terminals.
 * Additional CLI arguments are forwarded without shell glob expansion.
 */
const { spawnSync } = require('child_process');

delete process.env.ELECTRON_RUN_AS_NODE;

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const args = ['cypress', 'run', ...process.argv.slice(2)];
const result = spawnSync(npx, args, {
  stdio: 'inherit',
  env: process.env,
  shell: false,
});

if (result.error) {
  console.error(`Unable to start Cypress: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
