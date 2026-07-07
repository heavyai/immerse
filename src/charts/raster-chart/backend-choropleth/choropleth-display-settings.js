// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as RasterChartActions from "charts/raster-chart/raster-chart-actions"
import React from "react"
import PropTypes from "prop-types"
import ChartSettingsBasemapDropdownParent from "components/chart-settings-basemap-dropdown/chart-settings-basemap-dropdown-parent"
import ChartSettingsGeoJsonDropdown from "components/chart-settings-geojson-dropdown/chart-settings-geojson-dropdown-parent"
import HoverSelector from "components/hover-selector/hover-selector"
import CustomSlider from "components/custom-slider/custom-slider"
import Toggle from "react-toggle"
import ColorPickerParent from "components/color-picker/color-picker-parent"
import { isSelectorUsable } from "utils/selector-helpers"
import { chartShape } from "constants/prop-types"
import { connect } from "react-redux"
import { CHARTS } from "constants/charts"
import { COLOR_PALETTE_TYPES } from "constants/colors"
import { layerDefaultOpacity } from "constants/magic-variables"
import { Switch } from "widgets/switch/Switch"
import SingleColorPicker from "vega/components/SingleColorPicker"
import { getUserConfigurableUISettings } from "reducers/user-configurable-ui-reducer"
import { DEFAULT_POLY_BORDER_COLOR } from "charts/raster-chart/raster-chart-consts"
import { validateSixDigitHex } from "vega/components/SingleColorPicker/utils"
import { PaletteMappingSelector } from "components/shared-settings/palette-mapping/palette-mapping-selector"
import { useSharedSettingsEnabled } from "hooks/useSharedSettingsEnabled"
import { updateHideOther } from "actions/charts-color-action-creators"

ChoroplethDisplaySettings.propTypes = {
  chart: chartShape.isRequired,
  id: PropTypes.string.isRequired,
  onValueChangeWithBorderWidth: PropTypes.func.isRequired,
  onValueChangeWithPolyCap: PropTypes.func.isRequired,
  onValueChangeWithLayerOpacity: PropTypes.func.isRequired,
  onTogglePopup: PropTypes.func.isRequired
}

export function ChoroplethDisplaySettings(props) {
  const {
    chart: {
      dimensions,
      measures,
      borderWidth,
      borderColor = DEFAULT_POLY_BORDER_COLOR,
      savedColors,
      hasBorderColorFromFill,
      popupEnabled,
      type,
      rasterLayerId,
      fullColorHashing
    },
    borderColorPalette,
    colorMeasure
  } = props
  const sharedSettingsEnabled = useSharedSettingsEnabled()
  const isGrouped =
    dimensions.filter(isSelectorUsable).length || measures[0]?.is_join

  return (
    <div key={rasterLayerId}>
      <div className="chart-editor-section map-themes">
        <div className="chart-editor-label">{"Map Theme"}</div>
        <ChartSettingsBasemapDropdownParent
          chartId={props.id}
          chartType={props.chart.type}
        />
      </div>
      <div className="chart-editor-section num-groups">
        <div className="chart-editor-label">{"# of Polygons"}</div>
        <CustomSlider
          defaultValue={props.chart.polyCap}
          testid={"polygon-number"}
          max={CHARTS.backendChoropleth.capMax}
          min={CHARTS.backendChoropleth.capMin}
          onValueChange={props.onValueChangeWithPolyCap}
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
      <div className="chart-editor-section">
        <div className="chart-editor-label">{"Border Width"}</div>
        <CustomSlider
          {...props}
          defaultValue={borderWidth}
          testid={"miter-width"}
          max={5}
          min={0}
          onValueChange={props.onValueChangeWithBorderWidth}
          step={0.1}
        />
      </div>
      <div className="chart-editor-section">
        <div className="chart-editor-label">{"Match border color to fill"}</div>
        <Toggle
          defaultChecked={hasBorderColorFromFill}
          id="border-fill-toggle"
          onChange={props.onValueChangeWithBorderColorFromFill}
        />
      </div>
      {!hasBorderColorFromFill && (
        <div className="chart-editor-section choropleth-border-color">
          <div className="chart-editor-label">{"Border color"}</div>
          <SingleColorPicker
            selectedColor={borderColor}
            onColorBlur={props.onValueChangeWithBorderColor}
            colorPalette={borderColorPalette}
            validateColor={validateSixDigitHex} // Backend doesn't recognize 3-digit hex
          />
        </div>
      )}
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
        colorMeasure?.colorType === COLOR_PALETTE_TYPES.ORDINAL && (
          <div className="chart-editor-section">
            <PaletteMappingSelector
              chartId={props.chartId}
              chart={props.chart}
            />
          </div>
        )}
      <div className="chart-editor-section">
        <div className="chart-editor-label">{"Color Palette"}</div>
        <ColorPickerParent id={props.id} savedColors={savedColors} />
      </div>
    </div>
  )
}

function mapStateToProps(state, props) {
  const borderColorPalette = [
    ...getUserConfigurableUISettings(state).colorPalettes.solid
  ]

  if (!borderColorPalette.find((hex) => hex === DEFAULT_POLY_BORDER_COLOR)) {
    borderColorPalette.unshift(DEFAULT_POLY_BORDER_COLOR)
  }
  const chart = state.charts[props.chartId]
  const colorMeasure = chart.measures.find((m) => m.name === "color")
  const mappings =
    state.sharedSettings.mappings?.filter((mapping) => {
      return (
        mapping.dataSource === chart.dataSource &&
        mapping.column === colorMeasure?.value
      )
    }) ?? []
  const fullColorHashing = chart?.fullColorHashing ?? false

  return {
    chart: state.charts[props.chartId],
    id: props.chartId,
    borderColorPalette,
    mappings,
    colorMeasure,
    fullColorHashing
  }
}

function mapDispatchToProps(dispatch, props) {
  return {
    onValueChangeWithBorderWidth(borderWidth) {
      dispatch(
        RasterChartActions.updateRasterChart(props.chartId, { borderWidth })
      )
    },
    onValueChangeWithBorderColor(borderColor) {
      dispatch(
        RasterChartActions.updateRasterChart(props.chartId, { borderColor })
      )
    },
    onValueChangeWithBorderColorFromFill(event) {
      dispatch(
        RasterChartActions.updateRasterChart(props.chartId, {
          hasBorderColorFromFill: event.target.checked
        })
      )
    },
    onValueChangeWithPolyCap(polyCap) {
      dispatch(RasterChartActions.updateRasterChart(props.chartId, { polyCap }))
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
    onValueChangeWithFullColorHashing(event) {
      const fullColorHashing = event.target.checked
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChoroplethDisplaySettings)
