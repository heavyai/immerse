// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from "react"
import PropTypes from "prop-types"

import { layerDefaultOpacity } from "constants/magic-variables"
import * as RasterChartActions from "charts/raster-chart/raster-chart-actions"

import { chartShape } from "constants/prop-types"

import Toggle from "react-toggle"
import ChartSettingsBasemapDropdownParent from "components/chart-settings-basemap-dropdown/chart-settings-basemap-dropdown-parent"
import RangeSlider from "../../vega/components/RangeSlider/RangeSlider"
import NumericalSlider from "vega/components/NumericalSlider/NumericalSlider"

import { chartSettingsComponents } from "./chart-settings-components"
import DefaultChartSettings from "charts/components/default-chart-settings"
import {
  useOnValueChangeWithShowNulls,
  useOnDimensionValueChangeWithFormat,
  useOnMeasureValueChangeWithFormat,
  useOnValueChangeWithCap
} from "charts/utils/shared-chart-settings-handlers"
import { MASTER_LAYER_SETTINGS } from "charts/raster-chart/raster-chart-consts"
import { layerSupportsMasterSetting } from "charts/raster-chart/raster-utils"
import SettingsPanel from "components/settings-panel"

ChartSettings.propTypes = {
  chart: chartShape.isRequired,
  id: PropTypes.string.isRequired,
  isPolyRasterEnabled: PropTypes.bool,
  multiSourceIndex: PropTypes.string,
  onUnlockTopN: PropTypes.func,
  selectedMultiSourcePanel: PropTypes.number,
  updateChart: PropTypes.func.isRequired
}

export function ChartSettings(props) {
  const { id, dispatch, updateChart } = props

  const onValueChangeWithShowNulls = useOnValueChangeWithShowNulls(
    id,
    updateChart,
    props.chart.showNullDimensions
  )
  const onMeasureValueChangeWithFormat = useOnMeasureValueChangeWithFormat(
    id,
    dispatch
  )
  const onDimensionValueChangeWithFormat = useOnDimensionValueChangeWithFormat(
    id,
    dispatch
  )
  const onValueChangeWithCap = useOnValueChangeWithCap(id, updateChart)

  const onValueChangeWithLayerVisibility = useCallback(
    (layerId) => (value) => {
      dispatch(
        RasterChartActions.setLayerZoomThreshold(
          id,
          layerId,
          value[0],
          value[1]
        )
      )
      dispatch(RasterChartActions.checkLayerVisibility(id, layerId))
    },
    [id, dispatch]
  )

  const onValueChangeWithLayerOpacity = useCallback(
    (layerId) => (value) => {
      dispatch(
        RasterChartActions.setLayerOpacity(
          id,
          layerId,
          (value / 100).toFixed(2)
        )
      )
    },
    [id, dispatch]
  )

  // TODO: make this work with deckgl charts
  if (
    props.chart.currentLayer === "master" &&
    !props.chart.type.startsWith("deckgl")
  ) {
    const currentMapZoomLevel = props.chart.mapZoomCenter?.zoom ?? null
    return (
      <div>
        {currentMapZoomLevel && (
          <>
            <div className="chart-editor-section map-themes">
              <div className="chart-editor-label">{"Map Theme"}</div>
              <ChartSettingsBasemapDropdownParent chartId={props.id} />
            </div>
            <div className="chart-editor-map-zoom">
              {`Current zoom level: ${currentMapZoomLevel.toFixed(2)}`}
            </div>
          </>
        )}
        {props.chart.layers.map((layer, i) => (
          <SettingsPanel panelTitle={`Layer ${i + 1}`} key={i}>
            {layerSupportsMasterSetting(
              layer.type,
              MASTER_LAYER_SETTINGS.OPACITY
            ) && (
              <NumericalSlider
                label={`Opacity`}
                value={
                  (typeof layer.opacity === "undefined"
                    ? layerDefaultOpacity(layer.type)
                    : layer.opacity) * 100
                }
                max={100}
                min={0}
                step={1}
                onChange={onValueChangeWithLayerOpacity(i)}
                testId={`layer-${i}-opacity`}
              />
            )}
            {layerSupportsMasterSetting(
              layer.type,
              MASTER_LAYER_SETTINGS.ZOOM_VISIBILITY
            ) && (
              <RangeSlider
                label={`Visible zoom levels`}
                max={22}
                min={0}
                step={1}
                textInputStep={"any"}
                value={[
                  layer.zoomMinThreshold || 0,
                  layer.zoomMaxThreshold || 22
                ]}
                onChange={onValueChangeWithLayerVisibility(i)}
                testId={`layer-${i}-zoom-visibility`}
              />
            )}
          </SettingsPanel>
        ))}
      </div>
    )
  }

  const ChartSettingsComponent =
    chartSettingsComponents[props.chart.type] || DefaultChartSettings

  return (
    <ChartSettingsComponent
      {...props}
      onValueChangeWithShowNulls={onValueChangeWithShowNulls}
      onValueChangeWithCap={onValueChangeWithCap}
      onMeasureValueChangeWithFormat={onMeasureValueChangeWithFormat}
      onDimensionValueChangeWithFormat={onDimensionValueChangeWithFormat}
    />
  )
}

export default ChartSettings

type NullToggleProps = {
  checked: boolean
  onChange: () => void
  label?: string
  id?: string
}

export function NullToggle({
  checked,
  onChange,
  label = "Null Dimensions",
  id = "null-dimension-toggle"
}: NullToggleProps) {
  return (
    <div className="chart-editor-section">
      <div className="chart-editor-label">{label}</div>
      <Toggle checked={checked} id={id} onChange={onChange} />
    </div>
  )
}
