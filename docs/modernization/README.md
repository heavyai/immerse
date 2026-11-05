# Wave 0: compatibility and architecture baseline

Base commit: `acbac90` (`main`). Work branch: `modernization-wave-0`.
Subsequent wave branches should start from the committed tip of this branch;
keep Wave 1 package-manager/runtime changes out of this baseline.

## Commands

Use Node from `.nvmrc` (24.11.0) and npm >=11.6.1 until the Wave 1 pnpm cutover.

```sh
npm ci
npm run test:modernization
npm run modernization:check
npm run test:modernization-tools
npm run modernization:inventory -- docs/modernization/inventory.json
npm run test:legacy -- --json --outputFile=/tmp/immerse-legacy-results.json
npm run build:prod
npm run --silent modernization:measure -- bundle dist > /tmp/immerse-bundle-baseline.json
```

## Recorded validation and limitations

- Production build passed (322 existing dependency/bundle warnings). Six emitted
  JS/CSS assets total **24,617,673 bytes raw / 5,938,108 bytes gzip**; see
  `bundle-baseline.json`. This includes all emitted chunks, not just initial load.
- Full ESLint passed. The 14 focused Jest suites passed **145 tests and six
  snapshots**, with three explicitly pending lifecycle regressions; see
  `validation-baseline.json`. Supplemental embed assertions are recorded in
  `measurements.json`. The full normal suite was not completed: an initial broad
  run was stopped to relieve build/test memory pressure; focused relevant suites
  were run instead. Do not treat this as full-suite certification.
- All **62** previously excluded legacy suites were assessed separately:
  **42 passed / 20 failed**, with 297 passing, 17 failing and one skipped test.
  Suite initialization failures account for the difference between failing
  assertions and failing suites. See `legacy-test-baseline.json` for files/errors.
  Three assessed passing suites (dashboard action creators, data-source reducer,
  coordinate helpers) are now selected by normal Jest and `test:unit`. The final
  inventory has **246 unit and 24 component files**, with **59** legacy unit suites
  still excluded. The separate legacy command remains available for all 62.
- Removing the global `fs`/`node:fs` mapper fixes Jest snapshot assertions that
  previously failed on the stub's missing `existsSync`. Libraries needing a
  filesystem mock should mock it locally rather than breaking Jest internals.
- The TypeScript baseline fails with **1,039 diagnostics**, primarily syntax in
  installed dependency types unsupported by TypeScript 3.9, plus the `ES2021`
  library setting. See `types-baseline.json`. No type/toolchain migration is hidden
  in this wave.
- The opt-in browser test passed against the CI-pinned amd64 HeavyDB image using
  the synthetic eight-row table. Three warm-context samples gave median saved
  dashboard load-to-count-and-bar **2,155 ms**, and filter-to-count-and-paint
  **226 ms**, with six observed Redux actions per filter. Initial navigation to
  the new dashboard editor took **8,810 ms**. See `browser-baseline.json` for raw
  samples/environment. These tiny-dataset smoke numbers are not production budgets.
- Production-derived historical fixtures, the agreed historical reader/writer
  support window, full CI S3 datasets, and representative all-engine performance
  budgets remain **unavailable/pending**, not inferred from synthetic tests.

`inventory.json` is generated using **Jest's actual `--listTests` output**, not a
filename-only estimate. It records selected projects, unselected tests, pinned
Git dependencies and their source consumers, npm scripts, lockfiles, overrides,
hooks, CI commands, and flat `node_modules` layout assumptions. Regenerate it
when selection or tooling changes. Its consumer search is a textual inventory;
review aliases/re-exports before source transfer.

`architecture-baseline.json` records AST-discovered import sites and direct
chart-type branches, per file and normalized expression/module specifier. New
occurrences fail CI; deleting an existing occurrence frees no budget elsewhere.
Tests are excluded, including legacy `.spec` tests. To ratchet after removals:

```sh
node scripts/modernization/architecture.cjs --update
```

Review baseline changes: additions need an explicit migration justification;
normal feature work must not reset the baseline to approve new debt. The scan
covers static imports/re-exports, literal dynamic imports and `require`, plus
`if`, `switch`, and conditional expressions referring to a chart's `.type` or
`["type"]`. It is a scoped migration guard, not a full dependency graph or proof
against computed module names, aliased chart-type variables, or all logical
expressions. Package cycle/deep-export enforcement is established with the actual
workspace graph in Wave 1.

## Fixture provenance and coverage

`test-config/modernization/fixtures/manifest.json` records provenance and coverage.
The initial fixtures are **synthetic**, informed by the repository's existing
load-dashboard tests, chart definitions, and parameter mock store. They contain
invented table names/values, an invalid example embed URL, and no user data.
They are not represented as anonymized production exports.

The compatibility suite exercises the real writer, decoder, higher-order loader,
registered chart upgrades, filter SQL builders, filter redraw gate, embed filter
responses/notifications, and published API schema. Committed Jest snapshots
pin exact initial base64 bytes and expected upgraded documents. Snapshot updates
must be reviewed as compatibility changes, never auto-approved by CI.

Covered serialization shapes include legacy single-source filters, omnifilters,
parameters, opaque join/addon payloads, Unicode, inactive tabs and shared tab state,
DC, Vega, raster, DeckGL, custom React and iframe configurations. This is **not**
a rendering test for those engines, exhaustive chart coverage, validation of every
join/addon schema, or proof of complete embed API compatibility. Existing focused
unit/UI suites remain necessary. The published `getFilters` schema currently
describes its payload as an object while runtime responses use an array; the
contract snapshot records that discrepancy rather than changing the embed API
silently during Wave 0. Extend the corpus with approved historical
exports before affected models migrate; add targeted expected results as their
real schemas are exercised.

For production exports: obtain owner-approved dashboards; anonymize names,
SQL literals, parameters, URLs, annotations, embedded text, and metadata before
committing; verify anonymization preserves query/filter semantics and chart
versions. Record source release, anonymization method, covered features and
expected canonical output. Keep credentials and raw originals outside Git.

## Reader/writer compatibility and rollback

| Writer/document | Reader | Wave 0 contract |
| --- | --- | --- |
| Historical releases | Current baseline application | Existing supported migrations remain; synthetic legacy fixture proves only its covered shapes; production/version evidence is still required |
| Baseline writer (`acbac90`) | Wave 0 application | Exact initial wire snapshots plus semantic load/upgrade tests |
| Wave 0 writer | Baseline reader | No persisted format or writer behavior changed; future changes require explicit older-reader execution evidence |
| Later modernization writer | Supported older applications | Support window is pending product agreement; preserve legacy fields until that window and downgrade behavior are tested |

Wave 0 does not declare all historical versions supported. The source does not
provide a complete release/version matrix. The product owner must choose the
supported historical releases and older-reader rollback window before a new
writer ships. Retain legacy `filters` and chart type identifiers meanwhile.
Rollback this wave by reverting its commit(s); it introduces no document format.
A later schema cutover needs a tested compatible writer/downgrade path or a
retained original document, not merely a runtime switch.

## Reset/load ownership matrix

This is a characterization of current behavior, **not an endorsement**. Reset
and clear wrappers bypass the child reducer for their matching action; omitted
slices therefore survive. The loader replaces document slices but merges the
remaining state. See `lifecycle-invariants.unit.test.js` for passing replacement
invariants and explicit pending regressions.

| State | Intended lifetime | Clear | Reset | Successful load |
| --- | --- | --- | --- | --- |
| charts, dashboard, filters | Dashboard document | Reset | Reset | Replace/normalize |
| ui | Local/feature UI | Reset | Retained | Reset |
| omnifilters, filterZones, cohorts, parameters, annotations, chartAddons | Dashboard document | Retained: gap | Retained: gap | Replace/normalize |
| joinDataSources, sharedSettings | Dashboard document | Reset | Retained: gap | Replace/normalize |
| sharedSettingsImport | Import workflow | Reset | Retained | Retained |
| crossLinks | Dashboard document | Retained: gap | Reset | Replace/normalize |
| chartData | Query cache | Retained: gap | Retained: gap | Retained: gap |
| dc | Render lifecycle | Retained | Reset | Initialize counts from loaded charts |
| chartEditor | Editor workflow | Retained | Retained | Retained: review navigation leakage |
| tables, sqlEditor, sqlNotebook, snapshots | Data/tool workflows | Retained | Reset | Retained |
| connection, session | Cross-dashboard session | Retained | Retained | Retained |

Wave 1 must resolve the documented dashboard-scoped gaps, determine workflow
reset policy, and turn the three pending regression groups into passing tests.
Avoid asserting stale-state retention as correct behavior. Session preservation
and document replacement on A → B navigation already have executable checks.
Reducer tests do not prove late async completions cannot reintroduce old data;
that lifecycle guarantee belongs to the filter/query migration.

## Measurements

`measurements.json` distinguishes measured results from unavailable metrics.
Never substitute zero for an unavailable runtime measurement. Record the commit,
toolchain, build mode, environment, dataset/dashboard and scenario for each sample.
Bundle reporting measures all emitted JS/CSS assets, raw and gzip; it is not a
claim about initial-route transfer size. Snapshot/test fixtures are not throughput
benchmarks.

To capture browser measurements with a backend and installed Playwright Chromium:

1. Start a development server against the test backend. The action recorder is
   disabled unless `window.immerseModernizationMetrics` exists before store creation;
   the runner enables it with an init script. Production builds do not enable it.
2. Create an untracked scenario JSON with `url`, `readySelector`, `samples`, optional
   `storageState` (path to a local Playwright authentication file), and `filter`:
   `triggerSelector`, `completionSelector`, `completionText`. Pick a chart interaction
   whose result text is absent before the click and visible after it. Use selectors
   appropriate to the dataset; avoid side effects such as saving dashboards.
3. Run `npm run --silent modernization:measure -- browser /tmp/scenario.json` and save the
   JSON output alongside the environment/scenario description (without credentials).

The runner reports fresh-page navigation timings, navigation-to-ready-marker
latency, filter-click-to-changed-DOM plus two paint frames, and startup/filter
Redux action counts by type. It does not equate DOM readiness with every engine
having completed rendering. Use an explicit all-relevant-charts completion marker
in a scenario before making engine-wide claims. Samples share a browser context;
report cold versus warm cache conditions and repeat under consistent load.
Never record action payloads, connection strings or authentication state in metrics.

The initial static chart-addition touchpoints are the 32 `registerChart` calls in
`src/charts/chart-definitions.js`, the registration fan-out in
`src/charts/chart-registration.js`, chart-specific cases in the shared charts
reducer, root sagas, filter interoperability, export handlers, and external API
registration. The AST ratchet quantifies direct chart-type branches (194 at baseline). A real
chart-addition exercise is needed to measure changed-file count; no such product
feature is introduced merely to manufacture that number.

## Backend parity with Puppeteer CI

The existing `.github/workflows/immerse-puppeteer-automation.yml` already provides
backend setup in `scripts/ci/puppeteer-heavydb/`:

- GPU Docker host, x86_64 image pinned by `HEAVYDB_IMAGE`, loopback ports 6273,
  6274, 6278, 6279, and a read-only mount of built Immerse assets.
- Docker Hub login with authorized access to private `heavyai/scantest`.
- `HEAVYDB_RESOURCE_SUFFIX` naming and readiness checks.
- S3 restore via environment credentials and `restore-test-data.sql.template`,
  followed by schema validation of the shared UI-test datasets.

Reuse those scripts rather than adding a second backend lifecycle. Start only
an isolated test container; do not point restore scripts at an existing data
service. The restore requires AWS credentials in addition to Docker access. An
ARM/aarch64 image is unsuitable for this Omnistation's x86_64 GPU runtime.
Image/dataset credentials and approved production exports are external inputs;
full production/CI-dataset acceptance remains pending until those inputs are available.
The local isolated backend was started successfully for the synthetic smoke test;
its frontend mount is a temporary placeholder, and Immerse is served separately
by the loopback development server on port 8002.

For the committed, self-contained smoke scenario, load
`test-config/modernization/synthetic-data.sql` **once** into the empty isolated
backend, start `npm run start:fast -- --host 127.0.0.1` with the CI-equivalent
ignored `src/servers.local.json`, install Playwright Chromium, then run:

```sh
npx playwright test --config test-config/modernization/playwright.config.ts
```

The test creates a synthetic saved dashboard in that isolated database, reloads
it three times, verifies the count changes from eight to two on crossfilter, and
attaches JSON samples to `test-results/modernization/report.json`. It uses the
same chart UI selectors as existing tests without importing their legacy
Puppeteer dependency chain. The recorder must be enabled before page startup.
The smoke scenario intentionally does not run in the ordinary CPU unit-test CI
job. Reusing the full Puppeteer suite still requires its own dependencies/data.

## Split-library transfer order

All package names and owners below are proposed architectural responsibilities,
not assignments to named people. Confirm other repositories' consumers before
retiring a published entry point. The generated inventory lists this application's
consumers and exact pinned revisions; it cannot discover consumers in other repos.

| Order | Existing dependency | Target responsibility / compatibility name |
| --- | --- | --- |
| 1 | `@heavyai/connector` | Transport owner → `packages/connector`; retain the connector API adapter |
| 2 | `@heavyai/data-layer` (metis), `node-sql-parser` fork | Query/filter owners → query-runtime/filter-engine; preserve SQL and upstream parser licensing |
| 3 | `@heavyai/draw`, `@heavyai/d3-combo-chart` | Chart runtime owners → legacy DC adapter initially; split reusable helpers only after consumers migrate |
| 4 | `@heavyai/charting` | Legacy engine owner → chart-engine-dc; isolate deep imports before moving source |
| 5 | `heavy-gauge-chart`, `heavy-skewt-chart` | Isolated plugin owners → chart plugins; preserve persisted types |
| Separate decision | `useWhisper` | Voice feature owner; assess whether to retain/replace rather than fold into chart packages |

Transfer only what the first vertical slice needs. Preserve source history where
feasible, license notices, public entry points and build provenance. Third-party
fork ownership does not imply unrestricted ownership of upstream source.

## pnpm cutover inventory

Wave 0 stays on npm. `inventory.json` records current engines, npm overrides,
Husky hooks, commands, CI references, source aliases and both lockfiles. Wave 1
must also address:

- `.npmrc` uses `legacy-peer-deps=true`; pnpm exceptions must be explicit.
- Webpack uses `symlinks: false`, explicit loader paths and aliases into
  `node_modules`; Jest maps built files inside HeavyAI packages.
- `test-config/puppeteer` is independently installed, with its own lockfile.
- Git dependencies use both SSH and HTTPS; CI rewrites SSH to HTTPS.
- `.gitignore` currently ignores `packages/`; remove that ignore when introducing
  tracked workspace source.
- Source/build release scripts call nested `npm run`; hooks and test tooling need
  to switch together with the pinned package manager and catalog references.
- The required pnpm high/critical audit gate belongs to the pnpm cutover; no pnpm
  workflow is introduced while the active installation remains npm.

See the root modernization plan for milestone acceptance and rollback criteria.
