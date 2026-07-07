// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { IconHeavyIQ } from "components/svg-icons/icon-heavy-iq"
import { CellType, NotebookCell } from "../types"
import "./sql-notebook-cell-title.scss"

type CellTitleProps = {
  cell: NotebookCell
}
export const CellTitle: FC<CellTitleProps> = ({ cell }) => {
  const getPrefix = () => {
    switch (cell.type) {
      case CellType.RESULT_SQL:
        return "Editor: "
      default:
        return (
          <>
            <strong>HeavyIQ</strong>
            <span> assisted: </span>
          </>
        )
    }
  }
  const getLabel = () => {
    switch (cell.type) {
      case CellType.RESULT_SQL:
        return "SQL Query"
      case CellType.RESULT_ANALYSIS:
        return "Generated SQL"
      default:
        return "Initial Prompt"
    }
  }

  return (
    <div className="sql-notebook-title-section">
      <IconHeavyIQ className="header-icon" />
      <span>
        {getPrefix()}
        <strong>{getLabel()}</strong>
      </span>
    </div>
  )
}
