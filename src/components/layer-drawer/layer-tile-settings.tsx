// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { useDispatch } from "react-redux"
import cx from "classnames"

import * as RasterChartActions from "charts/raster-chart/raster-chart-actions"
import { MASTER_LAYER_SETTINGS } from "charts/raster-chart/raster-chart-consts"
import { layerSupportsMasterSetting } from "charts/raster-chart/raster-utils"
import { layerDefaultOpacity } from "constants/magic-variables"
import { LayerState } from "charts/raster-chart/raster-chart-types"

import RangeSlider from "vega/components/RangeSlider/RangeSlider"
import NumericalSlider from "vega/components/NumericalSlider/NumericalSlider"

interface ILayerTileSettingsProps {
  isExpanded: boolean
  chartId: number
  layer: LayerState
  index: number
}

export const LayerTileSettings: React.FC<ILayerTileSettingsProps> = ({
  isExpanded,
  chartId,
  layer,
  index
}) => {
  const dispatch = useDispatch()

  const onValueChangeWithLayerVisibility = (layerId: number) => (
    value: number[]
  ) => {
    dispatch(
      RasterChartActions.setLayerZoomThreshold(
        chartId,
        layerId,
        value[0],
        value[1]
      )
    )
    dispatch(RasterChartActions.checkLayerVisibility(chartId, layerId))
  }

  const onValueChangeWithLayerOpacity = (layerId: number) => (
    value: number
  ) => {
    dispatch(
      RasterChartActions.setLayerOpacity(
        chartId,
        layerId,
        (value / 100).toFixed(2)
      )
    )
  }

  return (
    <div
      className={cx("layer-tile-settings", {
        expanded: isExpanded
      })}
    >
      {layerSupportsMasterSetting(
        layer.type,
        MASTER_LAYER_SETTINGS.OPACITY
      ) && (
        <NumericalSlider
          label="Opacity"
          value={
            (typeof layer.opacity === "undefined"
              ? layerDefaultOpacity(layer.type)
              : layer.opacity) * 100
          }
          max={100}
          min={0}
          step={1}
          onChange={onValueChangeWithLayerOpacity(index)}
          testId={`layer-${index}-opacity`}
        />
      )}

      {layerSupportsMasterSetting(
        layer.type,
        MASTER_LAYER_SETTINGS.ZOOM_VISIBILITY
      ) && (
        <RangeSlider
          label="Visible zoom levels"
          max={22}
          min={0}
          step={1}
          textInputStep="any"
          value={[layer.zoomMinThreshold || 0, layer.zoomMaxThreshold || 22]}
          onChange={onValueChangeWithLayerVisibility(index)}
          testId={`layer-${index}-zoom-visibility`}
        />
      )}
    </div>
  )
}
