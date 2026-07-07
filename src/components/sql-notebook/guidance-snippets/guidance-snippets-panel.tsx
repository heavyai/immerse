// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { TextField } from "@rmwc/textfield"
import { CircularProgress } from "@material-ui/core"
import { useDispatch } from "react-redux"
import cx from "classnames"
import IconPlus from "components/svg-icons/icon-plus"
import { useGuidanceSnippets } from "../redux/useGuidanceSnippets"
import { GuidanceSnippet } from "../types"
import { useIsGuidanceSnippetEditor } from "../hooks/useIsGuidanceSnippetEditor"
import { sqlNotebookOpenGuidanceModal } from "../redux/sql-notebook-action-creators"
import { GuidanceSnippetsList } from "./guidance-snippets-list"
import "./guidance-snippets-panel.scss"

export const GuidanceSnippetsPanel = () => {
  const [searchValue, setSearchValue] = useState("")
  const dispatch = useDispatch()
  const isEditor = useIsGuidanceSnippetEditor()

  const { loading, snippets } = useGuidanceSnippets()

  return (
    <div
      className={cx("guidance-snippets-panel", {
        "guidance-snippets-panel--loading": loading
      })}
    >
      <div className="guidance-snippets-panel__text-field">
        <TextField
          label="Search"
          value={searchValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchValue(e.target.value)
          }
          icon="search"
        />
      </div>
      {isEditor && (
        <div
          className="guidance-snippets-panel__add-guidance-snippets"
          onClick={() => {
            dispatch(sqlNotebookOpenGuidanceModal())
          }}
        >
          <div className="guidance-snippets-panel__add-guidance-snippets-icon">
            <IconPlus />
          </div>
          <div className="guidance-snippets-panel__add-guidance-snippets-label">
            Add guidance snippets
          </div>
        </div>
      )}
      {loading && !snippets ? (
        <div className="guidance-snippets-panel__loading">
          <CircularProgress />
        </div>
      ) : (
        <GuidanceSnippetsList
          searchValue={searchValue}
          onEdit={(snippet: GuidanceSnippet) => {
            dispatch(sqlNotebookOpenGuidanceModal(snippet.snippet_id))
          }}
        />
      )}
    </div>
  )
}
