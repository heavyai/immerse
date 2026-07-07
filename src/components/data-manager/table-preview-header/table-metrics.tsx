// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import TableMetric, { Metric } from "./table-metric"
import React from "react"

const TableMetrics = ({ metrics }: { metrics: Metric[] }) => (
  <div className="table-preview-header__metadata">
    {metrics.map((m) => (
      <TableMetric {...m} key={m.label} />
    ))}
  </div>
)

export default TableMetrics
