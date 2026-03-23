/**
 * Valida que el coverage sea 100% en lines, statements, functions y branches.
 * Uso: npm run test:cov && node scripts/validate-coverage.js
 */
const fs = require('node:fs');
const path = require('node:path');

const summaryPath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
if (!fs.existsSync(summaryPath)) {
    console.error('No se encontró coverage/coverage-summary.json. Ejecuta primero: npm run test:cov');
    process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const total = summary.total || {};
const lines = total.lines?.pct ?? 0;
const statements = total.statements?.pct ?? 0;
const functions = total.functions?.pct ?? 0;
const branches = total.branches?.pct ?? 0;

const required = 100;
const ok = lines >= required && statements >= required && functions >= required && branches >= required;

console.log('Coverage:');
console.log('  Statements:', `${statements}%`, statements >= required ? '✓' : '✗');
console.log('  Branches:  ', `${branches}%`, branches >= required ? '✓' : '✗');
console.log('  Functions: ', `${functions}%`, functions >= required ? '✓' : '✗');
console.log('  Lines:     ', `${lines}%`, lines >= required ? '✓' : '✗');

if (!ok) {
    console.error('\nEl coverage debe ser 100% en statements, branches, functions y lines.');
    process.exit(1);
}
console.log('\nCoverage 100% validado correctamente.');
process.exit(0);
