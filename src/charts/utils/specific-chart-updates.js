// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import composeMeasures from "charts/utils/compose-measures"
import { createProjectMeasures, isSortColumnPresent } from "utils/helpers"
import { mapBinnedDimensions } from "utils/map-binned-dimensions"
import { isEmpty } from "ramda"

export default {
  dimensions(chart, diff) {
    const allBinParams = mapBinnedDimensions(diff.dimensions)
    chart.binParams(allBinParams)
    chart.expireCache()
  },

  measures(chart, diff, chartSpec) {
    let measures = composeMeasures(
      chart.dimension(),
      diff.measures,
      chartSpec.type,
      chartSpec
    )

    if (!chartSpec.dimensions.length) {
      chart.dimension().projectOn(createProjectMeasures(diff.measures))

      measures = () => 0
    }

    chart.group(measures)

    if (chart.group().order && chartSpec.sortColumn) {
      const {
        sortColumn: {
          col: { name: sortColumnName } = {},
          label: sortColumnLabel
        } = {}
      } = chartSpec

      if (
        isSortColumnPresent(
          sortColumnLabel,
          chartSpec.dimensions,
          chartSpec.measures
        )
      ) {
        chart.group().order(sortColumnName)
      }
    }

    const allBinParams = mapBinnedDimensions(chartSpec.dimensions)
    chart.binParams(allBinParams)
  },

  ticks(chart, diff) {
    chart.xAxis().ticks(diff.ticks)
  },

  sortColumn(chart, colInfo, { dimensions, measures }) {
    chart.expireCache()

    // Only sort if sortColumn is defined and non-empty
    if (colInfo.sortColumn && !isEmpty(colInfo.sortColumn)) {
      const {
        sortColumn: {
          col: { name: sortColumnName } = {},
          label: sortColumnLabel,
          order
        } = {}
      } = colInfo

      // "countval", corresponding to # records, is always present as an option
      const shouldUpdateSortColumn =
        sortColumnName === "countval" ||
        isSortColumnPresent(sortColumnLabel, dimensions, measures)

      if (chart.group().order && shouldUpdateSortColumn) {
        chart.group().order(sortColumnName)
      }

      chart.ordering(order)
    } else {
      // If sortColumn is undefined or empty, sort by undefined to remove chart sorting
      chart.ordering(undefined)
    }
  },

  ordering(chart, diff) {
    chart.ordering(diff.sortColumn.order)
  },

  color() {
    return
  },

  colorDomain(chart, diff) {
    if (diff.colorDomain) {
      chart.colorDomain(diff.colorDomain)
    }
  },

  filters(chart, { filters }) {
    if (!filters.length) {
      chart.filterAll()
    }
  },

  rangeFilter(chart, { rangeFilter }) {
    if (!rangeFilter.length && typeof chart.rangeChart === "function") {
      chart.rangeChart().filterAll()
    }
  },

  renderTableBorders(chart, { renderTableBorders }) {
    chart.borders(renderTableBorders)
  }
}
