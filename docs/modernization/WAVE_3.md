# Wave 3: Owned UI primitives and runtime bridge

Base: `wave-2` at `772e841`. Branch: `wave-3`.

## Runtime and testing

The selected compatibility runtime for this cutover is React/React DOM **18.3.1**,
with the modern root API and automatic JSX transform. TypeScript is **5.9.3**;
ESLint 8 and typescript-eslint 8 parse that syntax. React Hot Loader, its patched
React DOM alias, Enzyme, the separate hooks testing library and react-test-renderer
are removed. Existing hook tests use Testing Library's `renderHook`/`act` and
observable async assertions. The three remaining Enzyme files are replaced by
normal discovered behavior tests for login, hover-column removal and repeated
root mounting.

This is explicitly the React 18 bridge, **not a claim of a React 19 migration**.
Recompose, React DnD 7, date pickers and other retained libraries still depend on
APIs removed by React 19. Their retirement must precede that next runtime cutover;
no compatibility shim patches React or vendors to hide the removed APIs. The
recorded dependency inventory includes peer-range mismatches rather than
silencing them with blanket peer installation. Existing workspace peer policy
and the approved Git-source exception remain unchanged.

Services now use modern React context. Query/render subscriptions use
`useSyncExternalStore`; strict effect replay, invalidation and unmount checks
verify the new subscription boundary. The application does not enable global
StrictMode around unmigrated engines. Two production imports of React test-utils
are replaced by native bubbling keyboard events. Debounced numerical/range
slider callbacks cancel on cleanup.

The full application type check remains legacy work. Package declaration
consumers pass separately. Webpack's ts-node execution now explicitly transpiles
configuration; it does not pretend that executing a build type-checks the app.
ESLint's existing CommonJS/legacy-type policy is retained across its upgrade;
new recommended rules are not silently imposed as hundreds of unrelated fixes.

## UI ownership and physical changes

`@immerse/ui` now implements button, checkbox, switch, tooltip, menu/popover,
dialog and scalar/range slider primitives. Buttons/checkboxes/switches are native
controls. Radix supplies portal, focus, dismissal and slider mechanics. Menu item
keyboard navigation skips disabled items. Dialogs contain focus, support Escape
and restore focus to the opening control. Widget button/switch/slider facades and
their old globally scoped MDC overrides are removed. Callers import owned
primitives directly; existing effectful dialog composition stays in the app.

All direct imports of the seven targeted RMWC primitives and MUI Slider are
removed from product source. Their unused direct dependencies, direct MDC CSS
imports and stale widget example files are removed. Native menu-trigger buttons
replace the directly actionable divs within menu anchors. Former MDC button flags
are migrated to the owned `variant` API. Existing data table, text-field, radio,
icon, progress, date-picker and other domains retain their current owners. Shared
MDC CSS and `material-override.scss` remain because those consumers are not zero;
this wave does not assert application-wide vendor-UI retirement.

`packages/ui/src/primitives.module.css` owns component styles. The only new global
stylesheet, `@immerse/ui/tokens.css`, defines semantic aliases on the themed body.
It retains the legacy HSL themes, customer accent and tint variables and maps the
Nexus light theme to its gray scale. Portal content inherits the same aliases.
Dialog/menu/tooltip layers are documented in the UI README. Forced colors and
reduced motion are supported. No global Tailwind layer is introduced. Old global
SCSS remains only for domains not yet migrated; it has not been mass-rewritten.

## Verification and rollback

The isolated browser fixture is never imported by the product entry point. CPU
CI installs Chromium explicitly and runs keyboard, focus return/containment,
menu selection, range keyboard/pointer interactions and five theme/forced-color
scenarios. Screenshots are review evidence, not a preexisting visual-diff baseline
or a full accessibility certification. Its Sass loader uses the modern API.

The real HeavyDB smoke scenario separately checks dashboard save, three reloads,
visible Vega rendering and count 8 to 2 crossfiltering. Dashboard document and
embed contract snapshots remain unchanged. No persisted schema or external API
changes are intended. Compatibility and lifecycle tests cover the selected
application slice; no all-engine or customer-production coverage is claimed.

`modernization:check` additionally prevents restoring the retired primitive,
Enzyme and hot-loader imports. Existing architecture/catalog/export/dependency/
cycle, license and high/critical audit gates remain active. Detailed results and
limits are recorded in `wave-3-validation.json`; `wave-3-inventory.json` records
the dependency/test layout. Historical wave evidence is unchanged.

Rollback this branch's commits together to return to the completed Wave 2
runtime, lockfile and UI imports. There is no document-format rollback step.
The parked preliminary stash remains available until the final branch is
reviewed; it is not the source of later Wave 2 changes.
