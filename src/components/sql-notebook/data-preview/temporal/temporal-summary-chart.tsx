// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useMemo, useState } from "react"

import { VegaLite } from "react-vega"
import { ColumnMetadata } from "constants/prop-types"
import Services from "services/immerse"
import { VegaTypeMap } from "../../types"

import { LoaderWithHeight } from "../loader-with-height"
import { MESSAGE_TYPES, Message } from "components/message/message"
import {
  bestTimeStep,
  createBarChartSummarySpec,
  getTemporalDistributionQuery
} from "../utils"
import { formatNumber } from "charts/utils/coordinate-helpers"
import { useTemporalStats } from "components/sql-notebook/hooks/useTemporalStats"

import "./temporal-summary-chart.scss"
import { WARNING_RANGE } from "../colors"
import moment from "moment"
import {
  isThemeDark,
  useImmerseUITheme
} from "utils/theme/use-immerse-ui-theme"

const countAlias = "bucketCount"
const bucketAlias = "bucketName"

export const TemporalSummaryChart = ({
  column
}: {
  column: ColumnMetadata
}) => {
  const [vegaData, setVegaData] = useState<{ table: Array<any> }>({ table: [] })
  const [vegaSpec, setVegaSpec] = useState(null)
  const [stats, statsLoading, statsError] = useTemporalStats(column)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [min, max] = stats.map((stat) => stat.value)
  const { theme } = useImmerseUITheme()

  const timeStep = useMemo(() => {
    if (stats?.length) {
      return bestTimeStep(min, max)
    }
    return null
  }, [stats, min, max])

  useEffect(() => {
    setError(null)
    if (!stats?.length || !timeStep) {
      return
    }

    const query = getTemporalDistributionQuery(column, min, max, timeStep, {
      countAlias,
      bucketAlias
    })
    const dbCon = Services.get("DbCon")
    setLoading(true)
    // Precompute axis + tooltip labels (pipe `|` becomes a newline via
    // config.lineBreak below).
    const axisFormat = "YYYY-MM-DD[|]HH:mm"
    const tooltipFormat = "YYYY-MM-DD HH:mm"
    const minLabel = moment(min).format(axisFormat)
    const maxLabel = moment(max).format(axisFormat)
    dbCon
      .queryAsync(query)
      .then((result: Array<any>) => {
        const enrichedResult = result.map((row) => {
          const start = moment(row[bucketAlias])
          const end = start.clone().add(1, `${timeStep}s` as moment.unitOfTime.DurationConstructor)
          return {
            ...row,
            bucketRange: `${start.format(tooltipFormat)} – ${end.format(
              tooltipFormat
            )}`,
            recordsLabel: formatNumber(row[countAlias] ?? 0)
          }
        })
        setVegaData({ table: enrichedResult })
        const firstValue = result[0][bucketAlias].toString()
        const lastValue = result[result.length - 1][bucketAlias].toString()
        const newSpec = createBarChartSummarySpec(
          { field: bucketAlias, type: VegaTypeMap.STRING },
          { field: countAlias, type: VegaTypeMap.NUMBER },
          {
            encoding: {
              x: {
                axis: {
                  labelExpr: `datum.value === ${JSON.stringify(
                    firstValue
                  )} ? ${JSON.stringify(minLabel)} : ${JSON.stringify(
                    maxLabel
                  )}`,
                  values: [firstValue, lastValue]
                }
              },
              color: {
                scale: {
                  range: isThemeDark(theme)
                    ? [...WARNING_RANGE].reverse()
                    : [...WARNING_RANGE]
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
  }, [column, max, min, stats, timeStep, theme])

  return (
    <div className="sql-notebook-chart-container">
      {(loading || statsLoading) && <LoaderWithHeight height={200} />}
      {(error || statsError) && (
        <Message type={MESSAGE_TYPES.ERROR} message={statsError || error} />
      )}
      {vegaSpec && vegaData && (
        <VegaLite
          spec={vegaSpec}
          data={vegaData}
          actions={false}
          theme="dark"
          config={{
            lineBreak: "|"
          }}
        />
      )}
    </div>
  )
}
