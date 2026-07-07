// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { isEqual as deepEqual } from "lodash"

import { fetchRasterData } from "vega/actions/raster-action-creators"
import { updateChart } from "actions/update-chart-action-creator"
import RasterChartComponent from "./raster-chart-component"
import {
  setCrossFilter,
  setDashboardFilter,
  clearFilterByName
} from "vega/actions/filter-action-creators"
import { pointmapChartToQuerySpec } from "./query-spec"
import { cleanBounds } from "./utils"
import { getFiltersAppliedToChart } from "vega/constants/filter-metadata-types"

import { FILTER_TYPE_BOUNDING_BOX } from "vega/constants/filter-type-constants"

export function mapStateToProps({ charts, omnifilters }, { id }) {
  const chart = charts[id]
  const { data, isLoadingData } = chart

  const appliedFilters = getFiltersAppliedToChart(
    id,
    [chart.dataSource],
    omnifilters,
    true
  )
  const querySpec = pointmapChartToQuerySpec(id, chart, appliedFilters)

  const {
    lonMeasure: { minMax: lonMinMax = [] },
    latMeasure: { minMax: latMinMax = [] }
  } = querySpec

  const layerBBOXfilters = querySpec.appliedFilters.filter(
    (f) => f.chartId === id && f.filter.filterType === FILTER_TYPE_BOUNDING_BOX
  )

  const dataBounds = cleanBounds({
    lonMin: lonMinMax[0],
    lonMax: lonMinMax[1],
    latMin: latMinMax[0],
    latMax: latMinMax[1]
  })

  return {
    chartId: id,

    imageData: data,
    isLoadingData,

    querySpec,
    dataBounds,
    layerBBOXfilters,
    basemap: "mapbox://styles/mapbox/dark-v9"
  }
}

export function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        fetchRasterData,
        setCrossFilter,
        updateChart,
        setDashboardFilter,
        clearFilterByName
      },
      dispatch
    )
  }
}

export function mergeProps(stateProps, dispatchProps, ownProps) {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,

    width: ownProps.chart.width,
    height: ownProps.chart.height
  }
}

export const options = {
  pure: true,

  // I wish I had access to ownProps here so I could compare the actual chart
  areStatesEqual: (next, prev) =>
    next.charts === prev.charts && next.omnifilters === prev.omnifilters,

  areMergedPropsEqual: deepEqual
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
  options
)(RasterChartComponent)
