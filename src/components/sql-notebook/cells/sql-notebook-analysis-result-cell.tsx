// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import cx from "classnames"
import React, { forwardRef, useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import * as codemirror from "codemirror"
import {
  SqlNotebookQueryResult,
  QUERY_RESULT_VIEW_TYPE
} from "components/sql-notebook/results/sql-notebook-query-result"
import {
  sqlNotebookExecute,
  sqlNotebookSetActiveTab,
  sqlNotebookSetInput
} from "components/sql-notebook/redux/sql-notebook-action-creators"
import { ButtonTab, ButtonTabs } from "components/button-tabs/button-tabs"
import { IconFormat } from "components/svg-icons/icon-format"
import {
  ResultTabKey,
  CellType,
  NotebookCell,
  ResultAnalysisCell,
  ResultSqlCell
} from "../types"
import { ResultCellHeader } from "./sql-notebook-result-cell-header"
import { SqlNotebookEditor } from "./sql-notebook-editor"
import {
  CollapsibleResult,
  CollapsibleResultRef
} from "components/sql-notebook/results/collapsible-result"
import { IconSingleLine } from "components/svg-icons/icon-single-line"
import { CTAButton } from "../components/cta-button"
import { inputIsValidJSON } from "../utils"
import { IconExpand } from "../../svg-icons/icon-expand"
import { SqlNotebookAnalysisResult } from "../results/sql-notebook-analysis-result"
import { ResultCellActions } from "./sql-notebook-result-cell-actions"
import { useSqlFormatMode } from "../hooks/useSqlFormatMode"
import { LinkButton } from "../components/link-button"

import "./sql-notebook-analysis-result-cell.scss"
import { EditingIconBadge } from "../components/editing-icon-badge"
import { useIQEnabled } from "../hooks/useIQEnabled"

const TABS = {
  [ResultTabKey.DETAILS]: {
    label: "Details",
    Component: forwardRef(
      (
        {
          cell,
          cellIndex,
          initExpanded
        }: {
          cell: ResultAnalysisCell | ResultSqlCell
          cellIndex: number
          initExpanded: boolean
        },
        ref: React.ForwardedRef<CollapsibleResultRef>
      ) => {
        return (
          <CollapsibleResult ref={ref} initExpanded={initExpanded}>
            <SqlNotebookQueryResult
              view={QUERY_RESULT_VIEW_TYPE.TABLE}
              cell={cell}
              cellIndex={cellIndex}
            />
          </CollapsibleResult>
        )
      }
    ),
    show: () => true,
    value: ResultTabKey.DETAILS
  },
  [ResultTabKey.ANALYSIS]: {
    label: "Summary",
    Component: SqlNotebookAnalysisResult,
    show: (cell: NotebookCell, iqEnabled: boolean) =>
      cell.type === CellType.RESULT_ANALYSIS && !cell.hideAnalysis && iqEnabled,
    value: ResultTabKey.ANALYSIS
  },
  [ResultTabKey.VISUALIZATION]: {
    label: "Visualizations",
    Component: forwardRef(
      (
        {
          cell,
          cellIndex
        }: {
          cell: ResultAnalysisCell
          cellIndex: number
        },
        _: React.ForwardedRef<CollapsibleResultRef>
      ) => (
        <SqlNotebookQueryResult
          view={QUERY_RESULT_VIEW_TYPE.VISUALIZATION}
          cell={cell}
          cellIndex={cellIndex}
        />
      )
    ),
    show: (cell: NotebookCell) => !cell.isVega,
    value: ResultTabKey.VISUALIZATION
  }
}

const DEFAULT_TABS: Array<ButtonTab<NotebookCell>> = [
  TABS[ResultTabKey.DETAILS],
  TABS[ResultTabKey.ANALYSIS],
  TABS[ResultTabKey.VISUALIZATION]
]

// HeavyIQ result cell. Renders plaintext answer and generated SQL/SQL editor
export const SqlNotebookAnalysisResultCell = ({
  cell,
  cellIndex,
  setActiveEditor
}: {
  cell: ResultAnalysisCell | ResultSqlCell
  cellIndex: number
  setActiveEditor: (editor: codemirror.Editor | null) => void
}) => {
  const dispatch = useDispatch()
  // Prevent executing SQL for IQ generated queries until user expands section,
  // unless results have already been fetched.
  const hasIqError = cell.iqError && cell.type === CellType.RESULT_ANALYSIS
  const initExpanded =
    cell.type === CellType.RESULT_SQL ||
    cell.results ||
    cell.loading ||
    hasIqError
  const collapsibleRef = useRef<CollapsibleResultRef>()
  const [selectionValue, setSelectionValue] = useState("")
  const [sqlExpanded, setSqlExpanded] = useState(false)
  const [editingSql, setEditingSql] = useState(false)
  const [unsavedInput, setUnsavedInput] = useState(cell.input)
  const [editorHovered, setEditorHovered] = useState(false)
  const editorRef = useRef<codemirror.Editor | undefined>()
  const iqEnabled = useIQEnabled()

  const storeInputValue = (val: string) => {
    dispatch(sqlNotebookSetInput(cellIndex, val))
  }

  const isJsonInput = inputIsValidJSON(cell.input)

  const {
    formatInput,
    singleLineInput,
    sqlFormatted,
    singleLineSqlMode,
    clearSqlFormatMode
  } = useSqlFormatMode(unsavedInput, setUnsavedInput)

  const partialQuerySelected = selectionValue && selectionValue !== unsavedInput

  const setActiveTab = (tab: ResultTabKey) => {
    dispatch(sqlNotebookSetActiveTab(cellIndex, tab))
  }

  useEffect(() => {
    // Auto-expand collapsible results tab when results return
    if ((cell.results || cell.loading) && collapsibleRef.current?.expand) {
      collapsibleRef.current.expand()
    }
  }, [cell.loading, cell.results])

  const executeQuery = () => {
    if (partialQuerySelected) {
      // Run selected
      dispatch(sqlNotebookExecute(selectionValue, cellIndex))
    } else {
      // Run everything and save
      storeInputValue(unsavedInput)
      // Fast forward = true if we have an IQ error in our cell
      dispatch(
        sqlNotebookExecute(unsavedInput, cellIndex, Boolean(cell.iqError))
      )
      setSelectionValue("")
      setEditingSql(false)

      // Stop editing, and lose focus if executing from editing sql
      const editor = editorRef.current
      editor?.setSelection(editor?.posFromIndex(0))
      editor?.display?.input?.blur()
      setActiveEditor(null)
    }

    // If our component is collapsible, expand it.
    if (collapsibleRef.current?.expand) {
      collapsibleRef.current.expand()
    }
  }

  useEffect(() => {
    setUnsavedInput(cell.input)
  }, [cell.input])

  const shownTabs = DEFAULT_TABS.filter((tab) => tab.show(cell, iqEnabled))
  const { Component } = TABS[cell.activeTab] || shownTabs[0]

  const onSelection = (editor: codemirror.Editor) => {
    // Needs timeout to prevent grabbing previous selection
    setTimeout(() => setSelectionValue(editor.getDoc().getSelection()), 0)
  }

  const onSetActiveEditor = (editor: codemirror.Editor) => {
    editorRef.current = editor
    setActiveEditor(editor)
  }
  const onCancel = () => {
    if (editingSql) {
      setUnsavedInput(cell.input)
      setEditingSql(false)
      setActiveEditor(null)
    }
  }

  const onFocus = (editor: codemirror.Editor) => {
    setActiveEditor(editor)
    setEditingSql(true)
  }

  return (
    <div className="sql-notebook__cell sql-notebook__cell--analysis-result">
      <header>
        <ResultCellHeader cell={cell} />
      </header>

      <section
        className={cx("sql-notebook__cell__section sql-notebook__cell__code", {
          "sql-notebook__cell__code--expanded": sqlExpanded,
          "sql-notebook__cell__code--single-line": singleLineSqlMode,
          "sql-notebook__cell__code--active": editingSql,
          "sql-notebook__cell__code--editable": !editingSql
        })}
        onMouseOverCapture={() => {
          setEditorHovered(true)
        }}
        onMouseOut={() => {
          // Gets choppy bc of the mouse over on the cta buttons :eye-roll: sheite
          setEditorHovered(false)
        }}
      >
        <SqlNotebookEditor
          setActiveEditor={onSetActiveEditor}
          inputValue={unsavedInput}
          storeInputValue={(val) => {
            setUnsavedInput(val)
            clearSqlFormatMode()
          }}
          onEscape={onCancel}
          onEnter={executeQuery}
          onSelection={onSelection}
          onFocus={onFocus}
          lineWrapping={singleLineSqlMode}
          autofocus={false}
        />
        {editingSql && <EditingIconBadge />}
        <div
          className={cx("sql-notebook__cell__code__cta", {
            "sql-notebook__cell__code__cta--editing":
              editorHovered || editingSql
          })}
        >
          <CTAButton
            text={`Format ${isJsonInput ? "JSON" : "SQL"}`}
            trailingIcon={<IconFormat />}
            onClick={formatInput}
            disabled={sqlFormatted}
          />
          <CTAButton
            text="Single Line"
            trailingIcon={<IconSingleLine />}
            onClick={singleLineInput}
            disabled={singleLineSqlMode}
          />
          <CTAButton
            trailingIcon={<IconExpand />}
            onClick={() => setSqlExpanded(!sqlExpanded)}
            className="sql-expand-cta"
          />
        </div>
        <div className="sql-notebook__cell__code__actions">
          <LinkButton
            text={`copy ${isJsonInput ? "json" : "sql"}`}
            onClick={() => navigator.clipboard.writeText(unsavedInput)}
          />
        </div>
      </section>
      <section>
        {editingSql && (
          <ResultCellActions
            onRun={executeQuery}
            onCancel={onCancel}
            runLabel={partialQuerySelected ? "Run Selected" : "Run"}
          />
        )}
      </section>
      <section className="sql-notebook__cell__footer">
        <div className="sql-notebook__cell__tabs">
          <ButtonTabs
            tabs={shownTabs}
            onActiveTabChange={setActiveTab}
            activeTab={cell.activeTab || shownTabs[0].value}
          />
        </div>
      </section>
      <section className="sql-notebook__cell__section">
        <Component
          cell={cell}
          cellIndex={cellIndex}
          ref={collapsibleRef}
          initExpanded={initExpanded}
        />
      </section>
    </div>
  )
}
