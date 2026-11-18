const { test } = require('node:test');
const assert = require('node:assert/strict');
const Calculator = require('../calculator');

function run(sequence) {
  const calc = new Calculator();
  for (const key of sequence) {
    if (/^[0-9.]$/.test(key)) calc.number(key);
    else if ('+-*/'.includes(key)) calc.operate(key);
    else ({ '=': () => calc.equals(), '%': () => calc.percent(),
      s: () => calc.sign(), c: () => calc.clear(), b: () => calc.backspace() })[key]();
  }
  return calc;
}

for (const [name, sequence, expected] of [
  ['addition', '12+34=', '46'],
  ['subtraction', '3-8=', '-5'],
  ['multiplication', '12*4=', '48'],
  ['division', '9/4=', '2.25'],
  ['decimal precision', '.1+.2=', '0.3'],
  ['duplicate decimal', '1..25', '1.25'],
  ['leading zeroes', '00012', '12'],
  ['sequential operations', '2+3*4=', '20'],
  ['replace pending operator', '8+*2=', '16'],
  ['repeat equals', '2+3===', '11'],
  ['implicit second operand', '5+=', '10'],
  ['continue after result', '2+3=*4=', '20'],
  ['new entry after result', '2+3=7', '7'],
  ['standalone percent', '50%', '0.5'],
  ['relative addition percent', '200+10%=', '220'],
  ['relative subtraction percent', '200-10%=', '180'],
  ['multiplication percent', '200*10%=', '20'],
  ['division percent', '200/10%=', '2000'],
  ['negative operand', '5s+2=', '-3'],
  ['negative zero decimal', 's.5', '-0.5'],
  ['negative second operand', '5+s2=', '3'],
  ['scientific value entry stays valid', '1/999999999999=%2', '2'],
  ['scientific value backspace stays valid', '1/999999999999=%b', '0'],
  ['edit signed result', '5+2=s+3=', '-4'],
  ['backspace', '123b', '12'],
  ['backspace to zero', '1sbb', '0'],
  ['division by zero', '5/0=', 'Error'],
  ['recover from error', '5/0=7+2=', '9'],
  ['clear pending state', '5+3c2=', '2'],
  ['input length limit', '1234567890123', '123456789012']
]) {
  test(name, () => assert.equal(run(sequence).display, expected));
}

test('clear resets repeat operation and expression', () => {
  const calc = run('3+2=c=');
  assert.equal(calc.display, '0');
  assert.equal(calc.expression, '');
  assert.equal(calc.repeat, null);
});

test('error clears pending operations', () => {
  const calc = run('8/0=');
  assert.equal(calc.operator, null);
  assert.equal(calc.repeat, null);
});

test('overflow shows the correct error and recovers', () => {
  const calc = run('999999999999*=');
  for (let i = 0; i < 30; i++) calc.equals();
  assert.equal(calc.display, 'Error');
  assert.equal(calc.expression, 'Result is too large');
  calc.number('2');
  assert.equal(calc.display, '2');
});
