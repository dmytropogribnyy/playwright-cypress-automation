#!/usr/bin/env node
/**
 * Enforces the "no fixed waits" rule by scanning Cypress and Playwright
 * source files for forbidden patterns:
 *   cy.wait(<number>)      — Cypress fixed wait
 *   page.waitForTimeout()  — Playwright fixed wait
 *   sleep(                 — any generic sleep call
 */

const fs = require('fs');
const path = require('path');

const PATTERNS = [
  { re: /cy\.wait\(\s*\d+\s*\)/, label: 'cy.wait(<ms>)' },
  { re: /page\.waitForTimeout\(/, label: 'page.waitForTimeout()' },
  { re: /\bsleep\s*\(/, label: 'sleep()' }
];

const DIRS = ['cypress', 'playwright'];
const EXTS = ['.ts', '.js'];

let violations = 0;

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(full);
    } else if (EXTS.includes(path.extname(entry.name))) {
      const src = fs.readFileSync(full, 'utf8');
      src.split('\n').forEach((line, i) => {
        for (const { re, label } of PATTERNS) {
          if (re.test(line)) {
            console.error(`[hard-wait] ${full}:${i + 1}  →  ${label}`);
            console.error(`           ${line.trim()}\n`);
            violations++;
          }
        }
      });
    }
  }
}

for (const dir of DIRS) scanDir(dir);

if (violations > 0) {
  console.error(`\n✖  Found ${violations} hard-wait violation(s). Remove them before merging.\n`);
  process.exit(1);
} else {
  console.log('✔  No hard-wait violations found.');
}
