# @immerse/query-runtime

Owner: Immerse repository maintainers; contract changes are reviewed with the application consumers.
Private source workspace package. Import only the declared public exports.

Run `pnpm --filter @immerse/query-runtime test` from the repository root.
Public declarations are checked by `pnpm run ts:packages`.

Historical migration notes are preserved on the `modernization-docs-archive` branch.

Wave 2 adds `createChartQueryRuntime` for independently owned query/render
snapshots, scoped request generations, coalesced-promise tracking, invalidation,
subscriptions and disposal. `createVegaResultReducers` is a pure injected beat
accumulator. Legacy queue/cache exports preserve their scheduling semantics.
Current HeavyDB adapters discard obsolete results; cooperative cancellation is
available through the runtime's `execute` port when a transport honors its signal.
Historical ownership and rollback notes are preserved on the
`modernization-docs-archive` branch.
