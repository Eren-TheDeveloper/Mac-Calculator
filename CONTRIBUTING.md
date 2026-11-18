# Contributing

Use Node.js 22.12 or later and install dependencies with `npm ci`.

Before opening a pull request, run:

```sh
npm run check
npm test
npm run test:ui
```

The UI test opens the calculator briefly and closes it automatically. It needs
a graphical desktop. CI runs the full test suite on Windows.

Keep calculation behavior in `calculator.js` and add regression tests in
`tests/calculator.test.js` when fixing arithmetic or state handling. Keep DOM
interaction in `renderer.js`. Do not expose Node.js APIs to the renderer.

Use UTF-8, two-space indentation, and LF line endings. Commit `package-lock.json`
when dependencies change. Do not commit `node_modules`, generated artifacts,
credentials, or local environment files.

For bug reports, include your operating system, Node.js version, the exact input
sequence, and expected versus actual results. Screenshots help for layout issues.
