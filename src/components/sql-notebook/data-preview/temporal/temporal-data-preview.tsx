// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { ColumnMetadata } from "constants/prop-types"
import { DataPreviewHeader } from "../data-preview-header"
import { Statistic, StatisticSet } from "../statistic"
import { MESSAGE_TYPES, Message } from "components/message/message"
import { LoaderWithHeight } from "../loader-with-height"
import { TemporalSummaryChart } from "./temporal-summary-chart"
import { useTemporalStats } from "components/sql-notebook/hooks/useTemporalStats"

import "./temporal-data-preview.scss"

export const TemporalDataPreview = ({ column }: { column: ColumnMetadata }) => {
  const [stats, loading, error] = useTemporalStats(column)

  return (
    <div className="sql-notebook-data-preview--sections sql-notebook__number-data-preview">
      <DataPreviewHeader column={column} />
      {loading && <LoaderWithHeight />}
      {error && <Message type={MESSAGE_TYPES.ERROR} message={error} />}
      {!loading && !error && (
        <StatisticSet style={{ minHeight: 40 }}>
          {stats?.map(({ value, label, tooltip }) => {
            return (
              <Statistic
                key={label}
                value={value.toLocaleString()}
                label={label}
                tooltip={tooltip}
              />
            )
          })}
          <Statistic
            key="columnType"
            value={column.type}
            label="Subtype"
            tooltip="HeavyDB column type"
          />
        </StatisticSet>
      )}
      <section>
        <header>Distribution Summary</header>
      </section>
      <section className="sql-notebook-data-preview--chart">
        <TemporalSummaryChart column={column} />
      </section>
    </div>
  )
}
