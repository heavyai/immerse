// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import cx from "classnames"
import { TextField } from "@rmwc/textfield"
import { Switch } from "@rmwc/switch"
import * as codemirror from "codemirror"
import {
  sqlNotebookIQRequest,
  sqlNotebookSetCellType,
  sqlNotebookSetDefaultSources,
  sqlNotebookSetFastforward,
  sqlNotebookSetFastforwardDefault,
  sqlNotebookSetInput,
  sqlNotebookSetSources
} from "components/sql-notebook/redux/sql-notebook-action-creators"
import Portal from "components/portal/Portal"
import { SourceOutlinedIcon } from "components/svg-icons/icon-source-outlined"
import { AppState } from "vega/charts/types"
import { CellType, InputAnalysisCell } from "../types"
import { SqlNotebookSourceSelector } from "./sql-notebook-source-selector"
import { SqlEditorCTA } from "../components/sql-editor-cta"
import { WhisperRecorder } from "../components/whisper-recorder"
import { Pill } from "../components/pill"
import { CellTitle } from "./sql-notebook-cell-title"
import { EditableTextField } from "../components/editable-text-field"
import { useInputKeyboardControls } from "../hooks/useInputKeyboardControls"
import { SqlNotebookAnalysisInputCellSubmit } from "./sql-notebook-analysis-input-cell-submit"
import { useShouldFastforward } from "../hooks/useShouldFastforward"

import "./sql-notebook-analysis-input-cell.scss"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { UsedSnippetsIndicator } from "../components/used-snippets-indicator"

const MAX_NUM_SOURCES = 5
// Code editor input cell
export const SqlNotebookAnalysisInputCell = ({
  cell,
  cellIndex,
  setActiveEditor
}: {
  cell: InputAnalysisCell
  cellIndex: number
  setActiveEditor: (editor: codemirror.Editor | null) => void
}) => {
  const dispatch = useDispatch()
  const { input, usedSnippets = [] } = cell
  const sources = new Set(cell.sources)
  const [inputIsFocused, setInputIsFocused] = useState(false)
  const isLastCell = useSelector((state: AppState) => {
    return state.sqlNotebook?.cells?.length - 1 === cellIndex
  })
  const fastforward = useShouldFastforward(cellIndex)
  const [editingSources, setEditingSources] = useState(false)

  // Can't insert into text inputs, at least for now.
  useEffect(() => {
    setActiveEditor(null)
  }, [setActiveEditor])

  const setSources = (newSources: Set<string>) =>
    dispatch(sqlNotebookSetSources(cellIndex, [...newSources]))

  const setQuery = (newQuery: string) =>
    dispatch(sqlNotebookSetInput(cellIndex, newQuery))

  const editingPreviouslyRunCell = !isLastCell
  const generateAnalysis = (value = input) => {
    // When editing an existing cell, fastforward cannot be changed and is only
    // triggered if it was set on the initial run. Editing a cell should have no
    // affect on the default for new cells.
    if (!editingPreviouslyRunCell) {
      dispatch(sqlNotebookSetFastforwardDefault(fastforward))
      dispatch(sqlNotebookSetFastforward(fastforward, cellIndex))
    }

    if (value?.trim()) {
      dispatch(sqlNotebookSetDefaultSources([...sources]))
      dispatch(sqlNotebookIQRequest(value, sources, cellIndex))
    }
  }

  const keyboardControlProps = useInputKeyboardControls<HTMLTextAreaElement>(
    () => generateAnalysis(),
    () => {},
    true
  )

  const removeSource = (sourceName: string) => {
    sources.delete(sourceName)
    setSources(sources)
  }

  const toggleCellType = () =>
    dispatch(sqlNotebookSetCellType(cellIndex, CellType.INPUT_SQL))

  const showPlaceholder = !inputIsFocused && !input

  return (
    <div
      className={cx("sql-notebook__cell text-input-cell", {
        focused: inputIsFocused
      })}
    >
      {isLastCell ? (
        <>
          <TextField
            className="text-input-cell__input"
            textarea
            value={input}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setInputIsFocused(true)}
            onBlur={() => setInputIsFocused(false)}
            autoFocus={cellIndex !== 0}
            {...keyboardControlProps}
          >
            {showPlaceholder && (
              <div className="text-input-cell__placeholder">
                Ask HeavyIQ to write SQL for you or use the{" "}
                <SqlEditorCTA onClick={toggleCellType} />
              </div>
            )}
          </TextField>
          <footer>
            <div>
              {getFeatureFlag(available_feature_flags.ENABLE_TRANSCRIPTION) && (
                <WhisperRecorder onTranscriptUpdate={setQuery} />
              )}
              <div className="cell-type-toggle">
                <label>SQL Editor</label>
                <Switch
                  aria-label="SQL Editor"
                  onClick={toggleCellType}
                  checked={false}
                />
              </div>
              <div className="text-input-cell__sources">
                {sources.size ? (
                  Array.from(sources).map((sourceName) => (
                    <Pill
                      label={sourceName}
                      onClick={() => {
                        setEditingSources(true)
                      }}
                      onRemove={(label) => {
                        removeSource(label)
                      }}
                      key={sourceName}
                    />
                  ))
                ) : (
                  <div className="sources-placeholder">
                    <SourceOutlinedIcon />
                    <span>Specify sources</span>
                  </div>
                )}
                {sources.size < MAX_NUM_SOURCES && (
                  <Pill
                    onClick={() => {
                      setEditingSources(true)
                    }}
                    label="+ Add"
                    tooltip={null}
                  />
                )}
              </div>
            </div>
            <div className="text-input-cell__actions">
              <SqlNotebookAnalysisInputCellSubmit
                runDisabled={!input?.trim()}
                generateAnalysis={generateAnalysis}
                cellIndex={cellIndex}
              />
            </div>
          </footer>
        </>
      ) : (
        <>
          <header className="sql-notebook-header">
            <CellTitle cell={cell} />
            {usedSnippets.length ? (
              <>
                <div className="text-input-cell__snippets">
                  <UsedSnippetsIndicator snippets={usedSnippets} />
                </div>
                <div className="text-input-cell__separator" />
              </>
            ) : null}
            <div className="text-input-cell__sources">
              {(sources.size ? Array.from(sources) : cell.autoTables || []).map(
                (sourceName: string) => (
                  <Pill label={sourceName} key={sourceName} />
                )
              )}
            </div>
          </header>
          <EditableTextField
            text={input}
            onSubmit={(value) => {
              setQuery(value)
              generateAnalysis(value)
            }}
            submitOnEnter
          />
        </>
      )}
      {editingSources && (
        <Portal rootId="custom-portal-root">
          <SqlNotebookSourceSelector
            cancelChanges={() => setEditingSources(false)}
            submitSources={(sourceList) => {
              setSources(sourceList)
              setEditingSources(false)
            }}
            initialSources={sources}
            maxSources={MAX_NUM_SOURCES}
          />
        </Portal>
      )}
    </div>
  )
}
