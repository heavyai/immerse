// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as RasterChartActions from "charts/raster-chart/raster-chart-actions"
import { SIZE_RANGE_DEFAULTS } from "constants/magic-variables"
import React from "react"
import PropTypes from "prop-types"
import { CHARTS } from "constants/charts"
import ChartSettingsBasemapDropdownParent from "components/chart-settings-basemap-dropdown/chart-settings-basemap-dropdown-parent"
import { chartShape } from "constants/prop-types"
import ColorPickerParent from "components/color-picker/color-picker-parent"
import { connect } from "react-redux"
import CustomSlider from "components/custom-slider/custom-slider"
import PriorityColorSelector from "../point/priority-color-selector"
import ColorRampParent from "components/color-ramp/color-ramp-parent"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

WindbarbDisplaySettings.propTypes = {
  chart: chartShape.isRequired,
  id: PropTypes.string.isRequired,
  measuresWithNumberFormat: PropTypes.array,
  onValueChangeWithAutoSize: PropTypes.func.isRequired,
  onValueChangeWithCap: PropTypes.func.isRequired,
  onValueChangeWithDensityAccumulatorEnabled: PropTypes.func.isRequired,
  onValueChangeWithMarkShape: PropTypes.func.isRequired,
  onValueChangeWithSizeRange: PropTypes.func.isRequired,
  onValueChangeWithLayerOpacity: PropTypes.func.isRequired,
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

export function WindbarbDisplaySettings(props) {
  const {
    chart: {
      measures,
      // TODO: re-enable sizing settings once heavy-charting/rendering implements barb "grid spacing"
      // sizeDomain,
      // sizeRange,
      // autoSize,
      color
    }
  } = props
  // const sizeMeasureSet =
  //   measures?.[2]?.value !== undefined && !measures[2].isError
  // const minMax = measures[2] && measures[2].minMax
  const colorMeasure = measures.find((measure) => measure.name === "color")
  const isColorMeasureActive = Boolean(colorMeasure?.value)

  return (
    <div>
      <div className="chart-editor-section map-themes">
        <div className="chart-editor-label">{"Map Theme"}</div>
        <ChartSettingsBasemapDropdownParent chartId={props.id} />
      </div>
      <div>
        <div className="chart-editor-section num-groups windbarb-num-barbs">
          <div className="chart-editor-label">{"# of Barbs"}</div>
          <CustomSlider
            defaultValue={props.chart.cap}
            testid={"barb-number"}
            max={CHARTS.windbarb.defaultCap}
            min={CHARTS.windbarb.capMin}
            onValueChange={props.onValueChangeWithCap}
            step={1}
          />
        </div>
        {/* TODO: re-enable opacity once heavy-charting implements it */}
        {/* <div className="chart-editor-section opacity-slider">*/}
        {/*  <div className="chart-editor-label">{"Layer Opacity"}</div>*/}
        {/*  <CustomSlider*/}
        {/*    defaultValue={*/}
        {/*      (props.chart.opacity === undefined*/}
        {/*        ? layerDefaultOpacity(props.chart.type)*/}
        {/*        : props.chart.opacity) * 100*/}
        {/*    }*/}
        {/*    testid={"layer-opacity"}*/}
        {/*    max={100}*/}
        {/*    min={0}*/}
        {/*    onValueChange={props.onValueChangeWithLayerOpacity}*/}
        {/*    step={1}*/}
        {/*  />*/}
        {/* </div>*/}
        {/* TODO: re-enable sizing settings once heavy-charting/rendering implements barb "grid spacing" */}
        {/* {sizeMeasureSet && (*/}
        {/*  <div className="chart-editor-section size-domain">*/}
        {/*    <div className="chart-editor-label">{"Size Domain"}</div>*/}
        {/*    <CustomSlider*/}
        {/*      allowCross*/}
        {/*      defaultValue={sizeDomain || minMax}*/}
        {/*      testid={"size-domain"}*/}
        {/*      max={minMax && minMax[1]}*/}
        {/*      min={minMax && minMax[0]}*/}
        {/*      onValueChange={props.onValueChangeWithSizeDomain}*/}
        {/*      range*/}
        {/*      step={1}*/}
        {/*      values={sizeDomain || minMax}*/}
        {/*    />*/}
        {/*  </div>*/}
        {/* )}*/}
        {/* <div className="chart-editor-section size-range">*/}
        {/*  <div className="chart-editor-label">*/}
        {/*    {sizeMeasureSet ? "Size Range" : "Barb Autosize"}*/}
        {/*  </div>*/}
        {/*  {sizeMeasureSet && (*/}
        {/*    <CustomSlider*/}
        {/*      allowCross*/}
        {/*      defaultValue={sizeRange || SIZE_RANGE_DEFAULTS}*/}
        {/*      testid={"size-range"}*/}
        {/*      max={SIZE_RANGE_MAX}*/}
        {/*      min={1}*/}
        {/*      onValueChange={props.onValueChangeWithSizeRange}*/}
        {/*      range*/}
        {/*      step={1}*/}
        {/*    />*/}
        {/*  )}*/}
        {/*  {!sizeMeasureSet && (*/}
        {/*    <div className="auto-pointsize">*/}
        {/*      <Toggle*/}
        {/*        checked={autoSize}*/}
        {/*        onChange={props.onValueChangeWithAutoSize}*/}
        {/*      />*/}
        {/*    </div>*/}
        {/*  )}*/}
        {/* </div>*/}
        {/* {!sizeMeasureSet && !autoSize && (*/}
        {/*  <div className={`chart-editor-section ${autoSize ? "disabled" : ""}`}>*/}
        {/*    <div className="chart-editor-label">Point Size</div>*/}
        {/*    <CustomSlider*/}
        {/*      defaultValue={sizeRange?.[0] ?? SIZE_RANGE_DEFAULTS[0]}*/}
        {/*      testid={"point-size"}*/}
        {/*      max={SIZE_RANGE_MAX}*/}
        {/*      min={1}*/}
        {/*      onValueChange={props.onValueChangeWithSizeRange}*/}
        {/*      step={1}*/}
        {/*    />*/}
        {/*  </div>*/}
        {/* )}*/}
        {/* TODO: re-enable popupEnabled once heavy-charting implements hit-testing */}
        {/* <div className="chart-editor-section popupBox">*/}
        {/*  <div className="popup-switch-wrapper">*/}
        {/*    <div className="chart-editor-label">{"POPUP BOX"}</div>*/}
        {/*    <Switch*/}
        {/*      disabled={false}*/}
        {/*      checked={popupEnabled}*/}
        {/*      onChange={() => props.onTogglePopup(!popupEnabled)}*/}
        {/*      className="compact"*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*  <HoverSelector chartId={props.id} type={type} isGrouped={isGrouped} />*/}
        {/* </div>*/}
        <div className="chart-editor-section color-palette">
          <div className="chart-editor-label">{"Color Palette"}</div>
          <ColorPickerParent
            id={props.id}
            savedColors={props.chart.savedColors}
          />
        </div>
        {isColorMeasureActive && colorMeasure.colorType === "ordinal" && (
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

const isColorMeasureActive = (measures) =>
  Boolean(measures.find((m) => m.name === "color")?.value)

const mapStateToProps = (state, props) => {
  const chart = state.charts[props.chartId]
  const densityAccumulatorEnabled = isColorMeasureActive(chart.measures)

  return {
    chart: {
      ...chart,
      // TODO: re-enable popupEnabled once heavy-charting implements hit-testing
      popupEnabled: false,
      densityAccumulatorEnabled
    },
    id: props.chartId
  }
}

const mapDispatchToProps = (dispatch, props) => ({
  onValueChangeWithAutoSize(autoSize) {
    dispatch(RasterChartActions.updateRasterChart(props.chartId, { autoSize }))
  },
  onValueChangeWithMarkShape(markShape) {
    dispatch(RasterChartActions.updateRasterChart(props.chartId, { markShape }))
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
    dispatch(RasterChartActions.updateRasterChart(props.chartId, { sizeRange }))
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
  }
})

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
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(WindbarbDisplaySettings)
