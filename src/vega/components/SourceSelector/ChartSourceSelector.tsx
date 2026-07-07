// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import { bindActionCreators } from "redux"

import { initChartEditorTablePreview } from "actions/chart-editor-action-creators"
import { getTablesMeta } from "actions/tables-meta-action-creators"
import { getDataSourcesList } from "actions/tables-action-creators"
import { SourceSelectorOptionKeys } from "vega/components/SourceSelector/BaseSourceSelector"
import { openCustomSourceManager } from "components/custom-source-manager/custom-source-manager-actions"

import BaseSourceSelector, { TableOption } from "./BaseSourceSelector"
import { defaultMemoize } from "reselect"
import { sortBy } from "lodash"
import {
  joinToSelectorItem,
  tableToSelectorItem
} from "components/data-source-selector/utils"
import { JoinDataSource } from "components/join-manager/join-manager-types"
import { toParameterSyntax } from "utils/parameters"
import { findJoinDataSourceForParameter } from "components/join-manager/use-join-from-parameter"

export type DataSourceSelectorEvent = {
  value: string // Table name
}

// Full tables_meta response retrieved from backend
type TTableMeta = any

// A filter on table metadata
type TablesMetaFilter = (tableMeta: TTableMeta) => boolean

type TableResult = { name: string }

// Response from getTables
type Tables = { list: TableResult[] }

// Sorts the tables that are selected elsewhere in the current context to the
// top of the dropdown. If they occur in the main list of tables, they'll be
// filtered out to prevent duplicates.
const sortContextTablesToTop = (
  tables: TableResult[],
  contextTables: object,
  joinDataSources: JoinDataSource[] = []
) => {
  const contextTableOptions = sortBy(
    Object.entries(contextTables),
    ([_, v]) => v.name
  ).map(([tableName, table]) => {
    const joinDataSource = findJoinDataSourceForParameter(
      tableName,
      joinDataSources
    )
    if (joinDataSource) {
      return joinToSelectorItem(joinDataSource)
    } else {
      return tableToSelectorItem({
        name: tableName,
        ...table
      })
    }
  })

  // Add all joins that aren't in dataSources or tables
  // Joins are still duplicated for some reason
  const filteredJoinDataSources = joinDataSources
    .filter((jds) => {
      const joinParam = toParameterSyntax(jds.parameter)
      const parameterInDataSources = Boolean(tables[joinParam])
      const parameterInTables = Boolean(
        tables.find((t) => t.dataSource === joinParam)
      )
      return !(parameterInDataSources || parameterInTables)
    })
    .map(joinToSelectorItem)

  const contextTableNames = Object.keys(contextTables)
  const breakOption = { value: SourceSelectorOptionKeys.BREAK, label: "" }
  const filteredTables = tables
    .filter(
      (table) =>
        !contextTableNames.includes(table.name) &&
        !contextTableNames.includes(table.dataSource)
    )
    .map(tableToSelectorItem)

  const tableOptions = [
    ...filteredJoinDataSources,
    ...filteredTables
  ].sort((a, b) => a.label.localeCompare(b.label))

  return [...contextTableOptions, breakOption, ...tableOptions]
}

const createTableOptions = (
  tables: TableResult[],
  contextTables: object,
  joinDataSources: JoinDataSource[] = []
): TableOption[] | null => {
  if (!tables) {
    return null
  }
  if (contextTables && Object.keys(contextTables).length) {
    return sortContextTablesToTop(tables, contextTables, joinDataSources)
  }

  // Sort by name
  return sortBy(tables, (t) => t.name).map(tableToSelectorItem)
}

const createTableOptionsFromMeta = defaultMemoize(
  (
    tablesMeta: TTableMeta | null,
    contextTableNames?: string[],
    tableMetaFilter?: TablesMetaFilter,
    joinDataSources
  ): TableOption[] | null => {
    // Optionally filter the tables then map them to just table name strings,
    // for comparison against the contextTables if present
    let tables: TableResult[] = []
    if (tablesMeta === null) {
      return null
    } else if (tableMetaFilter) {
      tables = tablesMeta.filter(tableMetaFilter)
    } else {
      tables = tablesMeta
    }

    // Everything downstream expects this in a certain schema
    // minimum set of properties is just a name property (TableResult)
    tables = tables.map(({ table_name: name }) => ({
      name
    }))

    // sortContextTablesToTop expects contextTables to be an object
    const contextTables = contextTableNames?.reduce((prev, name) => {
      prev[name] = { name }
      return prev
    }, {})

    if (contextTables && contextTables.length) {
      return sortContextTablesToTop(tables, contextTables, joinDataSources)
    } else {
      return tables
        .map(tableToSelectorItem)
        .sort((a, b) => a.label.localeCompare(b.label))
    }
  }
)

export type SpecificDataSourceSelectorEventHandler = (
  event: DataSourceSelectorEvent,
  layerId: string
) => void

export type DataSourceSelectorEventHandler = (
  event: DataSourceSelectorEvent
) => void

const mapStateToProps = (
  {
    dashboard: { dataSources },
    tables: { list },
    joinDataSources,
    tablesMeta
  }: { tables: Tables; tablesMeta: TTableMeta },
  { tableMetaFilter }: { tableMetaFilter: TablesMetaFilter }
) => {
  const contextTables = Object.keys(dataSources)
  const sortedTableOptions = tableMetaFilter
    ? createTableOptionsFromMeta(
        tablesMeta.results,
        contextTables,
        tableMetaFilter,
        joinDataSources
      )
    : createTableOptions(list, dataSources, joinDataSources)

  return {
    sortedTableOptions
  }
}

export function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        initChartEditorTablePreview,
        getTablesMeta,
        getDataSourcesList,
        openCustomSourceManager
      },
      dispatch
    )
  }
}

const mergeProps = (stateProps, { actions }, ownProps) => ({
  ...stateProps,
  actions,
  ...ownProps,
  // Only fetch metadata on render if we are filtering our list by table metadata.
  // Otherwise, only fetch the tables list.
  fetchSources: ownProps.tableMetaFilter
    ? actions.getTablesMeta
    : actions.getDataSourcesList
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(BaseSourceSelector)
