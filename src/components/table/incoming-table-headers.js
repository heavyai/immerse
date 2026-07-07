// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import EditableColumnHeader from "./editable-column-header-parent"
import CustomSelector from "../custom-selector/custom-selector"
import {
  findColDataType,
  findTypeStringByColumnType,
  TABLE_DATA_TYPES
} from "../../constants/table-data-types"
import { TextField } from "@rmwc/textfield"
import PropTypes from "prop-types"
import React from "react"

// Headers for incoming data; used for creating a new table and appending data to
// an existing table. When appending data to a table, displays the columns that are being appended.
export const IncomingHeaders = ({
  incomingFields,
  editableHeaders,
  hideDataType,
  editableTypes,
  handleUpdateDataType,
  destTableFields,
  appendTableName,
  columnComments,
  updateColumnComment
}) => (
  <tr>
    {appendTableName && (
      <th className="row-label">
        <span>
          <strong>Append</strong>
        </span>
      </th>
    )}
    {incomingFields.map((field, i) => {
      const nameMatchesDest =
        appendTableName &&
        destTableFields[i] &&
        field.clean_col_name === destTableFields[i].column
      return (
        <th key={`header${i}`}>
          {editableHeaders && !field.col_name_locked ? (
            <EditableColumnHeader
              columnId={i}
              columnName={field.clean_col_name}
              isNotValid={field.is_not_valid}
            />
          ) : (
            <span className="column-name">
              {nameMatchesDest ? (
                <strong>{field.clean_col_name}</strong>
              ) : (
                <em>
                  <strong>{field.clean_col_name}</strong>
                </em>
              )}
            </span>
          )}
          {!hideDataType &&
            (editableTypes && !field.col_type_locked ? (
              <CustomSelector
                className="datatype-selector"
                currentValue={findColDataType(field.col_type)}
                onChange={handleUpdateDataType(i)}
                options={TABLE_DATA_TYPES}
              />
            ) : (
              appendTableName && (
                <span className="column-type">
                  {findTypeStringByColumnType(
                    field.col_type && field.col_type.type
                  )}
                </span>
              )
            ))}
          {!appendTableName && (
            <TextField
              value={columnComments[i]}
              onChange={(e) => updateColumnComment(i, e.target.value)}
              className="column-comment-input"
              label="Comment"
            />
          )}
        </th>
      )
    })}
  </tr>
)

IncomingHeaders.propTypes = {
  editableHeaders: PropTypes.bool,
  editableTypes: PropTypes.bool,
  handleUpdateDataType: PropTypes.func,
  hideDataType: PropTypes.bool,
  incomingFields: PropTypes.array,
  destTableFields: PropTypes.array,
  appendTableName: PropTypes.string
}
