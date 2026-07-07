// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SourceSelectorOptionKeys } from "../../vega/components/SourceSelector/BaseSourceSelector"
import { toParameterSyntax } from "utils/parameters"
import { ParameterTypes } from "components/parameters/parameters-types"

export const tableToSelectorItem = (table) => {
  return {
    ...table,
    // If dataSource is set, use it instead of the name. name can be table name, a
    // parameter (custom data source), or the name of a join.
    // dataSource is the parameter used for a join.
    value: table.dataSource || table.name,
    label: table.name
  }
}

export const joinToSelectorItem = (joinDataSource) => {
  return {
    value: toParameterSyntax(joinDataSource.parameter),
    type: ParameterTypes.JOIN,
    label: joinDataSource.name,
    parameter: joinDataSource.parameter
  }
}

/**
 * Combines currently used datasources, tables list, and joins into one list
 *
 * @param {*} dataSources - dataSources currently in use on this dashboard
 * @param {*} tables - All tables fetched from the BE
 * @param {*} joinDataSources - join data sources
 * @returns
 */
export function processTablesListFromDashboardState(
  dataSources,
  tables,
  joinDataSources = []
) {
  const currentlyUsedSources = Object.keys(dataSources).map((source) => {
    const table = tables.find((t) => [t.name, t.dataSource].includes(source))
    const joinDataSource = joinDataSources.find(
      (jds) => toParameterSyntax(jds.parameter) === source
    )

    if (joinDataSource) {
      return joinToSelectorItem(joinDataSource)
    } else if (table) {
      return tableToSelectorItem(table)
    } else {
      return { value: source, label: source }
    }
  })

  // Add a break between currently used sources and the rest of the tables
  const listBreak = currentlyUsedSources.length
    ? [{ value: SourceSelectorOptionKeys.BREAK, label: "" }]
    : []

  // Add all tables that aren't in the dataSources list
  const filteredTables = tables
    .filter((a) => !dataSources[a.name] && !dataSources[a.dataSource])
    .map(tableToSelectorItem)

  // Add all joins that aren't in dataSources or tables
  // Joins are still duplicated for some reason
  const filteredJoinDataSources = joinDataSources
    .filter((jds) => {
      const joinParam = toParameterSyntax(jds.parameter)
      const parameterInDataSources = Boolean(dataSources[joinParam])
      const parameterInTables = Boolean(
        tables.find((t) => t.dataSource === joinParam)
      )
      return !(parameterInDataSources || parameterInTables)
    })
    .map(joinToSelectorItem)

  // This is all tables below the break, combine with joins and sort
  const tableItems = [
    ...filteredTables,
    ...filteredJoinDataSources
  ].sort((a, b) => a.label.localeCompare(b.label))

  // Put them all together
  const allDataSources = [...currentlyUsedSources, ...listBreak, ...tableItems]

  return {
    dataSources,
    tables: allDataSources
  }
}

