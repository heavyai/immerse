// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react"

import { VegaLite } from "react-vega"
import { ColumnMetadata } from "constants/prop-types"
import Services from "services/immerse"
import { VegaTypeMap } from "../../types"
import d3 from "services/d3"

import "./numeric-summary-chart.scss"
import { usePercentiles } from "components/sql-notebook/hooks/usePercentiles"
import { LoaderWithHeight } from "../loader-with-height"
import { MESSAGE_TYPES, Message } from "components/message/message"
import {
  DEFAULT_NUM_BUCKETS,
  createBarChartSummarySpec,
  VISUALIZATION_HEIGHT,
  getNumericDistributionQuery,
  getNumberFormatter
} from "../utils"
import { formatNumber } from "charts/utils/coordinate-helpers"
import { TopLevelSpec } from "vega-lite"
import { useImmerseUITheme } from "utils/theme/use-immerse-ui-theme"

const DEFAULT_PERCENTILES = [0.05, 0.95]
const countAlias = "bucketCount"
const bucketAlias = "bucketNumber"

export const NumericSummaryChart = ({
  column,
  numBuckets = DEFAULT_NUM_BUCKETS
}: {
  column: ColumnMetadata
  numBuckets?: number
}) => {
  const [vegaData, setVegaData] = useState<{ table: Array<any> }>()
  const [vegaSpec, setVegaSpec] = useState<TopLevelSpec>()
  const [percentiles, percentileLoading, percentileError] = usePercentiles(
    column,
    DEFAULT_PERCENTILES
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { theme } = useImmerseUITheme()

  useEffect(() => {
    setError(null)
    if (!percentiles?.length) {
      return
    }

    if (percentiles[0] === percentiles[1]) {
      setError("Numeric distribution chart not available for this column")
      return
    }
    const [min, max] = percentiles
    const query = getNumericDistributionQuery(column, min, max, numBuckets, {
      countAlias,
      bucketAlias
    })
    const dbCon = Services.get("DbCon")
    setLoading(true)
    // Precompute axis + tooltip labels: avoids custom vega expression
    // functions and the spec-bypassed `formatTooltip` prop.
    const labelScale = d3.scale
      .linear()
      .domain([0, numBuckets])
      .range([min, max])
    const labelFormatFn = getNumberFormatter(min, max, numBuckets)
    const minLabel = labelFormatFn(labelScale(0))
    const maxLabel = labelFormatFn(labelScale(numBuckets))
    dbCon
      .queryAsync(query)
      .then((result: Array<any>) => {
        // Fill in missing buckets with 0s and add tooltip-friendly labels.
        const filledResult = [...Array(numBuckets)].map((_, i) => {
          const row = result.find((r) => r[bucketAlias] === i) ?? {
            [bucketAlias]: i,
            [countAlias]: 0
          }
          const bucketMin = labelFormatFn(labelScale(i))
          const bucketMax = labelFormatFn(labelScale(i + 1))
          return {
            ...row,
            bucketRange: `${bucketMin} - ${bucketMax}`,
            recordsLabel: formatNumber(row[countAlias] ?? 0)
          }
        })
        setVegaData({ table: filledResult })
        const newSpec = createBarChartSummarySpec(
          { field: bucketAlias, type: VegaTypeMap.STRING },
          { field: countAlias, type: VegaTypeMap.NUMBER },
          {
            encoding: {
              x: {
                axis: {
                  labelExpr: `datum.value === '0' ? ${JSON.stringify(
                    String(minLabel)
                  )} : ${JSON.stringify(String(maxLabel))}`,
                  values: [0, numBuckets - 1]
                }
              },
              tooltip: [
                {
                  field: "bucketRange",
                  type: VegaTypeMap.STRING,
                  title: "Range"
                },
                {
                  field: "recordsLabel",
                  type: VegaTypeMap.STRING,
                  title: "# Records"
                }
              ]
            }
          },
          theme
        )
        setVegaSpec(newSpec)
      })
      .catch((e: Error) => {
        setError(
          e?.message || e?.error_message || "Error generating summary chart"
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }, [column, percentiles, numBuckets, theme])

  return (
    <div className="sql-notebook-chart-container">
      {(loading || percentileLoading) && (
        <LoaderWithHeight height={VISUALIZATION_HEIGHT} />
      )}
      {(error || percentileError) && (
        <Message
          type={MESSAGE_TYPES.ERROR}
          message={percentileError || error || ""}
        />
      )}
      {vegaSpec && vegaData && (
        <VegaLite
          spec={vegaSpec}
          data={vegaData}
          actions={false}
          theme="dark"
        />
      )}
    </div>
  )
}
