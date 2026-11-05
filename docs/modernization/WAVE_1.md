# Wave 1: pnpm and package boundaries

Base: `modernization-wave-0` at `52907f0`. Work branch: `wave-1`.

## Toolchain checkpoint

Use Node 24.11.0 and pnpm **10.34.9**, pinned by `packageManager`. Bootstrap with
Corepack or `npm install --global pnpm@10.34.9`, then run `pnpm install --frozen-lockfile`.
Root and Puppeteer are one workspace with one lockfile. Shared external ranges
live in `pnpm-workspace.yaml`; manifests refer to `catalog:`. Internal packages
use `workspace:*` as they are introduced.

The existing npm lockfile was imported rather than deliberately upgrading the
application dependencies. Previously implicit imports are now direct declarations
at their installed versions. Existing npm overrides moved to workspace settings.
Metis is selected from its named `packages/data-layer` subdirectory at the exact
same commit: its repository root is unnamed and pnpm cannot install it as a
package. Its distributed JS SHA-256 remains
`5b73b2d0ced16eb5d4ec44968b1181b383432929a830414ab7ee80c272f1a931`.

pnpm 12.16.1's importer failed on the legacy Git graph. pnpm 10.34.9 completed
its import and clean frozen installation. The npm installation is retained in
`/tmp/immerse-wave1-npm-node_modules` for local comparison, outside the repository.
The old lockfiles remain available in the Wave 0 commit.

The user explicitly approved the temporary workspace-wide
`blockExoticSubdeps: false` exception. Exact HTTPS Git overrides preserve the
11 existing direct/nested source revisions. `scripts/modernization/git-sources.cjs`
checks catalog/override pins and lockfile Git sources against the reviewed list.
Remove the exception as legacy source dependencies retire. It is not a new-source
approval mechanism. Changes to the reviewed list require explicit review.

`autoInstallPeers: false` and `strictPeerDependencies: false` retain the prior
npm `legacy-peer-deps` posture. Known peer mismatches include React 16-era UI,
React Vega versus Vega 6, and TypeScript 3.9 versus newer test tooling. Major
runtime/type upgrades remain outside this package-manager checkpoint.
Dependency build scripts use an explicit `onlyBuiltDependencies` list, including
exact approved Git archive revisions; there is no blanket script approval.

Every Node CI job now uses pnpm and the shared lockfile. PR/main checks include
`pnpm audit --audit-level high` over production, development and optional
workspace dependencies. No finding or error is suppressed. The inherited audit
baseline contains high/critical findings; compatible remediation and remaining
upstream limitations are tracked with the later Wave 1 validation evidence.

## Package boundaries and application wiring

Six private packages now expose declared public exports and TypeScript contracts:

| Package | Responsibility and current application binding |
| --- | --- |
| dashboard-document | Exact JSON/base64 codec, persisted keys, recursive chart mapping and injected pure chart upgrades; dashboard actions/load/versioning delegate here. |
| connector | Injected database transport plus a public legacy connector bridge; services/connector composes the existing client. |
| query-runtime | Injected legacy queue port and future request identity types; ConnectorWithQueue retains its existing queue implementation. |
| chart-core | Isolated chart registry and plugin/engine interfaces; chart-registration registers existing types here. |
| chart-engine-dc | Injected legacy engine, draw/combo and stylesheet bridges; services/dc composes it. |
| ui | Existing button variants behind stable Immerse-owned props; the app Button module reexports them and retains its SCSS. |

The dependency direction is chart-engine-dc → chart-core → dashboard-document.
Connector, query-runtime and UI have independent public interfaces. Application
composition supplies backend clients, queues, migration context and engines.
Packages do not read the application store or import application source. Chart
upgrades retain their registry in the application and receive it explicitly at
the document boundary. Unknown document fields and historical wire bytes remain
unchanged. No new document schema version is written.

Application HeavyAI deep imports now go through declared package exports. New
RMWC/MUI imports remain ratcheted by the architecture baseline; existing vendor UI
is migrated incrementally. UI styles remain application-owned until the UI wave.
`modernization:check` enforces catalog/workspace protocols, exports, declared
package dependencies, dependency cycles, application backimports, Git pins and
architecture ceilings. Package manifests expose types and independent tests.

## Lifecycle ownership

| State | Clear/reset/load behavior |
| --- | --- |
| Dashboard document, annotations, filters, zones, cohorts, parameters, crosslinks, addons and joins | Clear/reset receive fresh initial values; load uses the incoming document. |
| Query results, column values and chart editor workflow | Cleared on clear/reset and successful dashboard load. |
| Shared settings/import workflow, dashboard UI and DC lifecycle state | Fresh initial values on clear/reset. |
| Connection/session state | Preserved by dashboard clear/reset. |

Nested initial values are cloned to prevent one reset poisoning later resets.
The existing distinction between clear and reset tool policy is retained. Query
results still live in Redux in this wave; stale asynchronous results and explicit
cancellation remain Wave 2 work.

## Validation and migration limits

- Clean frozen pnpm installation succeeds; all eight workspace projects pass boundaries.
- Six package suites pass nine tests; independent package declaration/type-consumer checks pass.
- Four modernization suites pass 17 tests, with six unchanged compatibility snapshots and no pending lifecycle TODOs.
- Fourteen focused application suites pass 149 tests and six snapshots.
- Source/package lint and architecture/Git/license guard tests pass.
- Development and production Webpack builds pass. The existing license plugin now discovers real pnpm package roots; an integration test proves it still rejects an unlicensed dependency.
- Real HeavyDB browser smoke passes: synthetic dashboard creation/save, three reloads and crossfilter count 8 → 2. See wave-1-browser-baseline.json. Inventory is in wave-1-inventory.json.

The full application TypeScript 3.9 check remains blocked by the Wave 0 legacy
type baseline (including modern dependency syntax and ES2021 lib configuration).
The new package type check is independently clean. This wave does not claim a
passing full application suite or production-dashboard coverage. Production
fixtures and a supported historical reader/writer window still need owners.

Compatible dependency updates reduced the workspace audit from 61 high/3 critical
to **16 high/0 critical**. The high-severity CI gate deliberately remains blocking.
At the user's direction, **wave-1.5** will stack on this branch for major security
upgrades/replacements, including extraction tooling without a published fix.
No advisory exceptions or severity reductions are configured.

Source transfer continues by ownership: filter/query behavior in Wave 2, chart
implementations after a cross-engine vertical slice, then UI components/styles.
Legacy packages and exact Git pins remain until their consumers have migrated.
Upstream Git prepare scripts may invoke their own npm scripts; repository-owned
workflows use pnpm throughout.
