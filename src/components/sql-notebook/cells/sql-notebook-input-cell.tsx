// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { useDispatch } from "react-redux"
import cx from "classnames"
import {
  sqlNotebookExecute,
  sqlNotebookSetInput
} from "components/sql-notebook/redux/sql-notebook-action-creators"
import { Editor } from "codemirror"
import { InputSqlCell } from "../types"
import { SqlNotebookSqlRunner } from "./sql-notebook-sql-runner"
import "./sql-notebook-input-cell.scss"

// SQL input cell. Displays code editor when in edit mode, plaintext query otherwise.
export const SqlNotebookInputCell = ({
  cell,
  cellIndex,
  setActiveEditor
}: {
  cell: InputSqlCell
  cellIndex: number
  setActiveEditor: (editor: Editor) => void
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const dispatch = useDispatch()

  const setInput = (value: string) =>
    dispatch(sqlNotebookSetInput(cellIndex, value))

  return (
    <div
      className={cx("sql-notebook__cell sql-input-cell text-input-cell", {
        focused: isFocused
      })}
    >
      <SqlNotebookSqlRunner
        inputValue={cell.input}
        setInputValue={setInput}
        setActiveEditor={setActiveEditor}
        onExecute={(input) => dispatch(sqlNotebookExecute(input, cellIndex))}
        cellIndex={cellIndex}
        setIsFocused={setIsFocused}
      />
    </div>
  )
}
