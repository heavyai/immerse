// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import { DestTableHeaders } from "./dest-table-headers"
import { IncomingHeaders } from "./incoming-table-headers"

const COLUMN_TEXT_CUTOFF = 1000

const Table = ({
  incomingFields,
  editableHeaders,
  editableTypes,
  hideDataType,
  handleUpdateDataType,
  rows,
  destTableFields,
  appendTableName,
  previewPlaceholder,
  columnComments,
  updateColumnComment,
  existingColumnComments
}) => (
  <>
    <table className="simple-table" data-testid="simple-table">
      <thead className={`${appendTableName ? "appending" : ""}`}>
        {appendTableName && (
          <DestTableHeaders
            {...{
              destTableFields,
              existingColumnComments
            }}
          />
        )}
        <IncomingHeaders
          {...{
            incomingFields,
            editableHeaders,
            hideDataType: appendTableName ? true : hideDataType,
            editableTypes,
            handleUpdateDataType,
            destTableFields,
            appendTableName,
            columnComments,
            updateColumnComment
          }}
        />
      </thead>
      {!previewPlaceholder && (
        <tbody>
          {rows.map((row, rid) => (
            <tr key={`row${rid}`}>
              {appendTableName && <td className="empty-placeholder" />}
              {row.cols.map((cell, cid) => {
                const { str_val } = cell.val
                const value =
                  str_val.length > COLUMN_TEXT_CUTOFF
                    ? `${str_val.substring(0, COLUMN_TEXT_CUTOFF)}…`
                    : str_val

                return (
                  <td key={`cell${rid}${cid}`}>
                    <span>{value}</span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      )}
    </table>
    <div className="import-table-preview-placeholder">{previewPlaceholder}</div>
  </>
)

Table.propTypes = {
  editableHeaders: PropTypes.bool,
  editableTypes: PropTypes.bool,
  handleUpdateDataType: PropTypes.func,
  hideDataType: PropTypes.bool,
  incomingFields: PropTypes.array,
  rows: PropTypes.array,
  destTableFields: PropTypes.array,
  appendTableName: PropTypes.string
}

export default Table
