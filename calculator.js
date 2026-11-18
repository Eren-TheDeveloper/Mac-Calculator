(function (root) {
  'use strict';
  class Calculator {
    constructor() { this.clear(); }
    clear() {
      this.display = '0'; this.previous = null; this.operator = null;
      this.waiting = false; this.finished = false; this.repeat = null; this.expression = '';
    }
    number(value) {
      if (this.display === 'Error' || this.finished) this.clear();
      if (this.waiting) { this.display = '0'; this.waiting = false; }
      if (this.display.includes('e')) this.display = '0';
      if (value === '.') {
        if (!this.display.includes('.')) this.display += '.';
      } else if (this.display.replace(/[-.]/g, '').length < 12) {
        this.display = this.display === '0' ? value : this.display === '-0' ? '-' + value : this.display + value;
      }
    }
    format(value) {
      return Number.isFinite(value) ? String(Number(value.toPrecision(12))) : 'Error';
    }
    calculate(left, operator, right) {
      switch (operator) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': return right === 0 ? NaN : left / right;
      }
    }
    operate(operator) {
      if (this.display === 'Error') return;
      if (this.operator && !this.waiting) {
        const result = this.calculate(this.previous, this.operator, Number(this.display));
        this.display = this.format(result);
        if (this.display === 'Error') { this.fail(result); return; }
      }
      this.previous = Number(this.display); this.operator = operator;
      this.waiting = true; this.finished = false; this.repeat = null;
      this.expression = `${this.display} ${Calculator.symbols[operator]}`;
    }
    equals() {
      if (this.display === 'Error') return;
      const operator = this.operator || this.repeat?.operator;
      if (!operator) return;
      const left = this.operator ? this.previous : Number(this.display);
      const right = this.operator ? Number(this.display) : this.repeat.value;
      this.expression = `${left} ${Calculator.symbols[operator]} ${right} =`;
      const result = this.calculate(left, operator, right);
      this.display = this.format(result);
      if (this.display === 'Error') { this.fail(result); return; }
      this.repeat = { operator, value: right }; this.operator = null; this.previous = null;
      this.waiting = false; this.finished = true;
    }
    fail(result) {
      this.clear(); this.display = 'Error';
      this.expression = Number.isNaN(result) ? 'Cannot divide by zero' : 'Result is too large';
    }
    sign() {
      if (this.display === 'Error') return;
      if (this.waiting) this.display = '0';
      this.display = this.display.startsWith('-') ? this.display.slice(1) : '-' + this.display;
      this.edited();
    }
    percent() {
      if (this.display === 'Error') return;
      let value = Number(this.display) / 100;
      if (this.operator === '+' || this.operator === '-') value *= this.previous;
      this.display = this.format(value); this.edited();
    }
    backspace() {
      if (this.display === 'Error') { this.clear(); return; }
      if (this.waiting || this.finished) return;
      if (this.display.includes('e')) { this.display = '0'; return; }
      this.display = this.display.slice(0, -1);
      if (!this.display || this.display === '-') this.display = '0';
    }
    edited() {
      this.waiting = false; this.finished = false; this.repeat = null;
      if (!this.operator) this.expression = '';
    }
  }
  Calculator.symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  if (typeof module !== 'undefined' && module.exports) module.exports = Calculator;
  else root.Calculator = Calculator;
})(globalThis);
