// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as RasterChartActions from "charts/raster-chart/raster-chart-actions"
import {
  STROKE_WIDTH_RANGE_DEFAULTS,
  STROKE_RANGE_MAX,
  layerDefaultOpacity
} from "constants/magic-variables"
import React from "react"
import PropTypes from "prop-types"
import { CHARTS } from "constants/charts"
import { COLOR_PALETTE_TYPES } from "constants/colors"
import ChartSettingsBasemapDropdownParent from "components/chart-settings-basemap-dropdown/chart-settings-basemap-dropdown-parent"
import { chartShape } from "constants/prop-types"
import { connect } from "react-redux"
import HoverSelector from "components/hover-selector/hover-selector"
import { isSelectorUsable } from "utils/selector-helpers"
import Toggle from "react-toggle"
import ColorPickerParent from "components/color-picker/color-picker-parent"
import CustomSlider from "components/custom-slider/custom-slider"
import ChartSettingsGeoJsonDropdown from "components/chart-settings-geojson-dropdown/chart-settings-geojson-dropdown-parent"
import { Switch } from "widgets/switch/Switch"
import { PaletteMappingSelector } from "components/shared-settings/palette-mapping/palette-mapping-selector"
import { useSharedSettingsEnabled } from "hooks/useSharedSettingsEnabled"
import { SELECTOR_ASSIGNMENTS } from "constants/selectors"
import { updateHideOther } from "actions/charts-color-action-creators"

LinemapDisplaySettings.propTypes = {
  chart: chartShape.isRequired,
  id: PropTypes.string.isRequired,
  onValueChangeWithCap: PropTypes.func.isRequired,
  onValueChangeWithDensityAccumulatorEnabled: PropTypes.func.isRequired,
  onValueChangeWithAutoSize: PropTypes.func.isRequired,
  onValueChangeWithSizeRange: PropTypes.func.isRequired
}

export function LinemapDisplaySettings(props) {
  const {
    chart: {
      dimensions,
      measures,
      sizeDomain,
      sizeRange,
      autoSize,
      type,
      savedColors,
      densityAccumulatorEnabled,
      popupEnabled,
      fullColorHashing
    }
  } = props

  const { SIZE, COLOR } = SELECTOR_ASSIGNMENTS

  const sizeMeasure = measures.find((m) => m.name === SIZE)
  const sizeMeasureSet =
    typeof (sizeMeasure && sizeMeasure.value) !== "undefined" &&
    !sizeMeasure.isError
  const minMax = sizeMeasure && sizeMeasure.minMax
  const colorMeasure = measures.find((measure) => measure.name === COLOR)
  const isColorMeasureActive = Boolean(colorMeasure && colorMeasure.value)

  const sharedSettingsEnabled = useSharedSettingsEnabled()

  const isGrouped = dimensions.filter(isSelectorUsable).length

  return (
    <div>
      {type === "linemap" && (
        <div className="chart-editor-section map-themes">
          <div className="chart-editor-label">{"Map Theme"}</div>
          <ChartSettingsBasemapDropdownParent chartId={props.id} />
        </div>
      )}
      <div className="chart-editor-section num-groups">
        <div className="chart-editor-label">{"# of Lines"}</div>
        <CustomSlider
          defaultValue={props.chart.cap}
          max={CHARTS.linemap.defaultCap}
          min={CHARTS.linemap.capMin}
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
      {sizeMeasureSet && (
        <div className="chart-editor-section size-domain">
          <div className="chart-editor-label">{"Size Domain"}</div>
          <CustomSlider
            allowCross
            defaultValue={sizeDomain || minMax}
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
          {sizeMeasureSet ? "Size Range" : "Line Autosize"}
        </div>
        {sizeMeasureSet && (
          <CustomSlider
            allowCross
            defaultValue={sizeRange || STROKE_WIDTH_RANGE_DEFAULTS}
            max={STROKE_RANGE_MAX}
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
          <div className="chart-editor-label">Stroke Width</div>
          <CustomSlider
            defaultValue={
              (sizeRange && sizeRange[0]) || STROKE_WIDTH_RANGE_DEFAULTS[0]
            }
            max={STROKE_RANGE_MAX}
            min={1}
            onValueChange={props.onValueChangeWithSizeRange}
            step={1}
          />
        </div>
      )}
      <div className="chart-editor-section">
        <div className="chart-editor-label">{"Geo Join"}</div>
        <ChartSettingsGeoJsonDropdown chartId={props.id} />
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
      <div className="chart-editor-section density-accumulator">
        <div className="chart-editor-label">Density Gradient</div>
        <Toggle
          checked={densityAccumulatorEnabled && !isColorMeasureActive}
          disabled={isColorMeasureActive}
          onChange={props.onValueChangeWithDensityAccumulatorEnabled}
        />
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
        <ColorPickerParent id={props.id} savedColors={savedColors} />
      </div>
    </div>
  )
}

function mapStateToProps(state, props) {
  return {
    chart: state.charts[props.chartId],
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
          : [sizeRange, STROKE_WIDTH_RANGE_DEFAULTS[1]]
      )
    },
    onValueChangeWithFullColorHashing() {
      dispatchProps.onValueChangeWithFullColorHashing(
        !stateProps.chart.fullColorHashing ?? true
      )
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(LinemapDisplaySettings)
