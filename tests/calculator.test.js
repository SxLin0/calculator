const test = require('node:test');
const assert = require('node:assert/strict');
const { CalculatorEngine } = require('../script.js');

test('evaluates operator precedence and parentheses', () => {
  assert.equal(CalculatorEngine.evaluate('2 + 3 * 4').value, 14);
  assert.equal(CalculatorEngine.evaluate('(2 + 3) * 4').value, 20);
});

test('handles decimal arithmetic without common floating point noise', () => {
  assert.equal(CalculatorEngine.evaluate('0.1 + 0.2').display, '0.3');
});

test('supports unary negative values', () => {
  assert.equal(CalculatorEngine.evaluate('-5 + 2').value, -3);
  assert.equal(CalculatorEngine.evaluate('4 * -2').value, -8);
});

test('converts percent in expressions', () => {
  assert.equal(CalculatorEngine.evaluate('50%').value, 0.5);
  assert.equal(CalculatorEngine.evaluate('200 * 10%').value, 20);
});

test('applies single-value functions', () => {
  assert.equal(CalculatorEngine.square('12').display, '144');
  assert.equal(CalculatorEngine.sqrt('81').display, '9');
  assert.equal(CalculatorEngine.reciprocal('4').display, '0.25');
  assert.equal(CalculatorEngine.toggleSign('12.5').display, '-12.5');
});

test('rejects invalid math', () => {
  assert.throws(() => CalculatorEngine.evaluate('8 / 0'), /除数不能为 0/);
  assert.throws(() => CalculatorEngine.sqrt('-1'), /不能对负数开平方/);
  assert.throws(() => CalculatorEngine.evaluate('(1 + 2'), /括号不匹配/);
});
