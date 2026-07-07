// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from "react"
import { ColumnMetadata } from "constants/prop-types"
import { DataPreviewHeader } from "../data-preview-header"
import { Statistic, StatisticSet } from "../statistic"
import { useNumericStats } from "../../hooks/useNumericStats"
import { MESSAGE_TYPES, Message } from "components/message/message"
import { LoaderWithHeight } from "../loader-with-height"
import { NumericSummaryChart } from "./numeric-summary-chart"
import {
  DEFAULT_NUM_BUCKETS,
  STAT_ROW_HEIGHT,
  getNumberFormatter
} from "../utils"

import "./numeric-data-preview.scss"

export const NumericDataPreview = ({ column }: { column: ColumnMetadata }) => {
  const [stats, loading, error] = useNumericStats(column)

  // Use the scale for our current column + chart to determine the format of the
  // stats we show here
  const formatFn = useMemo(() => {
    const min = stats.find((stat) => stat.label === "Min Value")?.value ?? 0
    const max = stats.find((stat) => stat.label === "Max Value")?.value ?? 1
    return getNumberFormatter(min, max, DEFAULT_NUM_BUCKETS)
  }, [stats])

  return (
    <div className="sql-notebook-data-preview--sections sql-notebook__number-data-preview">
      <DataPreviewHeader column={column} />
      {loading && <LoaderWithHeight />}
      {error && <Message type={MESSAGE_TYPES.ERROR} message={error} />}
      {!loading && !error && (
        <StatisticSet style={{ minHeight: STAT_ROW_HEIGHT }}>
          {stats?.map(({ value, label, tooltip }) => {
            return (
              <Statistic
                key={label}
                value={value}
                label={label}
                tooltip={tooltip}
                formatFn={formatFn}
              />
            )
          })}
        </StatisticSet>
      )}
      <section>
        <Statistic
          value={column.type}
          label="Subtype"
          tooltip="HeavyDB column type"
        />
      </section>
      <section>
        <Statistic
          value="Range: 5th to 95th percentile"
          label="Distribution Summary"
        />
      </section>
      <section className="sql-notebook-data-preview--chart">
        <NumericSummaryChart column={column} numBuckets={DEFAULT_NUM_BUCKETS} />
      </section>
    </div>
  )
}
