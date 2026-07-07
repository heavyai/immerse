// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { printFormattedTableValue } from "../data-manager/utils/print-table-value"
import React from "react"

const SampleRows = (fields, sampleRows) => (
  <div className="table-columns-container">
    {fields.map((d) => (
      <div className="table-columns-item" key={d.name}>
        {d.name}
        <br />
        <small className="table-columns-item-type">
          {d.type}
          {d.is_array && "[ ] "}
          {d.is_dict && " [dict. encode]"}
          {d.type === "TIMESTAMP" && `(${d.precision})`}
        </small>
        {sampleRows.map((row, i) => (
          <p className="table-columns-item-value" key={i}>
            {printFormattedTableValue(row[d.name], d)}
          </p>
        ))}
      </div>
    ))}
  </div>
)

export default SampleRows
