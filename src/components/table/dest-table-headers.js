// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import PropTypes from "prop-types"
import React from "react"
import { TDatumType } from "@heavyai/connector/dist/browser-connector"
import { findTypeStringByColumnType } from "../../constants/table-data-types"

// Headers from an existing table; displayed when appending data.
export const DestTableHeaders = ({
  destTableFields,
  existingColumnComments
}) => (
  <tr className="dest-headers">
    <th className="row-label">
      <span>
        <strong>Existing</strong>
      </span>
    </th>
    {destTableFields.map((field, i) => (
      <th key={`append-header${i}`}>
        <span className="column-name">
          <strong>{field.column}</strong>
        </span>
        <p className="column-comment">{existingColumnComments[i] || null}</p>
        <span className="column-type">
          {findTypeStringByColumnType(TDatumType[field.type])}
        </span>
      </th>
    ))}
  </tr>
)

DestTableHeaders.propTypes = {
  destTableFields: PropTypes.array
}
