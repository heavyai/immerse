// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  createSortByOptions,
  setCorrectOrderingValue
} from "./chart-settings-sort-by-helpers"
import { lensPath, lensProp, set } from "ramda"
import ChartSettingsSortByDropdown from "./chart-settings-sort-by-dropdown"
import { connect } from "react-redux"
import { updateChart } from "actions/update-chart-action-creator"

export function mapStateToProps({ charts }, { chartId }) {
  return {
    error: charts[chartId].hasError === "sort",
    currentSortValue: charts[chartId].sortColumn,
    currentOrderingValue: charts[chartId].sortColumn?.order
  }
}

export function mapDispatchToProps(dispatch, { chartId, sortColumn }) {
  return {
    updateOrderingValue(updatedSortColumn) {
      return () =>
        dispatch(updateChart(chartId, { sortColumn: updatedSortColumn }))
    },
    updateSortByValue(sortColName, option) {
      const order = option.type === "A-Z" ? "asc" : "desc"
      const withOrder = set(lensProp("order"), order, sortColumn)
      const updatedSortColumn = set(
        lensPath(["col", "name"]),
        sortColName,
        withOrder
      )
      updatedSortColumn.label = option.label
      dispatch(updateChart(chartId, { sortColumn: updatedSortColumn }))
    }
  }
}

export function mergeProps(
  currentProps,
  updateProps,
  { measures, dimensions }
) {
  const { currentSortValue, currentOrderingValue, error } = currentProps
  const { updateSortByValue, updateOrderingValue } = updateProps

  const options = createSortByOptions(dimensions, measures)
  return {
    error,
    options,
    updateSortByValue,
    updateOrderingValue: updateOrderingValue(
      setCorrectOrderingValue(currentSortValue)
    ),
    currentSortValue,
    currentOrderingValue
  }
}

const ConnectedChartSettingsSortByDropdownParent = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(ChartSettingsSortByDropdown)

export default ConnectedChartSettingsSortByDropdownParent
