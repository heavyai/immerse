// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { NOT_BE_RENDERED } from "constants/chart-types"

import TableChart from "./table-chart-wrapper"
import TableChartSettings from "./chart-settings"

const tableChartDefinition = {
  type: "table",
  typeAlias: "TABLE",
  typeConstant: "TABLE",
  chartTypeCategories: [NOT_BE_RENDERED],
  labelsIcons: { label: "Table", icon: "chart-table" },
  Component: TableChart,
  iconId: "icon-chart-table",

  IconComponent: function TableIconComponent() {
    return (
      <>
        <path d="M4,44h40V4H4V44z M41,41H7V10h34V41z" />
        <path
          d="M8,34v2h7v4h2v-4h14v4h2v-4h7v-2h-7v-6h7v-2h-7v-6h7v-2h-7v-5h-2v5H17v-5h-2v5H8v2h7v6H8v2h7v6H8z M17,20h14v6H17V20z
           M17,28h14v6H17V28z"
        />
      </>
    )
  },
  ChartSettingsComponent: TableChartSettings,
  defaultColors: { type: "none" },
  dimensionSettings: {
    minDimensions: 0,
    maxDimensions: Infinity,
    dimensions: [],
    minMeasures: 0,
    maxMeasures: Infinity,
    measures: [],
    customColorable: false,
    allowedColorTypes: { none: true },
    defaultColors: { type: "none" }
  },
  initialChartData: {
    zebraStriping: false,
    showNullMeasures: true
  },
  crossfilterOverrides: {
    orderBy: ({
      group,
      chart,
      sortOrder,
      orderingByDimension,
      limit,
      offset,
      renderSpec
    }) => {
      // actually use those arguments to construct a where clause string to return.
      // e.g., `ORDER BY key0 ${sortOrder}`
      const orderByArray = ["ORDER BY"]

      if (group.getOrderExpression()) {
        orderByArray.push(group.getOrderExpression())
        orderByArray.push(sortOrder)
        // Add NULLS LAST to all grouped queries by default, unless ordering by a dimension,
        // to sort null measures to the end of the results regardless of sorting
        if (!orderingByDimension) {
          orderByArray.push("NULLS LAST")
        }
      } else if (group.getGroupBy(renderSpec).length) {
        const groupByArray = group.getGroupBy(renderSpec)
        for (let i = 0; i < groupByArray.length; i += 1) {
          orderByArray.push(
            `${
              chart.dimensions[i].is_dict && !chart.dimensions[i].is_array
                ? `KEY_FOR_STRING(${groupByArray[i]})`
                : groupByArray[i]
            } ${sortOrder}`
          )
          if (!orderingByDimension) {
            orderByArray.push("NULLS LAST")
          }
          if (i !== groupByArray.length - 1) {
            orderByArray.push(",")
          }
        }
      } else {
        const reduceArray = group.getReduceVars().split(",")
        const reduceSize = reduceArray.length
        for (let r = 0; r < reduceSize; r += 1) {
          const measure = chart.measures.find(
            ({ name }) => name === reduceArray[r]
          )
          orderByArray.push(
            `${
              measure?.is_dict && !measure?.is_array
                ? `KEY_FOR_STRING(${reduceArray[r]})`
                : reduceArray[r]
            } ${sortOrder}`
          )
          if (!orderingByDimension) {
            orderByArray.push("NULLS LAST")
          }
          if (r !== reduceSize - 1) {
            orderByArray.push(",")
          }
        }
      }

      if (limit !== Infinity) {
        orderByArray.push("LIMIT")
        orderByArray.push(limit)
      }
      if (offset !== undefined) {
        orderByArray.push("OFFSET")
        orderByArray.push(offset)
      }

      return orderByArray
    }
  },
  visible: true
}

export default tableChartDefinition
