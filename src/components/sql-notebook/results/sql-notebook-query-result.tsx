// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { useDispatch } from "react-redux"
import classNames from "classnames"
import { Message, MESSAGE_TYPES } from "components/message/message"
import { sqlNotebookExecute } from "components/sql-notebook/redux/sql-notebook-action-creators"
import { SqlNotebookTableResult } from "./sql-notebook-table-result"
import { CellType, ResultAnalysisCell, ResultSqlCell } from "../types"
import { SqlNotebookVisualizationManager } from "../visualization/sql-notebook-visualization-manager"
import "./sql-notebook-query-result.scss"
import { SqlNotebookVegaResult } from "./sql-notebook-vega-result"

export enum QUERY_RESULT_VIEW_TYPE {
  TABLE = "table",
  VISUALIZATION = "visualization"
}

/**
 * Renders table results, but deals with running the query + loading + error states
 */
export const SqlNotebookQueryResult = ({
  cell,
  cellIndex,
  view
}: {
  cell: ResultAnalysisCell | ResultSqlCell
  cellIndex: number
  view: QUERY_RESULT_VIEW_TYPE
}) => {
  const { results, loading = false, error } = cell
  const dispatch = useDispatch()

  // Only auto-execute query if there is none cached and no query in progress
  if (
    !results &&
    !loading &&
    !error &&
    // SQL result cell should never make this request since it's run immediately
    // (check is just to tell typescript that)
    cell.type === CellType.RESULT_ANALYSIS
  ) {
    const query = cell.lastRunSql || cell.generatedSql
    dispatch(sqlNotebookExecute(query, cellIndex))
  }
  if (error) {
    // If we also have an IQ error, display that first
    const allErrors = cell.iqError ? (
      <div>
        <div>{cell.iqError}</div>
        <div>{error}</div>
      </div>
    ) : (
      error
    )
    return <Message type={MESSAGE_TYPES.ERROR} message={allErrors} />
  }

  return (
    <div className="query-container">
      <div className={classNames("query-results", { loading })}>
        {view === QUERY_RESULT_VIEW_TYPE.TABLE ? (
          cell.isVega ? (
            <SqlNotebookVegaResult cell={cell} />
          ) : (
            <SqlNotebookTableResult data={results} loading={loading} />
          )
        ) : (
          <SqlNotebookVisualizationManager
            data={results}
            cellIndex={cellIndex}
          />
        )}
      </div>
    </div>
  )
}
