// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setDataSourceComment as setTableCommentState } from "actions/table-preview-action-creators"
import {
  deleteTableComment,
  setTableComment
} from "components/data-manager/services/comments.service"
import { AppState } from "vega/charts/types"
import { EditableValue } from "components/editable-value/editable-value"
import { ErrorAlertIcon } from "components/svg-icons/icon-error-alert"
import "./table-comment.scss"

export const TableComment = ({ comment }: { comment?: string }) => {
  const tableName = useSelector(
    (state: AppState) => state.tablePreview.tableName
  )
  const [error, setError] = useState("")
  const dispatch = useDispatch()

  const submitComment = async (newComment: string) => {
    if (!tableName) {
      // Shouldn't be possible to get to this UI without loading table preview
      setError("Cannot set comment; no table preview loaded.")
      return { ok: false }
    }

    if (newComment === comment) {
      setError("")
      return { ok: true }
    }

    // eslint-disable-next-line init-declarations
    let res

    if (newComment) {
      res = await setTableComment(tableName, newComment)
      if (res.ok) {
        dispatch(setTableCommentState(newComment))
      } else {
        const errMessage = await res.text()
        setError(errMessage)
      }
    } else {
      res = await deleteTableComment(tableName)
      if (res.ok) {
        dispatch(setTableCommentState(null))
      } else {
        const errMessage = await res.text()
        setError(errMessage)
      }
    }

    return res
  }

  return (
    <div className="table-comment">
      <EditableValue
        savedValue={comment}
        submitValue={submitComment}
        placeholder="Add a comment"
        error={error}
        setError={setError}
      />
      {error && (
        <div className="table-comment__error">
          <ErrorAlertIcon className="table-comment__error-icon" />
          <div className="table-comment__error-msg">{error}</div>
        </div>
      )}
    </div>
  )
}
