// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Tooltip } from "@rmwc/tooltip"
import { setColumnComment as setColumnCommentState } from "actions/table-preview-action-creators"
import {
  deleteColumnComment,
  setColumnComment
} from "components/data-manager/services/comments.service"
import { AppState } from "vega/charts/types"
import { EditableValue } from "components/editable-value/editable-value"
import { ErrorAlertIcon } from "components/svg-icons/icon-error-alert"
import "./comment-cell.scss"

export const CommentCell = ({
  comment,
  columnName
}: {
  comment: string
  columnName: string
}) => {
  const tableName = useSelector(
    (state: AppState) => state.tablePreview.tableName
  )
  const [error, setError] = useState("")
  const dispatch = useDispatch()

  const submitComment = async (newComment: string) => {
    if (!tableName) {
      // Shouldn't be possible to get to this UI without loading table preview
      // eslint-disable-next-line no-console
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
      res = await setColumnComment(tableName, columnName, newComment)
      if (res.ok) {
        dispatch(setColumnCommentState(columnName, newComment))
        setError("")
      } else {
        const errMessage = await res.text()
        setError(errMessage)
      }
    } else {
      res = await deleteColumnComment(tableName, columnName)
      if (res.ok) {
        dispatch(setColumnCommentState(columnName, null))
        setError("")
      } else {
        const errMessage = await res.text()
        setError(errMessage)
      }
    }

    return res
  }

  return (
    <div className="comment-cell">
      <EditableValue
        savedValue={comment}
        submitValue={submitComment}
        error={error}
        errorIcon={
          <Tooltip content={error}>
            <ErrorAlertIcon className="comment-cell__error-icon" />
          </Tooltip>
        }
        setError={setError}
      />
    </div>
  )
}
