// Run each suite in a fresh process so browser substitutes cannot leak state.
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const suites = [
  'furigana',
  'n2-vocabulary',
  'navigation-review',
  'memory-schedule',
  'memory-resume-model',
  'card-memory-resume',
  'memory-workspace-race',
  'card-memory',
  'memory-shuffle',
  'rich-entries',
  'grammar-study',
  'grammar-grouping',
  'storage',
  'card-resume',
  'card-position',
  'keyboard',
  'card-translations',
  'theme-list-reveal',
  'rating-position',
  'select',
  'audio.test',
  'progress-sync',
  'content-state',
  'content-sync',
  'deletions',
];
for (const suite of suites) {
  const result = spawnSync(process.execPath, [path.join(__dirname, `${suite}.cjs`)], {
    stdio: 'inherit',
    timeout: 30000,
  });
  if (result.error) console.error(result.error.message);
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log(`All ${suites.length} regression suites passed.`);
