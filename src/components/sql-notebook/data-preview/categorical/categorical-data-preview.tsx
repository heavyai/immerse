// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { ColumnMetadata } from "constants/prop-types"
import { DataPreviewHeader } from "../data-preview-header"
import { Statistic, StatisticSet } from "../statistic"
import { useCategoricalStats } from "../../hooks/useCategoricalStats"
import { MESSAGE_TYPES, Message } from "components/message/message"
import { LoaderWithHeight } from "../loader-with-height"
import { CategoricalSummaryChart } from "./categorical-summary-chart"
import { STAT_ROW_HEIGHT } from "../utils"

export const CategoricalDataPreview = ({
  column
}: {
  column: ColumnMetadata
}) => {
  const [stats, loading, error] = useCategoricalStats(column)

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
        <Statistic label="Top Values" />
      </section>
      <section className="sql-notebook-data-preview--chart">
        <CategoricalSummaryChart column={column} />
      </section>
    </div>
  )
}
