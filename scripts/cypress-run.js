#!/usr/bin/env node
/**
 * Cross-platform Cypress launcher.
 * Removes ELECTRON_RUN_AS_NODE from the environment before spawning Cypress
 * so it does not behave as a plain Node.js process in affected terminals.
 * Additional CLI arguments are forwarded to Cypress, enabling scoped smoke runs.
 */
const { spawnSync } = require('child_process');

delete process.env.ELECTRON_RUN_AS_NODE;

const args = ['run', ...process.argv.slice(2)];
const result = spawnSync('cypress', args, {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
