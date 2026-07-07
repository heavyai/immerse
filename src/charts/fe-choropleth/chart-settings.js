// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import ChartSettingsGeoJsonDropdown from "components/chart-settings-geojson-dropdown/chart-settings-geojson-dropdown-parent"
import ChartSettingsBasemapDropdownParent from "components/chart-settings-basemap-dropdown/chart-settings-basemap-dropdown-parent"
import ColorPickerParent from "components/color-picker/color-picker-parent"
import ChartFormatting from "components/chart-settings/chart-formatting"

const ChoroplethChartSettings = (props) => {
  return (
    <div>
      <div className="chart-editor-section map-themes">
        <div className="chart-editor-label">{"Map Theme"}</div>
        <ChartSettingsBasemapDropdownParent chartId={props.id} />
      </div>
      {props.chart.currentLayer !== "master" && (
        <div className="chart-editor-section">
          <div className="chart-editor-label">{"Geo Json Join"}</div>
          <ChartSettingsGeoJsonDropdown chartId={props.id} />
        </div>
      )}
      <div className="chart-editor-section">
        <div className="chart-editor-label">{"Color Palette"}</div>
        <ColorPickerParent
          id={props.id}
          savedColors={props.chart.savedColors}
        />
      </div>
      <ChartFormatting
        measures={props.measures}
        onMeasureFormat={props.onMeasureValueChangeWithFormat}
        onDimensionFormat={props.onDimensionValueChangeWithFormat}
      />
    </div>
  )
}

export default ChoroplethChartSettings
