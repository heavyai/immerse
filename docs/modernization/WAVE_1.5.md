# Wave 1.5: Security dependency remediation

Base: `wave-1` at `750611a`. Work branch: `wave-1.5`.

The complete workspace audit now passes the existing high/critical gate. No
advisory ignore rules, severity reductions or error suppression were introduced.
Wave 1's baseline was 16 high/0 critical after compatible fixes; the initial
pnpm graph had 61 high/3 critical. The 27 moderate and 5 low findings remain visible and do
not block according to the requested policy. See `wave-1.5-audit.json` for the
recorded totals and remaining advisory references.

## Changes and compatibility

| Dependency | Change and reason |
| --- | --- |
| Puppeteer 24 → 25.16 | Its browsers 3 toolchain removes extract-zip, basic-ftp and the old Zod dependency chain. A real Chrome download/extraction exercises the new implementation. |
| Webpack dev server 4 → 5.2.7; CLI 4 → 6 | Upgrades vulnerable dev middleware to 7.4.6. Proxy configuration uses the new array format; HTTPS scripts use the supported server options. |
| jest-dom 4 → 7; Testing Library DOM 6 → 10 | Removes the old CSS/decode-uri-component chain; setup imports the public matcher entry point. Existing React testing-library versions stay in place. |
| d3-color 1 → 3.1.1 | Overrides the legacy modular dependency. The combo adapter compiles upstream source and redirects its `d3/build/d3` import to the modular D3 entry, avoiding the embedded old color parser. The adapter retains the existing extracted stylesheet and all 20 historical named exports. D3 v3 used by the separate DC engine retains its existing global initialization. |
| image-size 0.7 → 2.0.4 | A pnpm patch adapts texture-compressor's synchronous path-based API to the new buffer API, updating both its TypeScript and emitted runtime. |
| react-grid-layout 1.5.3 → 1.5.4 | Removes the upstream-reported stray published files without taking a layout API major. |
| Unused stylelint 10/config and nyc 14 | Removed with the dormant stylelint configuration. Active lint uses ESLint and active coverage uses Jest. Removes old PostCSS, braces, trim-newlines, cross-spawn and flatted chains. |

Puppeteer 25 is ESM. The existing CommonJS UI tests load it through Node 24's
native loader using `native-puppeteer.cjs`; the Jest module sandbox cannot load
it directly. The Puppeteer environment's Node environment dependency is aligned
with Jest 30. The toolchain UI test checks both the CommonJS import and real
browser control. CI installs Chrome through the public Puppeteer executable, avoiding its removed
CommonJS distribution path. No application production code uses this bridge.

The image-size compatibility patch is intentionally narrow and owned by Immerse
maintainers until the legacy loaders/texture toolchain is replaced or upstream
adopts image-size 2. Remove the patch and override together after its file-based
API consumer migrates. The test calls the actual texture compressor utility,
checks a PNG file's dimensions and verifies malformed input is rejected. A worker
bounds the legacy D3 graph's adversarial color-parser regression test.

## Verification

- Clean frozen pnpm installation passes with the committed patch applied.
- Fourteen application suites pass 149 tests and six unchanged snapshots.
- Seven package suites pass 11 tests, including actual legacy line rendering/cleanup and the historical 20-export combo contract.
- Eight Node guard/security tests, package boundaries, public types and repository lint pass.
- Development and production Webpack builds pass with license enforcement intact.
- Puppeteer 25 downloads/extracts Chrome successfully. Its real Jest harness passes two suites/five tests, including the existing HeavyDB session/dashboard save/refresh scenario.
- The synthetic Playwright dashboard scenario passes three saved-dashboard reloads and count 8 → 2 crossfiltering. See `wave-1.5-browser-baseline.json`.
- `pnpm audit --audit-level high` exits zero: no high/critical findings. See `wave-1.5-audit.json`.

Historical Wave 0/1 measurements remain separate; these samples are synthetic
compatibility checks, not representative production performance budgets. The
full-application TypeScript baseline remains deferred; independent workspace
declaration checks pass. The focused application tests do not establish a passing
full application suite or production-dashboard coverage. Detailed local results
are summarized in `wave-1.5-validation.json`.

## Primary references

- [Puppeteer releases](https://github.com/puppeteer/puppeteer/releases)
- [Webpack development server configuration](https://webpack.js.org/configuration/dev-server/)
- [image-size API](https://github.com/image-size/image-size)
- [extract-zip advisory](https://github.com/advisories/GHSA-7pqw-9j4j-h8q3)
