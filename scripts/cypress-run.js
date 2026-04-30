#!/usr/bin/env node
/**
 * Cross-platform Cypress launcher.
 * Removes ELECTRON_RUN_AS_NODE from the environment before spawning Cypress
 * so it doesn't behave as a plain Node.js process (a VS Code terminal quirk).
 */
const { spawnSync } = require('child_process');

delete process.env.ELECTRON_RUN_AS_NODE;

const result = spawnSync('cypress', ['run'], {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
