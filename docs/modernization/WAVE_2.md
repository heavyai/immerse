# Wave 2: Filter services and query runtime

Base: `wave-1.5` at `4fe3341`. Branch: `wave-2`.

Wave 3's preliminary runtime work was parked before this implementation. This
branch retains React 16 and TypeScript 3.9 from the completed security checkpoint.

## Ownership and application wiring

| Boundary | Implementation |
| --- | --- |
| Canonical filters | Existing omnifilter action/reducer and persisted identifiers remain authoritative for chart filtering. The legacy document conversion now lives in `@immerse/filter-engine` with injected constructors and ID generation. It clones the omnifilter array and is idempotent. |
| Pure filter/query behavior | `@immerse/filter-engine` owns chart/dashboard filter selection and SQL composition. Chart capabilities, datasource resolution, SQL dialect builders and join/link behavior enter through explicit ports. |
| Filter commands | `services/filter-application-service.ts` owns mutation/redraw/notification sequencing. Callers import effectful commands from `services/filter-commands.ts`, state mutations from `filter-state-actions.ts`, and redraw behavior from the DC adapter. The old action facade and split `filter-action-creators-actual` proxy are retired. |
| Filter async workflows | `services/filter-workflows.ts` replaces the dashboard filter saga. Each store owns its workflows and cancellation. Late metadata for a replaced filter, different dashboard or disposed store is discarded. |
| Legacy DC behavior | `services/legacy-dc-filter-adapter.ts` retains chart groups, linked sources, parameter-token redraw and initial-render gating. Existing raster cross-section watchers remain with the raster saga until its engine migration. |
| Queues and caches | Existing MagicQueue/MagicCache implementations moved into `@immerse/query-runtime`; callers import their public workspace exports directly; the old application entry points are removed. Shared promises, latest pending invocation, token separation, throttling and cache limits retain their existing scheduling behavior. |
| Query rows and render beats | `@immerse/query-runtime` owns separate query and Vega render snapshots. Neither the removed `chartData` slice nor `charts[id].data` accumulates query results. Normal Vega completions dispatch metadata only, keeping rows out of Redux and DevTools action history. |
| React/legacy consumers | Subscription hooks and explicit read models supply data to chart rendering, Top-N controls, query planning, colors, exports, SQL parameter tokens and embed formatters. Projections do not modify stored chart configuration. |
| Bootstrap state access | Filter utilities accept explicit state snapshots. A dependency-free bootstrap port plus a separate legacy helper adapter supports existing non-React callers. This is a temporary application boundary; application-wide global store retirement remains Wave 5. |

Stores now create independent saga middleware, query runtimes and filter workflows.
The returned store exposes `dispose()` to cancel its saga task/workflows and dispose
its query runtime. Packages have no imports from application source.

## Request identity, cancellation and notifications

Request tickets include chart, datasource, dashboard, channel and a runtime epoch.
A newer request supersedes an older response in the same channel. Different
sources and layers remain independent. Calls sharing an existing queue promise
share a ticket, preserving pending-result coalescing.

Chart deletion, successful dashboard load, reset, clear and connection lifecycle
actions invalidate relevant data and generations. Vega datasource/layer selection changes invalidate
the affected chart. Current results alone can publish data or errors. The Vega
accumulator sorts multi-digit beat IDs numerically and rejects older data/errors.

The runtime's explicit transport execution port passes an `AbortSignal` and checks
completion even when the transport ignores it. Current legacy HeavyDB queued
requests have **discard-results-only** cancellation: server work may continue.
No backend cancellation support is claimed.

Embed chart-data schemas/formatters remain unchanged. Internal render snapshots
are separate from public query snapshots. Notifications are emitted once for a
changed, current query result; obsolete completions cannot notify subscribers.
Filter command tests preserve the existing per-command notification policy.

## Compatibility and rollback

The `modernization/filterQueryPath` developer flag supports:

- `modern` (default): the workspace filter engine supplies SQL.
- `compare`: both pure implementations run against the same inputs; joins are
  computed once, no extra backend queries execute, and a mismatch uses legacy SQL.
- `legacy`: the retained historical SQL implementation supplies SQL.

The control panel exposes this developer flag. For local debugging it can also be
set in the JSON `featureflags` local-storage object, then reloaded. Reverting the
Wave 2 commit restores the previous result-storage/workflow implementation as a
unit; the SQL flag alone does not restore Redux result storage.

Existing chart type identifiers, document fields, filter-set membership, opaque
plugin fields and serialized JSON/base64 behavior remain unchanged. Legacy
`filters` fields and their input-action compatibility surface are retained. The
reader/writer support window has not been supplied, so this branch removes no
legacy document field or supported writer. The extracted legacy migration keeps
the existing conversion behavior; it does not invent a new format.

## Verification and limits

The recorded browser scenarios cover a real HeavyDB backend with the synthetic
eight-row sales table: creation/save, three saved-dashboard reloads and count
8 → 2 crossfiltering with a visible Vega bar. All three SQL modes pass. Comparison
records six checks with zero mismatches. Live assertions show no Redux chart cache
and no Vega result payload in chart state, while the runtime owns the render data.
See `wave-2-browser-{compare,modern,legacy}.json`.

Unit/integration coverage includes existing crossfilter/group/dimension/bounding
box behavior, filter SQL construction, queue semantics, repeated reset/load,
result subscriptions, embed notifications, metadata races and older beat rejection.
The new CI ownership check prevents reintroducing store reads in filter utilities,
a Redux chart-result slice, Vega result reducers or the dashboard filter saga.
Package types, catalog/export/dependency boundaries and the high/critical audit
gate remain required. Test-helper alias and matcher import fixes allow the
existing query-hook and renderer/filter component suites to run under pnpm.

Detailed counts, build and audit results are in `wave-2-validation.json`; current
workspace ownership/test discovery is in `wave-2-inventory.json`.

Historical Wave 0/1 evidence is unchanged. Full application TypeScript failures
remain the documented legacy baseline; independent package type consumers pass.
No passing full-application test suite or representative production-dashboard
coverage is claimed. Numerical production performance budgets, approved customer
fixtures and the historical reader/writer window still need acceptance. Local
browser timings were collected alongside builds/tests and are compatibility
measurements, not production performance certification.

## Internal compatibility cleanup

Internal import paths and APIs are not compatibility requirements. The follow-up
removes the old MagicQueue/MagicCache reexports and filter-action facade, updates
all callers to their implementation owners, and binds Vega result reducer ports
directly in the consuming middleware. `filter-commands.ts` composes effectful
commands rather than reexporting state mutations. The DC and explicit-state
adapters remain because they still supply runtime behavior to existing consumers.
Dashboard persistence, embed APIs and public plugin contracts retain their
compatibility requirements.
