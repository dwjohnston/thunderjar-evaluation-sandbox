# Agent instructions

- Each utility lives in its own file in `src/` and is re-exported from `src/index.js`.
- `src/index.js` lines look like `export { name } from './name.js';`, one per line, in alphabetical order.
- Tests import from `src/index.js`, never from the individual files.
- Run tests with `npm test`.
