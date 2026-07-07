// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { ColumnMetadata } from "constants/prop-types"
import { DataPreviewHeader } from "../data-preview-header"
import { Statistic, StatisticSet } from "../statistic"
import { GeospatialSummaryChart } from "./geospatial-summary-chart"
import { useGeospatialStats } from "components/sql-notebook/hooks/useGeospatialStats"
import { LoaderWithHeight } from "../loader-with-height"
import { MESSAGE_TYPES, Message } from "components/message/message"
import { STAT_ROW_HEIGHT } from "../utils"

export const GeospatialDataPreview = ({
  column
}: {
  column: ColumnMetadata
}) => {
  const [stats, loading, error] = useGeospatialStats(column)
  return (
    <div className="sql-notebook-data-preview--sections">
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
                formatFn={(v: number) => v.toFixed(3)}
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
      <section className="sql-notebook-data-preview--chart">
        <GeospatialSummaryChart column={column} />
      </section>
    </div>
  )
}
