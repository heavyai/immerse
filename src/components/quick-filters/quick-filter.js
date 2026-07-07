// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect, batch } from "react-redux"
import { debounce } from "lodash"
import {
  updateFilterByName,
  toggleQuickFilterVisibility,
  setQuickFilterOption,
  toggleFilterByName
} from "vega/actions/filter-action-creators"
import {
  getDistinctColumnValues,
  clearDistinctColumnValues
} from "actions/column-values-action-creators"
import { toggleQuickFiltersExpanded } from "actions/charts-action-creators"
import { simpleFilter } from "vega/constants/filter-types"
import { QuickFilterNotch } from "components/quick-filters/quick-filter-notch"
import { isRasterChart } from "charts/raster-chart/raster-utils"

const mapStateToProps = (
  { charts, columnValues, dashboard: { dataSources } },
  { chartId }
) => {
  const { quickFiltersExpanded, type } = charts[chartId]

  const overlayNotch = isRasterChart(type)

  return {
    dataSources,
    columnValuesByDataSource: columnValues,
    quickFiltersExpanded:
      quickFiltersExpanded === undefined ? true : quickFiltersExpanded,
    overlayNotch
  }
}

const mapDispatchToProps = (dispatch) => ({
  toggleFilterByName: (name, enabled) =>
    dispatch(toggleFilterByName(name, enabled)),
  // Ok. This sets the visibility of the top level enabled filter.
  toggleQuickFilterVisibility: (name) => {
    dispatch(toggleQuickFilterVisibility(name))
  },
  batchToggleQuickFilterVisibility: (names, visible) => {
    batch(() =>
      names.forEach((name) =>
        dispatch(toggleQuickFilterVisibility(name, visible))
      )
    )
  },
  getDistinctColumnValues: debounce(({ filter }, searchTerm) => {
    dispatch(
      getDistinctColumnValues({
        dataSource: filter.dataSource,
        column: filter.dataExpression,
        searchTerm,
        excludeNulls: true
      })
    )
  }, 100),
  updateFilterValue: async (
    { name, filter: { table, dataSource, dataExpression, dataType } },
    newValue
  ) => {
    const newFilter = simpleFilter(
      table,
      dataSource,
      dataExpression,
      dataType,
      "=",
      newValue
    )
    await dispatch(updateFilterByName(name, newFilter))
    await dispatch(toggleFilterByName(name, true))
  },
  setQuickFilterOption: (name, value) =>
    dispatch(setQuickFilterOption(name, value)),
  clearDistinctColumnValues: (dataSource, column) => {
    dispatch(clearDistinctColumnValues(dataSource, column))
  },
  toggleQuickFiltersExpanded: (chartId) => () => {
    dispatch(toggleQuickFiltersExpanded(chartId))
  }
})

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...ownProps,
  ...stateProps,
  ...dispatchProps,
  toggleQuickFiltersExpanded: dispatchProps.toggleQuickFiltersExpanded(
    ownProps.chartId
  ),
  enabledFilters: ownProps.quickFiltersForChart
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(QuickFilterNotch)
