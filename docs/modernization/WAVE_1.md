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

The next checkpoint extracts the document codec, adds private package ports,
fixes the observed reset/load gaps, and enforces package/public-export boundaries.
