# Immerse UI

Private workspace owner for application UI primitives. Product code imports the
public `@immerse/ui` entry point; dependencies and styles remain package-owned.
There are no imports from application `src`.

Native buttons, checkboxes and switches use standard DOM events and accessible
labels. Radix supplies tooltip, dialog, popover and range-slider mechanics.
`Menu` adds item keyboard navigation to the popover; `MenuSurface` supports
arbitrary popover content. Controlled callers own open/checked/value state.

Import `@immerse/ui/tokens.css` once after the application theme definitions.
Semantic variables alias the current theme/custom tint and customer primary
color. Component styles are CSS Modules. The remaining global application/MDC
styles apply to unmigrated controls and must not be copied into new primitives.
Portal layers are explicit: dialogs 3000, menus 4000, tooltips 5000, so menus
opened inside dialogs stay above their parent surface. Windows forced-color and
reduced-motion preferences retain browser behavior.

Buttons accept native button attributes plus `variant` (primary, secondary,
quiet), optional semantic tone, label and decorative icons. New callers should
use these props rather than MDC flags. Provide accessible names for icon-only
buttons and unlabelled controls. Menus need native button triggers; dialogs need
a `DialogTitle`. Sliders accept a scalar or array, with change/commit callbacks
receiving `(null, value)` and standard ARIA labels for thumbs.

Run `pnpm --filter @immerse/ui test`, `pnpm run ts:packages`, and
`pnpm run test:ui:browser`. The standalone browser fixture is separate from the
product bundle and HeavyDB. Its tests cover keyboard operation, focus containment
and return, portal cleanup, pointer dragging and theme-token inheritance.
See `docs/modernization/WAVE_3.md` for the migration record and remaining owners.

Owned form controls include native date/datetime-local fields (string values,
millisecond steps), file input/drop targets with cancellable reads, and select/
creatable-select controls backed by React Select. Application callers own date
parsing, timezone semantics, document parsing and domain validation. The package
imports no application code. Form styles are isolated in `form-controls.module.css`.

Portaled dialog sections expose `data-ui="dialog-title"`, `dialog-content`, and
`dialog-actions` for consumer layouts. Set `--dialog-width` on a dialog to size a
specialized editor; the application SimpleDialog also supports
`--dialog-min-width`. Put consumer classes on the portaled dialog itself rather
than relying on an ancestor that remains at the trigger location.

`Switch` uses the standard thumb/track presentation, with `compact` for dense
settings. `Toggle` has the larger pill/check/cross presentation used by legacy
chart controls; both retain native checkbox events and switch semantics. Slider
roots expose `data-ui="slider"` so adjacent numeric inputs can share a row without
depending on Radix's internal markup.
