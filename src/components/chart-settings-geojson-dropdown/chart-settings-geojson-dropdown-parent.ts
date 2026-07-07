// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import compose from "recompose/compose"
import setPropTypes from "recompose/setPropTypes"
import PropTypes from "prop-types"

import {
  selectJoinDataSource,
  clearJoinDataSource
} from "actions/data-source-action-creators"
import { updateChart } from "actions/update-chart-action-creator"
import { updateGeoJoinColumn } from "charts/raster-chart/raster-chart-actions"
import { isGeo } from "vega/constants/data-selection-types"

import ChartSettingsGeoJsonDropdown from "./chart-settings-geojson-dropdown"
import { toParameterSyntax } from "utils/parameters"

const propTypes = {
  chartId: PropTypes.string.isRequired
}

export const geoJsonDataSourceFilterFcn = (table: TTableMeta): boolean =>
  table.col_types.some(isGeo)

export function mapStateToProps(
  { charts, connection, dashboard: { joinTable = {} }, joinDataSources },
  { chartId }
) {
  const chart = charts[chartId]
  const currentGeoJsonValue = chart.geoJson
  const currentJoinCol = chart.geoJoin ? chart.geoJoin.column : null
  const chartType = chart.type
  const options =
    chartType === "backendChoropleth" || chartType === "linemap"
      ? joinTable.columnMetadata
      : createSortByOptions(connection.geoJsonConfig)
  const defaultValue = connection.isPolyRasterEnabled
    ? currentJoinCol && { value: currentJoinCol, label: currentJoinCol }
    : setDefaultValue(connection.geoJsonConfig, currentGeoJsonValue)
  const dataSourceFilterFunc =
    (chartType === "backendChoropleth" && connection.isPolyRasterEnabled) ||
    chartType === "linemap"
      ? geoJsonDataSourceFilterFcn
      : null

  const isJoinDataSource = joinDataSources.find(
    (jds) => toParameterSyntax(jds.parameter) === chart.dataSource
  )
  let isDisabled = false
  let disabledTooltip = null
  if (isJoinDataSource) {
    isDisabled = true
    disabledTooltip = "Geo join is not supported with join datasets"
  }
  return {
    isPolyRasterEnabled: connection.isPolyRasterEnabled,
    defaultValue,
    options,
    geoJoin: charts[chartId].geoJoin || {},
    chartType,
    dataSourceFilterFunc,
    isDisabled,
    disabledTooltip
  }
}

export function setDefaultValue(geoJsonConfig, currentGeoJsonValue) {
  return createSortByOptions(geoJsonConfig).filter(
    (o) => o.value === currentGeoJsonValue
  )[0]
}

export function createSortByOptions(geoJsonConfig) {
  return Object.keys(geoJsonConfig).map((value) => ({
    value,
    label: geoJsonConfig[value].label
  }))
}

export function mapDispatchToProps(dispatch, { chartId }) {
  return {
    updateGeoJsonValue(e) {
      const value = e ? e.value : null
      dispatch(updateChart(chartId, { geoJson: value }))
    },
    selectJoinDataSource(table) {
      dispatch(selectJoinDataSource(chartId, table))
    },
    updateGeoJoinValue(e) {
      const value = e ? e.value : null
      dispatch(updateGeoJoinColumn(chartId, value))
    },
    clearJoinDataSource() {
      dispatch(updateGeoJoinColumn(chartId, null))
      dispatch(clearJoinDataSource(chartId))
    }
  }
}

export default compose(
  setPropTypes(propTypes),
  connect(mapStateToProps, mapDispatchToProps)
)(ChartSettingsGeoJsonDropdown)
