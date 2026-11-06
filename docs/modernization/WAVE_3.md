# Wave 3: Owned UI and React 19

Base: `wave-2` at `772e841`. Branch: `wave-3`, on Omnistation.
The React 18 bridge was committed as `21e3566`; the final target selected by the
user is React/React DOM **19.3.1**, with React type declarations **19.3.0**.

## Physical changes

- `packages/ui/src/primitives.jsx` replaces the button, checkbox, switch,
  tooltip, menu/popover, dialog and slider implementations with native controls
  and Radix. `form-controls.jsx` owns native date/time, text, link, chip,
  progress and file controls, plus React Select/Creatable Select. Styles live in
  `primitives.module.css` and `form-controls.module.css`.
- `packages/ui/src/tokens.css` aliases existing theme variables, customer tint
  and accent colors. Portal layers are explicit: dialog 3000, menu 4000 and
  tooltip 5000. Light, dark, Nexus light, custom tint, forced colors and reduced
  motion retain their own behavior. No global Tailwind layer is introduced.
- Callers import the seven primitive domains directly from `@immerse/ui`.
  The old button/switch/slider widget implementations, their SCSS and obsolete
  examples are deleted. Existing effectful dialog composition remains in the
  application because it owns application behavior.
- All product MUI imports and the unused theme-provider helpers are removed.
  The two date/time consumers use the owned native field, preserving local/UTC
  interpretation and millisecond precision. Chart date/number formats, GeoJSON
  selection and table display settings move from Selectize to owned Select
  controls. Presets and custom format creation remain available.
- Remaining `react-toggle` consumers use the owned switch. The RC slider and
  old toggle/selectize global stylesheets are deleted. Dashboard import uses
  an owned file input/drop target instead of the old Dropzone React wrapper;
  the existing three-line title/metadata/state format remains unchanged.
- `src/runtime/mount-application.js` uses the modern root API. React Hot Loader,
  its patched DOM alias, Enzyme and the separate hooks testing library are
  removed. Repeated mount/unmount behavior and observable hook behavior replace
  the old test adapters. All production React test-utils calls become native
  bubbling keyboard events.
- Application-authored Recompose imports are removed. Local state uses hooks,
  connected views use ordinary components, and `use-event-handlers.js` keeps
  event functions stable while reading committed inputs. Autocomplete option
  updates use an effect; share-link feedback timers cancel on unmount.
- React DnD 16 uses `DndProvider`, `useDrag` and `useDrop` for tabs and selectors.
  Composed selector refs attach and detach both drag and drop connectors.
- React Grid Layout 2 uses its current grid/drag/resize configuration and
  position strategies. `use-element-size.js` replaces SizeMe with a scoped
  ResizeObserver, disconnecting and ignoring queued callbacks on cleanup.
  Dashboard window listeners and debounce timers also clean up. Layout merges
  retain unknown saved item metadata when the engine reports new geometry.
- React Virtualized 10 retains lists/grids/tables; AutoSizer now comes from its
  supported separate package. Split Pane 3 uses explicit panes and resize
  callbacks. CodeMirror, highlighting, React Redux 9, Redux 5 and thunk 3 are
  updated for the selected runtime.
- `src/services/navigation.js` replaces connected-react-router with owned
  history actions, middleware, reducer and subscription cleanup. Router paths
  and browser back/forward behavior are retained. The small owned promise-action
  middleware preserves pending/fulfilled/rejected action behavior without the
  abandoned Redux-4-only dependency.
- Numeric binning reads render results through `useVegaChartData`, preserving
  Wave 2's separation of query data from Redux.
- TypeScript is 5.9.3, ESLint is 8 with typescript-eslint 8, and Jest transforms
  the modern ESM dependencies used by the migrated controls. CI runs the owned
  UI browser contracts after explicitly installing Chromium.

## Dependency policy

Versions remain centralized in the pnpm catalog and frozen root lockfile. The
existing approved Git-source exception and exact eleven revisions are retained;
no peer requirements or advisories are suppressed for this wave.

RMWC's remaining domains are upgraded together to 14.3.5 with MDC 14 styles.
A precise package extension supplies `@rmwc/touch-target@14.3.5`, imported but
undeclared by upstream `@rmwc/button@14.3.5` through the retained snackbar action.
Remove that extension when upstream fixes its manifest or the snackbar consumer
is retired. The two nonexistent `collapsible-list.css` exports become the public
`@rmwc/list/styles` entry; the architecture baseline records those two renames
alongside removals. Overall occurrences fall from 582 before Wave 3 to 424.

Gauge and Skew-T retain older declared React peer ranges, and react-vega retains
its existing Vega/vega-embed mismatch. These warnings remain visible. Gauge and
Skew-T mount and remount in the real React 19 Chromium fixture; this is scoped
compatibility evidence, not a certification of every engine interaction. Their
source transfer remains part of the plugin/package work in Wave 4.

The attribution generator now uses `pnpm licenses list --json` so it includes
transitive packages behind workspace/store symlinks. Walking only root links
silently omitted those packages. The generated report covers tooling as well as
application dependencies; production bundle license enforcement remains active.

## Verification and limits

`wave-3-validation.json` records the final checks; `wave-3-inventory.json` records
the dependency/test inventory. The React 18 checkpoint evidence is preserved in
`wave-3-react18-checkpoint.json` and commit `21e3566`.

Chromium checks keyboard controls, tooltip/menu behavior, dialog focus containment
and return, portal cleanup, scalar/range interaction, five theme modes, native
millisecond date input, custom format creation, file selection and retained
Gauge/Skew-T mounting. Screenshots are review evidence; there was no existing
visual-diff baseline or complete accessibility certification.

The real HeavyDB scenario uses only the approved synthetic eight-row dataset.
It creates and saves a Vega dashboard, reloads three times, verifies visible bars
and count 8 to 2 crossfiltering, resizes and drags the chart, then checks geometry
after save/reload. Dashboard document and embed snapshots are checked unchanged.
No anonymized production dashboards have been supplied; their coverage is still
an explicit prerequisite for broader rollout.

Package declaration consumers pass separately. The full application TypeScript
check remains failing and is recorded separately; the old Wave 0 baseline failed
before it could parse modern dependency declarations. The counts are not directly
comparable. Webpack explicitly uses ts-node transpilation for configuration;
a successful build does not imply application-wide type safety.

Remaining RMWC data table, text field, radio, icon, list and other domains still
own consumers. Their shared MDC aggregate and `material-override.scss` remain.
Global legacy SCSS cleanup and application-wide vendor-UI retirement are later
incremental work; this wave establishes owned primitives and completes the
selected runtime cutover. Global StrictMode is not enabled around legacy engines.

`modernization:check` rejects reintroduction of the retired UI, Recompose,
Selectize, Dropzone, date, sizing, routing and async bindings. Existing catalog,
exports, dependency/cycle, license and blocking high/critical audit checks remain
active. Lower-severity audit findings remain visible.

Rollback the Wave 3 commits together to restore Wave 2's runtime, lockfile and UI
imports. No persisted document conversion or rollback is required. The preliminary
parked stash is retained until review; it is not the source of later Wave 2 fixes.


## Follow-up browser QA

Manual QA on the dashboard landing page exposed an interop error in React
Virtualized 10: its CommonJS bundle directly calls `require("clsx")`, while
Webpack's module-field preference selected an ESM namespace. A module rule now
prefers CommonJS entries only for that bundle's CommonJS dependencies. No package
versions, global interop behavior or peer-policy exceptions change.

Browser coverage now includes populated dashboard-manager rows and a real SQL
query/result grid. Those paths were not exercised by the original Vega editor
smoke scenario, and zero-width jsdom containers had hidden the renderer failures.
The SQL viewer's numeric default initializer is corrected, cell sizing uses its
own column data rather than the removed Grid instance props, and split-pane
measurement waits for refs with a stable, cancellable resize debounce.

The fresh synthetic HeavyDB instance also returned `400 {}` until its database UI
configuration existed. Creating an empty record through its authenticated
`POST /configuration/db` API returned 201; subsequent reads return 200. This is
local test-instance initialization, not suppression of configuration failures or
an authentication change.
