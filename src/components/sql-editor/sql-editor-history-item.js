// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import cx from "classnames"
import { Icon } from "@rmwc/icon"

import { SQL_EDITOR_TEST_ID_QUERY_HISTORY_ITEM } from "./constants"

// TODO: This is nearly an exact copy of `TableRow` in SqlEditorTableSelector
// Refactor opportunity
export default function SqlEditorHistoryItem({
  item,
  setSelected,
  selected,
  insertAtCursor
}) {
  const insertValue = (e) => {
    e.stopPropagation()
    insertAtCursor()
  }

  return (
    <div
      className={cx("insert-action-row", {
        "is-active": selected
      })}
      onClick={setSelected}
      data-testid={SQL_EDITOR_TEST_ID_QUERY_HISTORY_ITEM}
    >
      <Icon
        className="insert-action-row__icon has-action"
        icon="input"
        title="Copy To SQL Input Box"
        style={{
          // Material's insert icon points right and there's no left-pointing
          // option, so flipping it with CSS
          transform: "scaleX(-1)"
        }}
        onClick={insertValue}
      />

      <span className="insert-action-row__value">{item.query}</span>
    </div>
  )
}

SqlEditorHistoryItem.propTypes = {}
