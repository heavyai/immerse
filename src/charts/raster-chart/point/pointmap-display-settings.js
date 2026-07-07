// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as RasterChartActions from "charts/raster-chart/raster-chart-actions"
import {
  DEFAULT_POINT_MARK_SHAPE,
  DEFAULT_POINT_ORIENTATION_MARK_SHAPE,
  SIZE_RANGE_DEFAULTS,
  SIZE_RANGE_MAX,
  layerDefaultOpacity
} from "constants/magic-variables"
import React from "react"
import PropTypes from "prop-types"
import { CHARTS } from "constants/charts"
import { CHART_TYPES } from "constants/chart-types"
import { COLOR_PALETTE_TYPES } from "constants/colors"
import ChartSettingsBasemapDropdownParent from "components/chart-settings-basemap-dropdown/chart-settings-basemap-dropdown-parent"
import { chartShape } from "constants/prop-types"
import ColorPickerParent from "components/color-picker/color-picker-parent"
import { connect } from "react-redux"
import CustomSlider from "components/custom-slider/custom-slider"
import HoverSelector from "components/hover-selector/hover-selector"
import { isSelectorUsable } from "utils/selector-helpers"
import MarkShapeSelector from "components/mark-shape-selector/mark-shape-selector"
import Toggle from "react-toggle"
import { Switch } from "widgets/switch/Switch"
import PriorityColorSelector from "./priority-color-selector"
import ColorRampParent from "components/color-ramp/color-ramp-parent"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { PaletteMappingSelector } from "components/shared-settings/palette-mapping/palette-mapping-selector"
import { useSharedSettingsEnabled } from "hooks/useSharedSettingsEnabled"
import { SELECTOR_ASSIGNMENTS } from "constants/selectors"
import { ScaleTypeSelector } from "components/scale-type-selector/scale-type-selector"
import { SCALE_TYPES } from "constants/scale-types"
import { updateHideOther } from "actions/charts-color-action-creators"

PointmapDisplaySettings.propTypes = {
  chart: chartShape.isRequired,
  id: PropTypes.string.isRequired,
  measuresWithNumberFormat: PropTypes.array,
  onValueChangeWithAutoSize: PropTypes.func.isRequired,
  onValueChangeWithCap: PropTypes.func.isRequired,
  onValueChangeWithDensityAccumulatorEnabled: PropTypes.func.isRequired,
  onValueChangeWithMarkShape: PropTypes.func.isRequired,
  onValueChangeWithSizeRange: PropTypes.func.isRequired,
  onValueChangeWithLayerOpacity: PropTypes.func.isRequired,
  onValueChangeWithFullColorHashing: PropTypes.func.isRequired,
  onTogglePopup: PropTypes.func.isRequired,
  onSetPrioritizedColorCategory: PropTypes.func.isRequired
}

const colorScheme = [
  "#115f9a",
  "#1984c5",
  "#22a7f0",
  "#48b5c4",
  "#76c68f",
  "#a6d75b",
  "#c9e52f",
  "#d0ee11",
  "#d0f400"
]

const { COLOR, ORIENTATION } = SELECTOR_ASSIGNMENTS

export function PointmapDisplaySettings(props) {
  const {
    chart: {
      dimensions,
      measures,
      sizeDomain,
      sizeRange,
      autoSize,
      type,
      densityAccumulatorEnabled,
      popupEnabled,
      color,
      fullColorHashing
    }
  } = props
  const sizeMeasureSet =
    typeof measures[2]?.value !== "undefined" && !measures[2].isError
  const minMax = measures[2]?.minMax
  const colorMeasure = measures.find((measure) => measure?.name === COLOR)
  const isColorMeasureActive = Boolean(colorMeasure?.value)
  const isGrouped = dimensions.filter(isSelectorUsable).length
  const hasOrientation = measures[4] // Orientation measure is added in new charts, so old charts don't have it
    ? isSelectorUsable(measures.find((m) => m?.name === ORIENTATION))
    : false
  const sharedSettingsEnabled = useSharedSettingsEnabled()

  return (
    <div>
      {type === CHART_TYPES.POINTMAP && (
        <div className="chart-editor-section map-themes">
          <div className="chart-editor-label">{"Map Theme"}</div>
          <ChartSettingsBasemapDropdownParent chartId={props.id} />
        </div>
      )}
      <div>
        <div className="chart-editor-section num-groups pointmap-num-points">
          <div className="chart-editor-label">{"# of Points"}</div>
          <CustomSlider
            defaultValue={props.chart.cap}
            testid={"point-number"}
            max={CHARTS.pointmap.capMax}
            min={CHARTS.pointmap.capMin}
            onValueChange={props.onValueChangeWithCap}
            step={1}
          />
        </div>
        <div className="chart-editor-section opacity-slider">
          <div className="chart-editor-label">{"Layer Opacity"}</div>
          <CustomSlider
            defaultValue={
              (typeof props.chart.opacity === "undefined"
                ? layerDefaultOpacity(props.chart.type)
                : props.chart.opacity) * 100
            }
            testid={"layer-opacity"}
            max={100}
            min={0}
            onValueChange={props.onValueChangeWithLayerOpacity}
            step={1}
          />
        </div>
        {type === CHART_TYPES.BACKEND_SCATTER && (
          <div className="chart-editor-section">
            <div className="chart-editor-label">{"Scale Type"}</div>
            <ScaleTypeSelector
              currentScale={props.chart.scaleType ?? SCALE_TYPES.LINEAR}
              onChange={props.onValueChangeWithScaleType}
            />
          </div>
        )}
        {sizeMeasureSet && (
          <div className="chart-editor-section size-domain">
            <div className="chart-editor-label">{"Size Domain"}</div>
            <CustomSlider
              allowCross
              defaultValue={sizeDomain || minMax}
              testid={"size-domain"}
              max={minMax && minMax[1]}
              min={minMax && minMax[0]}
              onValueChange={props.onValueChangeWithSizeDomain}
              range
              step={1}
              values={sizeDomain || minMax}
            />
          </div>
        )}
        <div className="chart-editor-section size-range">
          <div className="chart-editor-label">
            {sizeMeasureSet ? "Size Range" : "Point Autosize"}
          </div>
          {sizeMeasureSet && (
            <CustomSlider
              allowCross
              defaultValue={sizeRange || SIZE_RANGE_DEFAULTS}
              testid={"size-range"}
              max={SIZE_RANGE_MAX}
              min={1}
              onValueChange={props.onValueChangeWithSizeRange}
              range
              step={1}
            />
          )}
          {!sizeMeasureSet && (
            <div className="auto-pointsize">
              <Toggle
                checked={autoSize}
                onChange={props.onValueChangeWithAutoSize}
              />
            </div>
          )}
        </div>
        {!sizeMeasureSet && !autoSize && (
          <div className={`chart-editor-section ${autoSize ? "disabled" : ""}`}>
            <div className="chart-editor-label">Point Size</div>
            <CustomSlider
              defaultValue={
                (sizeRange && sizeRange[0]) || SIZE_RANGE_DEFAULTS[0]
              }
              testid={"point-size"}
              max={SIZE_RANGE_MAX}
              min={1}
              onValueChange={props.onValueChangeWithSizeRange}
              step={1}
            />
          </div>
        )}
        <div className="chart-editor-section">
          <div className="chart-editor-label">{"Mark Shape"}</div>
          <div className="chart-settings-row">
            <MarkShapeSelector
              markShape={
                props.chart.markShape
                  ? props.chart.markShape
                  : hasOrientation
                  ? DEFAULT_POINT_ORIENTATION_MARK_SHAPE
                  : DEFAULT_POINT_MARK_SHAPE
              }
              onChange={props.onValueChangeWithMarkShape}
              hasOrientation={hasOrientation}
            />
          </div>
        </div>
        <div className="chart-editor-section popupBox">
          <div className="popup-switch-wrapper">
            <div className="chart-editor-label">{"POPUP BOX"}</div>
            <Switch
              disabled={false}
              checked={popupEnabled}
              onChange={() => props.onTogglePopup(!popupEnabled)}
              className="compact"
            />
          </div>
          <HoverSelector chartId={props.id} type={type} isGrouped={isGrouped} />
        </div>
        {colorMeasure?.colorType === COLOR_PALETTE_TYPES.ORDINAL && (
          <div className="chart-editor-section">
            <div className="chart-editor-label">{"Color All Values"}</div>
            <div className="chart-settings-row">
              <Toggle
                checked={fullColorHashing ?? false}
                onChange={props.onValueChangeWithFullColorHashing}
                className="fullColorHashing-btn"
              />
            </div>
          </div>
        )}
        {sharedSettingsEnabled &&
          isColorMeasureActive &&
          colorMeasure.colorType === COLOR_PALETTE_TYPES.ORDINAL && (
            <div className="chart-editor-section">
              <PaletteMappingSelector
                chartId={props.chartId}
                chart={props.chart}
              />
            </div>
          )}
        <div className="chart-editor-section color-palette">
          <div className="chart-editor-label">{"Color Palette"}</div>
          <ColorPickerParent
            id={props.id}
            savedColors={props.chart.savedColors}
          />
        </div>
        <div className="chart-editor-section density-accumulator">
          <div className="chart-editor-label">Density Gradient</div>
          <Toggle
            checked={densityAccumulatorEnabled && !isColorMeasureActive}
            disabled={isColorMeasureActive}
            onChange={props.onValueChangeWithDensityAccumulatorEnabled}
          />
        </div>
        {type === "pointmap" &&
          isColorMeasureActive &&
          colorMeasure.colorType === COLOR_PALETTE_TYPES.ORDINAL && (
            <div className="chart-editor-section priority-color-picker">
              <PriorityColorSelector
                chartId={props.id}
                color={color}
                selectPriorityColor={props.onSetPrioritizedColorCategory}
              />
            </div>
          )}
        <div className="chart-editor-section color-ramps">
          {getFeatureFlag(available_feature_flags.ENABLE_COLOR_RAMPS) && (
            <ColorRampParent chartId={props.id} colors={colorScheme} />
          )}
        </div>
      </div>
    </div>
  )
}

function mapStateToProps(state, props) {
  const chart = state.charts[props.chartId]
  return {
    chart,
    id: props.chartId
  }
}

function mapDispatchToProps(dispatch, props) {
  return {
    onValueChangeWithAutoSize(autoSize) {
      dispatch(
        RasterChartActions.updateRasterChart(props.chartId, { autoSize })
      )
    },
    onValueChangeWithMarkShape(markShape) {
      dispatch(
        RasterChartActions.updateRasterChart(props.chartId, { markShape })
      )
    },
    onValueChangeWithCap(cap) {
      dispatch(RasterChartActions.updateRasterChart(props.chartId, { cap }))
    },
    onValueChangeWithSizeDomain(sizeDomain) {
      dispatch(
        RasterChartActions.updateRasterChart(props.chartId, { sizeDomain })
      )
    },
    onValueChangeWithSizeRange(sizeRange) {
      dispatch(
        RasterChartActions.updateRasterChart(props.chartId, { sizeRange })
      )
    },
    onValueChangeWithDensityAccumulator(densityAccumulatorEnabled) {
      dispatch(
        RasterChartActions.updateDensityAccumulator(props.chartId, {
          densityAccumulatorEnabled
        })
      )
    },
    onValueChangeWithLayerOpacity(value) {
      dispatch(
        RasterChartActions.updateRasterChart(props.chartId, {
          opacity: (value / 100).toFixed(2)
        })
      )
    },
    onTogglePopup(popupEnabled) {
      dispatch(
        RasterChartActions.updateRasterChart(props.chartId, {
          popupEnabled
        })
      )
    },
    onSetPrioritizedColorCategory(option) {
      let updateOption = null
      if (option.value !== "no_priority") {
        updateOption = option
      }
      dispatch(
        RasterChartActions.setPrioritizedColorCategory(
          props.chartId,
          updateOption
        )
      )
    },
    onValueChangeWithScaleType(scaleType) {
      dispatch(
        RasterChartActions.updateRasterChart(props.chartId, {
          scaleType
        })
      )
    },
    onValueChangeWithFullColorHashing(fullColorHashing) {
      dispatch(
        RasterChartActions.updateRasterChart(props.chartId, {
          fullColorHashing,
          showOther: !fullColorHashing,
          rasterShowOther: !fullColorHashing
        })
      )
      dispatch(updateHideOther(props.chartId, fullColorHashing))
    }
  }
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    onValueChangeWithAutoSize() {
      dispatchProps.onValueChangeWithAutoSize(!stateProps.chart.autoSize)
    },
    onValueChangeWithDensityAccumulatorEnabled() {
      dispatchProps.onValueChangeWithDensityAccumulator(
        !stateProps.chart.densityAccumulatorEnabled
      )
    },
    onValueChangeWithSizeRange(sizeRange) {
      dispatchProps.onValueChangeWithSizeRange(
        Array.isArray(sizeRange)
          ? sizeRange
          : [sizeRange, SIZE_RANGE_DEFAULTS[1]]
      )
    },
    onValueChangeWithScaleType(scaleType) {
      dispatchProps.onValueChangeWithScaleType(scaleType)
    },
    onValueChangeWithFullColorHashing() {
      dispatchProps.onValueChangeWithFullColorHashing(
        !stateProps.chart.fullColorHashing
      )
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(PointmapDisplaySettings)
