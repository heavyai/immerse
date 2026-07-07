// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import cx from "classnames"

export type Metric = {
  label: string
  value: string | undefined
  warning?: boolean
}

const TableMetric = ({ label, value, warning }: Metric) =>
  value ? (
    <div className="table-metric">
      <span className="table-metric__label">{label}</span>
      <span
        className={cx("table-metric__value", {
          "table-metric__value--warning": warning
        })}
      >
        {value}
      </span>
    </div>
  ) : null

export default TableMetric
