// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { useDispatch } from "react-redux"
import { Switch } from "@rmwc/switch"
import { Tooltip } from "@rmwc/tooltip"
import { sqlNotebookSetCellType } from "components/sql-notebook/redux/sql-notebook-action-creators"
import { IconFormat } from "components/svg-icons/icon-format"
import { SendIcon } from "components/svg-icons/icon-send"
import { IconSingleLine } from "components/svg-icons/icon-single-line"
import { SqlNotebookEditor } from "./sql-notebook-editor"
import { inputIsValidJSON } from "../utils"
import { CellType } from "../types"
import { Button, BUTTON_TYPES } from "../components/button"
import { CTAButton } from "../components/cta-button"
import { WhisperRecorder } from "../components/whisper-recorder"
import { useSqlFormatMode } from "../hooks/useSqlFormatMode"
import "./sql-notebook-sql-runner.scss"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { useIQEnabled } from "../hooks/useIQEnabled"

// Code editor with execute handling
export const SqlNotebookSqlRunner = ({
  inputValue = "",
  setActiveEditor,
  onExecute,
  setInputValue,
  cellIndex,
  setIsFocused
}: {
  inputValue?: string
  setActiveEditor: (editor: any) => void
  onExecute: (query: string) => void
  setInputValue: (value: string) => void
  cellIndex: number
  setIsFocused: (isFocused: boolean) => void
}) => {
  const executeQuery = () => {
    onExecute(inputValue)
  }

  const isJsonInput = inputIsValidJSON(inputValue)

  const dispatch = useDispatch()
  const iqEnabled = useIQEnabled()

  const toggleCellType = () =>
    dispatch(sqlNotebookSetCellType(cellIndex, CellType.INPUT_ANALYSIS))

  const {
    formatInput,
    singleLineInput,
    sqlFormatted,
    singleLineSqlMode,
    clearSqlFormatMode
  } = useSqlFormatMode(inputValue, setInputValue)

  return (
    <div className="sql-notebook-runner">
      <SqlNotebookEditor
        setActiveEditor={setActiveEditor}
        inputValue={inputValue}
        storeInputValue={(val) => {
          setInputValue(val)
          clearSqlFormatMode()
        }}
        onEnter={executeQuery}
        lineWrapping={singleLineSqlMode}
        setIsFocused={setIsFocused}
      />
      <footer>
        <div>
          {getFeatureFlag(available_feature_flags.ENABLE_TRANSCRIPTION) && (
            <WhisperRecorder onTranscriptUpdate={setInputValue} />
          )}
          {iqEnabled && (
            <div className="cell-type-toggle cell-type-toggle--checked">
              <label>SQL Editor</label>
              <Switch
                onClick={toggleCellType}
                aria-label="SQL Editor"
                checked
              />
            </div>
          )}
          <CTAButton
            onClick={formatInput}
            trailingIcon={<IconFormat />}
            text={`Format ${isJsonInput ? "JSON" : "SQL"}`}
            disabled={sqlFormatted}
          />
          <CTAButton
            onClick={singleLineInput}
            trailingIcon={<IconSingleLine />}
            text="Single Line"
            disabled={singleLineSqlMode}
          />
        </div>
        <Tooltip content="Shift/Ctrl/&#8984; + Enter" enterDelay={500}>
          <Button
            type={BUTTON_TYPES.SUCCESS}
            label="Run"
            onClick={executeQuery}
            trailingIcon={<SendIcon />}
            disabled={inputValue.trim() === ""}
          />
        </Tooltip>
      </footer>
    </div>
  )
}
