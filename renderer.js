'use strict';
const calculator = new Calculator();
const display = document.getElementById('display');
const expression = document.getElementById('expression');
function render() {
  display.textContent = calculator.display;
  expression.textContent = calculator.expression;
  display.classList.toggle('compact', calculator.display.length > 8);
  display.classList.toggle('small', calculator.display.length > 13);
  display.classList.toggle('tiny', calculator.display.length > 16);
  document.querySelectorAll('[data-operator]').forEach(button => {
    const selected = calculator.waiting && calculator.operator === button.dataset.operator;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}
function activate(button) {
  if (button.dataset.number !== undefined) calculator.number(button.dataset.number);
  else if (button.dataset.operator) calculator.operate(button.dataset.operator);
  else {
    const actions = {
      clear: () => calculator.clear(), sign: () => calculator.sign(),
      percent: () => calculator.percent(), equals: () => calculator.equals()
    };
    actions[button.dataset.action]?.();
  }
  render();
}
document.querySelector('.keypad').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (button) activate(button);
});
// Mouse clicks should not capture Enter from the calculator keyboard shortcuts.
document.querySelector('.keypad').addEventListener('mousedown', event => event.preventDefault());
document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  // Preserve native activation for buttons reached with Tab.
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('button')) return;
  let button;
  if (/^[0-9.]$/.test(event.key) || event.key === ',') {
    button = document.querySelector(`[data-number="${event.key === ',' ? '.' : event.key}"]`);
  } else if (['+', '-', '*', '/'].includes(event.key)) {
    button = document.querySelector(`[data-operator="${event.key}"]`);
  } else {
    const action = { Enter: 'equals', '=': 'equals', Escape: 'clear', Delete: 'clear', c: 'clear', C: 'clear', '%': 'percent', F9: 'sign' }[event.key];
    if (action) button = document.querySelector(`[data-action="${action}"]`);
    else if (event.key === 'Backspace') {
      event.preventDefault(); calculator.backspace(); render(); return;
    }
  }
  if (button) {
    event.preventDefault(); activate(button);
    button.classList.add('pressed');
    setTimeout(() => button.classList.remove('pressed'), 100);
  }
});
document.querySelectorAll('[data-window]').forEach(button => {
  if (!window.windowControls) button.hidden = true;
  button.addEventListener('click', () => window.windowControls?.[button.dataset.window]?.());
});
render();
