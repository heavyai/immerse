// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import ChartSettingsBasemapDropdown from "./chart-settings-basemap-dropdown"
import compose from "recompose/compose"
import { connect } from "react-redux"
import { updateRasterChart } from "charts/raster-chart/raster-chart-actions"
import { updateChart } from "actions/update-chart-action-creator"
import withHandlers from "recompose/withHandlers"
import withState from "recompose/withState"
import {
  getAvailableBasemapsForChart,
  getDefaultBasemap,
  validBasemap
} from "charts/raster-chart/basemap"

const eventHandlers = {
  onOptionHover: (props) => (_index, item) => {
    props.setPreview(() => item)
  },
  onOptionOut: (props) => () => {
    props.setPreview(() => props.basemap)
  }
}

export function mapStateToProps({ charts }, { chartId }) {
  const chart = charts[chartId]
  return {
    chartId,
    options: getAvailableBasemapsForChart(chart),
    basemap: chart && validBasemap(chart) ? chart.basemap : getDefaultBasemap()
  }
}

export function mapDispatchToProps(dispatch, { chartId, chartType }) {
  return {
    updateBasemap(value, option) {
      if (chartType === "choropleth") {
        dispatch(updateChart(chartId, { basemap: option }))
      } else {
        dispatch(updateRasterChart(chartId, { basemap: option }))
      }
    }
  }
}

export function mergeProps(
  { chartId, options, basemap, mapboxCustomStyles, offline },
  { updateBasemap }
) {
  return {
    chartId,
    options,
    basemap,
    mapboxCustomStyles,
    updateBasemap,
    offline
  }
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps, mergeProps),
  withState(
    "preview",
    "setPreview",
    (props) => props.basemap || getDefaultBasemap()
  ),
  withHandlers(eventHandlers)
)(ChartSettingsBasemapDropdown)
