// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  isDateType,
  isGeo,
  isNumerical,
  isOrdinal,
  isTimeType
} from "constants/data-types"
import { ColumnMetadata } from "constants/prop-types"
import { SECONDARY_RANGE } from "./colors"
import { merge } from "lodash"
import { formatNumber } from "charts/utils/coordinate-helpers"
import moment, { Moment } from "moment"
import { isThemeDarkOrCustom } from "utils/theme/use-immerse-ui-theme"
import { ImmerseUITheme } from "utils/theme/types"

export enum ROLLUP_COLUMN_TYPES {
  NUMERIC = "Numeric",
  CATEGORICAL = "Categorical",
  DATETIME = "Date/Time",
  GEOSPATIAL = "Geospatial"
}

export const STAT_ROW_HEIGHT = 55
export const VISUALIZATION_HEIGHT = 200

export const getRollupType = (type: string) => {
  if (isNumerical(type)) {
    return ROLLUP_COLUMN_TYPES.NUMERIC
  } else if (isOrdinal(type)) {
    return ROLLUP_COLUMN_TYPES.CATEGORICAL
  } else if (isDateType(type) || isTimeType(type)) {
    return ROLLUP_COLUMN_TYPES.DATETIME
  } else if (isGeo(type)) {
    return ROLLUP_COLUMN_TYPES.GEOSPATIAL
  } else {
    return null
  }
}

export const DEFAULT_NUM_BUCKETS = 20

export const getNumericDistributionQuery = (
  column: ColumnMetadata,
  min: number,
  max: number,
  numBuckets = DEFAULT_NUM_BUCKETS,
  opts: {
    countAlias?: string
    bucketAlias?: string
  } = {}
) => {
  const { countAlias = "bucketCount", bucketAlias = "bucketNumber" } = opts

  return `
      SELECT
        count(*) AS ${countAlias},
        CASE
          WHEN ${column.value} >= ${max} THEN ${numBuckets - 1}
          ELSE WIDTH_BUCKET(${column.value}, ${min}, ${max}, ${numBuckets})
        END - 1 AS ${bucketAlias}
      FROM
        ${column.table}
      WHERE
        (
          "${column.table}"."${column.value}" IS NOT NULL
          AND "${column.table}"."${column.value}" >= ${min}
          AND "${column.table}"."${column.value}" <= ${max}
        )
      GROUP BY
        ${bucketAlias}
      HAVING
        (
          (
            ${bucketAlias} >= 0
            AND ${bucketAlias} < ${numBuckets}
          )
          OR ${bucketAlias} IS NULL
        )
      ORDER BY
        ${bucketAlias} asc NULLS LAST
    `
}

export const createCategoricalSummarySpec = (
  x: { field: string; type: string },
  y: { field: string; type: string },
  theme: ImmerseUITheme
) => {
  const { field: yField, type: yType } = y
  const { field: xField, type: xType } = x
  return {
    width: "container",
    height: "container",
    data: { name: "table" },
    layer: [
      {
        mark: { type: "bar", width: { band: 0.99 } },
        encoding: {
          x: {
            field: xField,
            type: xType,
            axis: {
              labelAngle: 0,
              ticks: false,
              grid: false,
              labels: false
            }
          },
          y: {
            field: yField,
            type: yType,
            sort: "-x",
            axis: {
              title: false,
              ticks: false,
              grid: false,
              labelPadding: 10,
              domain: false,
              labelColor: isThemeDarkOrCustom(theme) ? "#FFFFFF" : "#000000"
            }
          },
          color: {
            field: xField,
            type: xType,
            scale: {
              range: isThemeDarkOrCustom(theme)
                ? [...SECONDARY_RANGE]
                : [...SECONDARY_RANGE].reverse()
            }
          }
        }
      },
      {
        mark: { type: "text", style: "label" },
        encoding: {
          y: {
            field: yField,
            type: yType,
            sort: "-x"
          },
          x: {
            field: xField,
            type: xType
          },
          text: {
            field: xField,
            type: xType,
            format: ","
          }
        }
      }
    ],
    config: {
      background: "transparent",
      style: {
        label: {
          align: "left",
          baseline: "middle",
          color: "#888888",
          fontWeight: 800,
          dx: 3
        }
      },
      legend: {
        disable: true
      },
      view: {
        stroke: null
      },
      axisX: {
        title: null,
        domain: false
      }
    }
  }
}
export const getTemporalDistributionQuery = (
  column: ColumnMetadata,
  min: Date,
  max: Date,
  timeStep = "hour",
  opts: {
    countAlias?: string
    bucketAlias?: string
  } = {}
) => {
  const { countAlias, bucketAlias } = opts
  return `SELECT
    count(*) AS ${countAlias},
    date_trunc(${timeStep}, ${column.value}) AS ${bucketAlias}
  FROM
    ${column.table}
  WHERE
    (
      "${column.table}"."${column.value}" IS NOT NULL
      AND "${column.table}"."${column.value}" >= '${min.toISOString()}'
      AND "${column.table}"."${column.value}" <= '${max.toISOString()}'
    )
  GROUP BY
    ${bucketAlias}
  ORDER BY
    ${bucketAlias} asc NULLS LAST`
}

export const createBarChartSummarySpec = (
  x: { field: string; type: string },
  y: { field: string; type: string },
  overrides: object,
  theme: ImmerseUITheme
) => {
  const { field: yField, type: yType } = y
  const { field: xField, type: xType } = x
  return merge(
    {
      width: "container",
      height: "container",
      mark: { type: "bar", width: { band: 0.99 } },
      data: { name: "table" },
      encoding: {
        x: {
          field: xField,
          type: xType,
          axis: {
            ticks: false,
            labelAngle: 0,
            labelColor: isThemeDarkOrCustom(theme) ? "#FFFFFF" : "#000000"
          }
        },
        y: {
          field: yField,
          type: yType,
          axis: null
        },
        color: {
          field: yField,
          type: yType,
          scale: {
            range: isThemeDarkOrCustom(theme)
              ? [...SECONDARY_RANGE]
              : [...SECONDARY_RANGE].reverse()
          }
        },
        tooltip: [
          { field: xField, type: xType },
          { field: yField, type: yType }
        ]
      },
      config: {
        background: "transparent",
        legend: {
          disable: true
        },
        view: {
          stroke: null
        },
        axisX: {
          title: null,
          domain: false
        }
      }
    },
    overrides
  )
}

export const bestTimeStep = (min: Date, max: Date) => {
  const timeDiff = max.getTime() - min.getTime()
  const second = timeDiff / 1000
  const minute = second / 60
  const hour = minute / 60
  const day = hour / 24
  const week = day / 7
  const month = day / 30
  const quarter = day / 90
  const year = day / 365

  const diffs = {
    year,
    quarter,
    month,
    week,
    day,
    hour,
    minute,
    second
  }
  // Get the one where we'll have > 10 buckets
  // otherwise choose smallest available
  return (
    Object.entries(diffs).find(([_, quantity]) => {
      return quantity > 10
    })?.[0] ?? "second"
  )
}

export const getTemporalTooltip = (
  start: Date | Moment,
  end: Date | Moment,
  count: number
) => {
  return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
          <div>
            <div>
              ${moment(start).format("YYYY-MM-DD")}
            </div>
            <div>
              ${moment(start).format("HH:mm")}
            </div>
          </div> 
          <div>-</div>
          <div>
            <div>
              ${moment(end).format("YYYY-MM-DD")}
            </div>
            <div>
              ${moment(end).format(" HH:mm")}
            </div>
          </div>
        </div>
        <div>
          # Records: ${formatNumber(count)}
        </div>
      </div>
    `
}

export const getCategoricalSummaryQuery = (
  column: ColumnMetadata,
  numBuckets = 10,
  opts: {
    countAlias?: string
    bucketAlias?: string
  } = {}
) => {
  const { countAlias = "bucketCount", bucketAlias = "bucketNumber" } = opts
  return `
    SELECT
      count(*) AS '${countAlias}',
      ${column.value} AS '${bucketAlias}'
    FROM
      ${column.table}
    WHERE 
      ${column.value} IS NOT NULL
    GROUP BY
      ${bucketAlias}
    ORDER BY
      ${countAlias} desc NULLS LAST
    LIMIT
      ${numBuckets}
    `
}

export const getNumberFormatter = (min = 0, max = 1, numBuckets: number) => {
  return (v: number) => {
    const diff = max - min
    if (diff < numBuckets) {
      return v.toFixed(2)
    } else if (diff > 10000) {
      // Will truncate/add si units
      return formatNumber(v)
    } else {
      const scale = d3.scale.linear().domain([0, numBuckets]).range([min, max])
      return scale.tickFormat()(v)
    }
  }
}
