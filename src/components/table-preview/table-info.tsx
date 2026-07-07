// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import cx from "classnames"
import { CommentCell } from "./comment-cell"

type Field = {
  name: string
  type: string
  is_array: boolean
  is_dict: boolean
  precision?: number
  comment?: string | null
}

const TableInfo = ({
  fields,
  showComments
}: {
  fields: Field[]
  showComments: boolean
}) => (
  <div className="table-column-info">
    <div className="table-column-header table-column-row">
      <div>Column</div>
      {showComments && <div>Comment</div>}
      <div>Type</div>
    </div>
    <div className="table-column-body">
      <div
        className={cx("table-column-scroll", {
          "table-column-scroll--comments": showComments
        })}
      >
        {fields.map((d) => (
          <div
            data-testid="table-column-row"
            className="table-column-row"
            key={d.name}
          >
            <div>{d.name}</div>
            {showComments && (
              <CommentCell comment={d.comment} columnName={d.name} />
            )}
            <div>
              {d.type}
              {d.is_array && "[ ] "}
              {d.is_dict && " [dict. encode]"}
              {d.type === "TIMESTAMP" && `(${d.precision})`}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default TableInfo
