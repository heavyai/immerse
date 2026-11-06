# @immerse/filter-engine

Private pure filter selection and SQL composition. The application injects chart
capabilities, datasource resolution and the existing SQL dialect builders. This
package does not import application source or read a store. Owners: Immerse
repository maintainers, reviewed with filter/query consumers.

`createFilterEngine` selects applicable chart/dashboard filters and composes SQL
through supplied dialect/join/link ports. `createLegacyFilterMigrator` preserves
the existing document migration, injects ID generation and leaves its input
untouched. Historical comparison, rollback and compatibility notes are preserved on the
`modernization-docs-archive` branch.
