// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useRef, useEffect } from "react"
import sqlFormatter from "sql-formatter"
import cx from "classnames"
import { debounce } from "lodash"
import SplitPane from "react-split-pane"
import { Icon } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"
import { CircularProgress } from "@rmwc/circular-progress"
import { Snackbar, SnackbarAction } from "@rmwc/snackbar"
import "@material/snackbar/dist/mdc.snackbar.css"
import "@rmwc/circular-progress/circular-progress.css"
import { PrimaryButton, SecondaryButtonNoBorder } from "widgets/button/Button"
import JupyterButton from "components/jupyter/JupyterButton"

import {
  SQL_EDITOR_TEST_ID_RUN_BUTTON,
  SQL_EDITOR_TEST_ID_TABLE_BROWSER_TAB,
  SQL_EDITOR_TEST_ID_QUERY_HISTORY_TAB,
  SQL_EDITOR_TEST_ID_TABLE_BROWSER,
  SQL_EDITOR_TEST_ID_QUERY_HISTORY
} from "./constants"
import SqlEditorInput from "./sql-editor-input"
import SqlEditorHistory from "./sql-editor-history"
import SqlEditorResults from "./sql-editor-results"
import SqlEditorTablesBrowser from "./sql-editor-tables-browser"
import SqlEditorBrowserSnippetsPane from "./sql-editor-browser-snippets-pane"

const DEFAULT_INPUT_PANE_HEIGHT = 300

const Drawer = ({
  drawerOpen,
  selectedRow,
  setSelectedRow,
  insertAtCursor
}) => {
  const [showQueryHistory, setShowQueryHistory] = useState(false)
  const [showTableBrowser, setShowTableBrowser] = useState(true)

  return (
    <div
      className={cx("sql-editor__drawer", {
        "sql-editor__drawer--open": drawerOpen
      })}
    >
      <nav className="sql-editor__drawer__tabs">
        <span
          className={cx("sql-editor__drawer__tab", {
            "is-active": showTableBrowser
          })}
          onClick={() => {
            setShowTableBrowser(true)
            setShowQueryHistory(false)
          }}
          data-testid={SQL_EDITOR_TEST_ID_TABLE_BROWSER_TAB}
        >
          Table browser
        </span>
        <span
          className={cx("sql-editor__drawer__tab", {
            "is-active": showQueryHistory
          })}
          onClick={() => {
            setShowTableBrowser(false)
            setShowQueryHistory(true)
          }}
          data-testid={SQL_EDITOR_TEST_ID_QUERY_HISTORY_TAB}
        >
          Query history
        </span>
      </nav>
      <div
        className={cx("sql-editor__drawer__tab-content", {
          "is-active": showTableBrowser
        })}
        data-testid={SQL_EDITOR_TEST_ID_TABLE_BROWSER}
      >
        <SqlEditorTablesBrowser
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
          insertAtCursor={insertAtCursor}
        />
        {selectedRow && (
          <SqlEditorBrowserSnippetsPane
            selectedRow={selectedRow}
            setSelectedRow={setSelectedRow}
            insertAtCursor={insertAtCursor}
          />
        )}
      </div>
      <div
        className={cx("sql-editor__drawer__tab-content", {
          "is-active": showQueryHistory
        })}
        data-testid={SQL_EDITOR_TEST_ID_QUERY_HISTORY}
      >
        <SqlEditorHistory insertAtCursor={insertAtCursor} />
      </div>
    </div>
  )
}

export default function SqlEditorContent({
  executeSQLStatement,
  history,
  loading,
  storeInputValue,
  inputValue,
  backToDashboard,
  hasPrevDashboard
}) {
  const [selectionValue, setSelectionValue] = useState("")
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [selectedRow, setSelectedRow] = useState(null)
  const [resultsTableHeight, setResultsTableHeight] = useState(0)
  const [isResizingResults, setIsResizingResults] = useState(false)
  const [editorInstance, setEditorInstance] = useState(null)

  const insertAtCursor = (stringToInsert) => {
    const doc = editorInstance.getDoc()
    const cursor = doc.getCursor()
    doc.replaceRange(stringToInsert, cursor)
  }

  const splitPaneRef = useRef(null)
  const inputPaneRef = useRef(null)

  const updateResultsHeight = () => {
    // We use this same function as a callback when a user resizes SplitPane.
    // SplitPane actually passes the input pane height to us, but we're using
    // `inputPaneRef` here because we want to resize the pane every time new
    // results are loaded, not just when a user interacts with SplitPane
    const META_TEXT_HEIGHT = 60
    setResultsTableHeight(
      splitPaneRef.current.offsetHeight -
        inputPaneRef.current.offsetHeight -
        META_TEXT_HEIGHT
    )
  }

  const debouncedUpdateResultsHeight = debounce(updateResultsHeight, 5)

  useEffect(() => {
    updateResultsHeight()
  }, [loading])

  const runQuery = () => {
    if (selectionValue) {
      executeSQLStatement(selectionValue)
    } else if (inputValue) {
      executeSQLStatement(inputValue)
    }
  }

  const onSelection = (editor) => {
    // Needs timeout to prevent grabbing previous selection. (Sorry.)
    setTimeout(() => setSelectionValue(editor.doc.getSelection()), 0)
  }

  let inputIsValidJSON = false
  try {
    JSON.parse(inputValue)
    inputIsValidJSON = true
  } catch (error) {
    // Don't care
  }

  const formatInputValue = () => {
    if (inputIsValidJSON) {
      storeInputValue(JSON.stringify(JSON.parse(inputValue), null, 2))
    } else {
      // UD(T)Fs use a custom `=>` for argument names
      storeInputValue(sqlFormatter.format(inputValue).replaceAll("= >", "=>"))
    }
  }

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  const renderQueryButtons = () => {
    const runText = selectionValue ? "Run selected" : "Run query"

    return (
      <div className="sql-editor__buttons">
        <Tooltip content="Shift/Ctrl/&#8984; + Enter" enterDelay={500}>
          <PrimaryButton
            data-testid={SQL_EDITOR_TEST_ID_RUN_BUTTON}
            className="sql-editor__buttons__run"
            icon={loading ? <CircularProgress /> : "play_arrow"}
            onClick={runQuery}
            disabled={!inputValue}
          >
            {loading ? "" : runText}
          </PrimaryButton>
        </Tooltip>

        <SecondaryButtonNoBorder
          icon="format_indent_increase"
          onClick={formatInputValue}
          disabled={!inputValue}
        >
          {inputIsValidJSON ? "Format JSON" : "Format SQL"}
        </SecondaryButtonNoBorder>
      </div>
    )
  }

  const lastQuery = history[history.length - 1]
  const lastQueryIsFromPreviousSession = lastQuery?.restored

  return (
    <div className="sql-editor__content">
      <div className="sql-editor__main">
        <button
          className={cx("button icon-btn back", {
            "is-visible": hasPrevDashboard
          })}
          onClick={backToDashboard}
        >
          <Icon icon="keyboard_arrow_left" />
          {"Back to dashboard"}
        </button>

        <nav className="sql-editor__drawer-toggle" onClick={toggleDrawer}>
          <Icon icon={drawerOpen ? "close" : "keyboard_arrow_left"} />
          {drawerOpen ? null : <Icon icon="settings" />}
        </nav>

        <div
          className={cx("sql-editor__actions", {
            "has-back-button": hasPrevDashboard
          })}
        >
          {renderQueryButtons()}

          <JupyterButton sql={inputValue} />
        </div>

        <div className="sql-editor__pane-container" ref={splitPaneRef}>
          <SplitPane
            pane2Style={{
              // This prevents a scrollbar from flickering in/out as the user drags
              // the pane and the results table resizes
              overflowY: isResizingResults ? "hidden" : "auto"
            }}
            defaultSize={`${DEFAULT_INPUT_PANE_HEIGHT}px`}
            split="horizontal"
            minSize={100}
            maxSize={-100}
            onChange={debouncedUpdateResultsHeight}
            onDragStarted={() => setIsResizingResults(true)}
            onDragFinished={() => setIsResizingResults(false)}
          >
            <div className="sql-editor__top-pane" dir="ltr" ref={inputPaneRef}>
              <SqlEditorInput
                onEnter={runQuery}
                onSelection={onSelection}
                setEditor={setEditorInstance}
              />
            </div>

            <div className="sql-editor__bottom-pane" dir="ltr">
              {!loading && lastQuery && !lastQueryIsFromPreviousSession ? (
                <SqlEditorResults
                  queryResults={lastQuery}
                  resultsTableHeight={resultsTableHeight}
                />
              ) : null}
            </div>
          </SplitPane>
        </div>
      </div>

      <Drawer
        drawerOpen={drawerOpen}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        insertAtCursor={insertAtCursor}
      />

      {lastQuery ? (
        <Snackbar
          dismissesOnAction
          open={
            !loading &&
            lastQuery &&
            !lastQueryIsFromPreviousSession &&
            (lastQuery.error || lastQuery.results)
          }
          icon={lastQuery.error ? "warning" : "check"}
          message={lastQuery.error ? "Query failed" : "Success!"}
          action={<SnackbarAction label="Dismiss" />}
        />
      ) : null}
    </div>
  )
}

SqlEditorContent.propTypes = {}
