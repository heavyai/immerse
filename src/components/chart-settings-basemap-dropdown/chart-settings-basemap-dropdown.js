// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import { CURRENT_IMMERSE_THEME_STRING, OFFLINE_BASEMAP } from "constants/charts"
import { basemapShape } from "constants/prop-types"
import CustomSelector from "components/custom-selector/custom-selector"
import { currentTheme } from "utils/dark-mode-switcher"
import { DARK_THEME } from "utils/theme/types"
import { getAvailableBasemapsForChart } from "charts/raster-chart/basemap"

ChartSettingsBasemapDropdown.propTypes = {
  basemap: basemapShape.isRequired,
  onOptionHover: PropTypes.func.isRequired,
  onOptionOut: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(basemapShape).isRequired,
  preview: basemapShape,
  updateBasemap: PropTypes.func.isRequired
}

const basemapPreview = (chartId, label) => {
  const availableBasemaps = getAvailableBasemapsForChart(chartId)
  if (label === OFFLINE_BASEMAP[0].label) {
    return currentTheme() === DARK_THEME
      ? `${label.toLowerCase()}-dark`
      : `${label.toLowerCase()}-light`
  } else if (label && availableBasemaps.some((b) => b.label === label)) {
    return label === CURRENT_IMMERSE_THEME_STRING
      ? currentTheme() === DARK_THEME
        ? "dark"
        : "light"
      : label.toLowerCase().replace(/ /, "-")
  }
  return "custom"
}

export default function ChartSettingsBasemapDropdown(props) {
  return (
    <div className="chart-settings-row">
      <div className="basemap-selector" data-testid="basemap-selector">
        <CustomSelector
          className="basemap-dropdown"
          currentValue={props.basemap.value}
          onChange={props.updateBasemap}
          onOptionHover={props.onOptionHover}
          onOptionOut={props.onOptionOut}
          options={props.options}
        />
      </div>
      <div
        className={`basemap-preview ${basemapPreview(
          props.chartId,
          props.preview.label
        )}`}
      />
    </div>
  )
}
