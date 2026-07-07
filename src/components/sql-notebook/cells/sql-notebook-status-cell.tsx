// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { SqlNotebookLoadingResult } from "components/sql-notebook/results/sql-notebook-loading-result"
import { NotebookCell } from "components/sql-notebook/types"
import { MESSAGE_TYPES, Message } from "components/message/message"

export const SqlNotebookStatusCell = ({ cell }: { cell: NotebookCell }) => {
  return (
    <div className="sql-notebook__cell">
      {cell.loading && <SqlNotebookLoadingResult />}
      {cell.error && (
        <Message type={MESSAGE_TYPES.ERROR} message={cell.error} />
      )}
    </div>
  )
}
