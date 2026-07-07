// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { ResultAnalysisCell } from "../types"
import { useSqlToAnswer } from "../hooks/useSqlToAnswer"
import { usePreviousCell } from "../hooks/usePreviousCell"
import LoadingWidget from "components/app-overlay/loading-widget"
import { MESSAGE_TYPES, Message } from "components/message/message"

import "./sql-notebook-analysis-result.scss"

export const SqlNotebookAnalysisResult = ({
  cell,
  cellIndex
}: {
  cell: ResultAnalysisCell
  cellIndex: number
}) => {
  const previousCell = usePreviousCell(cellIndex)
  const [answer, loading, error] = useSqlToAnswer({
    question: previousCell.query,
    sql: cell.lastRunSql || cell.generatedSql,
    // cell.tables comes from auto/query endpoint response
    // use previous cell sources if we're coming from /query endpoint
    // worst case we don't have sources
    tables: cell.tables ?? previousCell.sources ?? []
  })

  return (
    <div className="analysis-result">
      {loading && (
        <div className="analysis-result__loading">
          <LoadingWidget />
        </div>
      )}
      {error && <Message message={error} type={MESSAGE_TYPES.ERROR} />}
      {answer && !loading && !error && <div>{answer}</div>}
      {!answer && !loading && !error && (
        <Message type={MESSAGE_TYPES.INFO} message="No summary available" />
      )}
    </div>
  )
}
