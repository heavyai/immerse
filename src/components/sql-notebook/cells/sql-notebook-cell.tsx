// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import cx from "classnames"
import { useSelector } from "react-redux"
import * as codemirror from "codemirror"
import { AppState } from "vega/charts/types"
import { SqlNotebookInputCell } from "./sql-notebook-input-cell"
import {
  CellType,
  InputAnalysisCell,
  InputSqlCell,
  NotebookCell,
  ResultAnalysisCell
} from "../types"
import { SqlNotebookAnalysisInputCell } from "./sql-notebook-analysis-input-cell"
import { SqlNotebookAnalysisResultCell } from "./sql-notebook-analysis-result-cell"

import { SqlNotebookStatusCell } from "./sql-notebook-status-cell"
import "./sql-notebook-cell.scss"

// Returns the appropriate cell component depending on cell `type`
export const SqlNotebookCell = React.memo(
  ({
    cell,
    cellIndex,
    setActiveEditor
  }: {
    cell: NotebookCell
    cellIndex: number
    setActiveEditor: (editor: codemirror.Editor | null) => void
  }) => {
    const isStickyCell = useSelector(
      (state: AppState) => state.sqlNotebook.cells.length - 1 === cellIndex
    )

    const isResultCell = [
      CellType.RESULT_ANALYSIS,
      CellType.RESULT_SQL,
      CellType.STATUS
    ].includes(cell.type)

    const wrapperClass = cx("cell-wrapper", {
      "cell-wrapper--input": !isResultCell && !isStickyCell,
      "cell-wrapper--result": isResultCell && !isStickyCell
    })

    const getCellOfType = (type: CellType) => {
      switch (type) {
        case CellType.STATUS:
          return <SqlNotebookStatusCell cell={cell} />
        case CellType.INPUT_SQL:
          return (
            <SqlNotebookInputCell
              cell={cell as InputSqlCell}
              cellIndex={cellIndex}
              setActiveEditor={setActiveEditor}
            />
          )
        case CellType.INPUT_ANALYSIS:
          return (
            <SqlNotebookAnalysisInputCell
              cell={cell as InputAnalysisCell}
              cellIndex={cellIndex}
              setActiveEditor={setActiveEditor}
            />
          )
        case CellType.RESULT_SQL:
        case CellType.RESULT_ANALYSIS:
          return (
            <SqlNotebookAnalysisResultCell
              cell={cell as ResultAnalysisCell}
              cellIndex={cellIndex}
              setActiveEditor={setActiveEditor}
            />
          )
        default:
          // eslint-disable-next-line no-console
          console.error(`Unknown cell type not handled`)
          return null
      }
    }

    return (
      <div className={wrapperClass} id={`sql-notebook-cell-${cellIndex}`}>
        {getCellOfType(cell.type)}
      </div>
    )
  }
)
