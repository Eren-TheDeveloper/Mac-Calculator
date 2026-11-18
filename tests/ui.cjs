const { app, BrowserWindow } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { once } = require('node:events');

const timeout = setTimeout(() => { console.error('UI test timed out'); app.exit(1); }, 20000);
require('../index');

app.whenReady().then(async () => {
  const win = BrowserWindow.getAllWindows()[0];
  win.removeAllListeners('ready-to-show');
  const errors = [];
  win.webContents.on('console-message', details => {
    if (details.level === 'error') { errors.push(details.message); console.error(details.message); }
  });
  if (win.webContents.isLoading()) await once(win.webContents, 'did-finish-load');
  const evaluate = source => win.webContents.executeJavaScript(source).catch(error => {
    throw new Error(`Renderer check failed: ${source}\n${error.message}`);
  });
  const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const display = () => evaluate('document.getElementById("display").textContent');
  const key = value => evaluate(`document.body.dispatchEvent(new KeyboardEvent('keydown', {key: ${JSON.stringify(value)}, bubbles: true}))`);

  assert.equal(await display(), '0');
  assert.deepEqual(win.getContentSize(), [320, 440]);
  assert.equal(await evaluate('typeof window.windowControls.close'), 'function');
  assert.equal(await evaluate('typeof require'), 'undefined');
  for (const selector of ['[data-number="7"]', '[data-operator="+"]', '[data-number="8"]', '[data-action="equals"]']) await click(selector);
  assert.equal(await display(), '15');
  await key('Escape');
  for (const value of ['1', ',', '5', '*', '4', 'Enter']) await key(value);
  assert.equal(await display(), '6');
  await key('Escape');
  for (const value of ['2', '0', '0', '+', '1', '0', '%', '=']) await key(value);
  assert.equal(await display(), '220');
  await click('[data-action="sign"]');
  assert.equal(await display(), '-220');
  await key('Escape');
  for (const value of ['1', '2', 'Backspace']) await key(value);
  assert.equal(await display(), '1');
  for (const value of ['/', '0', '=']) await key(value);
  assert.equal(await display(), 'Error');
  await key('9');
  assert.equal(await display(), '9');

  await key('Escape');
  for (const value of '999999999999') await key(value);
  assert.equal(await evaluate('display.scrollWidth <= display.clientWidth'), true);
  assert.equal(await evaluate('document.querySelector(".keypad").getBoundingClientRect().bottom <= innerHeight'), true);
  await key('*');
  await key('=');
  for (let i = 0; i < 10; i++) await key('=');
  await key('F9');
  assert.equal(await evaluate('display.scrollWidth <= display.clientWidth'), true);
  await key('Escape');
  await key('8');
  await key('+');
  assert.equal(await evaluate(`document.querySelector('[data-operator="+"]').getAttribute('aria-pressed')`), 'true');
  await key('2');
  await key('=');
  const artifacts = path.join(__dirname, '..', 'artifacts');
  await fs.mkdir(artifacts, { recursive: true });
  win.showInactive();
  await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  await fs.writeFile(path.join(artifacts, 'calculator.png'), (await win.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true })).toPNG());
  const minimized = once(win, 'minimize');
  await click('[data-window="minimize"]');
  await minimized;
  assert.equal(win.isMinimized(), true);
  assert.deepEqual(errors, []);
  console.log('UI passed: startup, clicks, keyboard, percentage, errors, layout, preload isolation.');
  clearTimeout(timeout);
  const closed = once(win, 'closed');
  await click('[data-window="close"]');
  await closed;
  console.log('Window close control passed.');
  app.exit(0);
}).catch(error => {
  clearTimeout(timeout);
  console.error(error);
  app.exit(1);
});
