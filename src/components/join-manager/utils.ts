// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { importableStore as store } from "store/importableStore"
import { findJoinDataSourceForParameter } from "components/join-manager/use-join-from-parameter"
import { Column } from "vega/constants/data-selection-types"
import { Join, JoinDataSource } from "./join-manager-types"

export const getFullColumnName = (column: Column, columnKey = "label") => {
  if (!column) {
    return ""
  }
  const defaultValue = column[columnKey] ?? column.label
  // Parameterized column values are stored as fully qualified column names
  return column.is_join && !column.parameter
    ? `${column.table}.${column.label}`
    : defaultValue
}

export const getTablesFromJoinDataSource = (joinDataSource: JoinDataSource) => {
  const joins = joinDataSource?.joins ?? []
  const allTables =
    joins
      .map((join: Join) => {
        return [join.leftTable, join.rightTable]
      })
      .flat()
      .filter(Boolean) ?? []
  return Array.from(new Set(allTables))
}

export function getTablesForDataSource(dataSource: string) {
  const joinDataSources = store.getState().joinDataSources
  const joinDataSource = findJoinDataSourceForParameter(
    dataSource,
    joinDataSources
  )
  if (joinDataSource) {
    return getTablesFromJoinDataSource(joinDataSource)
  } else {
    return [dataSource]
  }
}
