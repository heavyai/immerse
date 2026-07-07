// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Editor } from "codemirror"
import cx from "classnames"

import { getTables } from "actions/tables-reference-action-creators"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"
import {
  sqlNotebookCloseGuidanceModal,
  sqlNotebookSetIQEnabled,
  sqlNotebookSetLoading
} from "components/sql-notebook/redux/sql-notebook-action-creators"
import { AppState } from "vega/charts/types"
import { SqlNotebookWorkspace } from "./sql-notebook-workspace"
import { checkIQAvailable } from "./sql-notebook.service"
import { ChevronToggle } from "./components/chevron-toggle"
import { SqlNotebookDataPanel } from "./data-panel/sql-notebook-data-panel"
import { LeftPanel } from "./left-panel/left-panel"
import { sqlNotebookQueue } from "./snackbar-queue"
import { SqlNotebookSnackbar } from "./components/snackbar"
import { GuidanceSnippetModal } from "./guidance-snippets/guidance-snippet-modal"
import "./sql-notebook.scss"

export const SqlNotebook = () => {
  const dispatch = useDispatch()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const editingSnippetId = useSelector(
    (state: AppState) => state.sqlNotebook.guidanceSnippets.editingSnippetId
  )

  const editModalOpen = useSelector(
    (state: AppState) => state.sqlNotebook.guidanceSnippets.editModalOpen
  )

  // Fetch all tables and store in redux
  useEffect(() => {
    dispatch(getTables())
  }, [dispatch])

  const [activeEditor, setActiveEditor] = useState<Editor | null>(null)

  const insertAtCursor = useCallback(
    (stringToInsert: string) => {
      if (activeEditor) {
        const doc = activeEditor.getDoc()
        const cursor = doc.getCursor()
        doc.replaceRange(stringToInsert, cursor)
        // Put the cursor in the editor so you can type + keep copying
        // and Ctrl + Enter will submit
        activeEditor.focus()
      }
    },
    [activeEditor]
  )

  useEffect(() => {
    dispatch(sqlNotebookSetLoading(true))
    checkIQAvailable()
      .then((available) => {
        dispatch(sqlNotebookSetIQEnabled(available))
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error("Error checking IQ availability", e)
        dispatch(sqlNotebookSetIQEnabled(false))
      })
      .finally(() => {
        dispatch(sqlNotebookSetLoading(false))
      })
  }, [dispatch])

  return (
    <>
      <div className={cx("sql-notebook", { "is-collapsed": isCollapsed })}>
        <div className="sql-notebook__data-panel-container">
          {getFeatureFlag(
            available_feature_flags.ENABLE_SQL_NOTEBOOK_GUIDANCE
          ) ? (
            <LeftPanel
              insertAtCursor={insertAtCursor}
              hasActiveEditor={Boolean(activeEditor)}
            />
          ) : (
            <SqlNotebookDataPanel
              insertAtCursor={insertAtCursor}
              hasActiveEditor={Boolean(activeEditor)}
            />
          )}
        </div>
        <SqlNotebookSnackbar messages={sqlNotebookQueue.messages} />
        <div className="sql-notebook__data-panel__spacer" />
        <div className="sql-notebook__data-panel__hide">
          <ChevronToggle
            isCollapsed={isCollapsed}
            onClick={() => {
              setIsCollapsed((prev) => !prev)
              // This triggers a resize event so the vega charts will rerender if shown
              // to fit the new width. Number of milliseconds has to be >= length of the
              // css sidebar transition in sql-notebook.scss
              setTimeout(() => window.dispatchEvent(new Event("resize")), 300)
            }}
          />
        </div>

        <SqlNotebookWorkspace setActiveEditor={setActiveEditor} />
        {editModalOpen && (
          <GuidanceSnippetModal
            onClose={() => dispatch(sqlNotebookCloseGuidanceModal())}
            savedSnippetId={editingSnippetId}
          />
        )}
      </div>
    </>
  )
}
