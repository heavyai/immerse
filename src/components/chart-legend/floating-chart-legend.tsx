// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import ChartLegend from "./index"
import SourceList from "./source-list"
import {
  getFormattedDataSourcesValues,
  formatDataPointXValue
} from "./data-sources-values-fomatting"

const DEFAULT_LEGEND_DATE_FORMAT = "%b %d, %Y"

// TODO: clean up this logic.  The offsets are confusing. There's something odd going on
// that isn't allowing JS to have accurate numbers that we're having to adjust for here.
const getPlacementCoordinates = (
  mousePosition = {},
  collisionCoordinates: DOMRect = {},
  legendRect: DOMRect = {}
) => {
  const positionInCoordinates = {
    x: mousePosition.clientX - collisionCoordinates.left,
    y: mousePosition.clientY - collisionCoordinates.top
  }
  const { height: legendHeight = 0, width: legendWidth = 0 } = legendRect || {}
  const TOP_OFFSET = 45 // These margins are here as essentially a constant offset from what JS
  const LEFT_OFFSET = 7 // is seeing as what the coordinates should be for some odd reason
  const placementCoordinates = {
    top: positionInCoordinates.y + TOP_OFFSET,
    left: positionInCoordinates.x + LEFT_OFFSET
  }

  if (positionInCoordinates.x + legendWidth >= collisionCoordinates.width) {
    placementCoordinates.left =
      placementCoordinates.left - legendWidth - LEFT_OFFSET * 2
  }

  if (positionInCoordinates.y + legendHeight >= collisionCoordinates.height) {
    placementCoordinates.top = placementCoordinates.top - legendHeight
  }

  return placementCoordinates
}

class FloatingChartLegend extends React.PureComponent {
  legendRef = React.createRef()
  render = () => {
    const {
      hasRightAxisMeasure,
      palette,
      chartType,
      dataSources,
      maxHeight,
      dataPoint = {
        x: null,
        series: []
      },
      dimensionFormats,
      measureFormats,
      binningResolution,
      dateFormat = DEFAULT_LEGEND_DATE_FORMAT,
      yAxisPercentageFormat,
      mousePosition,
      collisionCoordinates
    } = this.props
    const dataPoints = dataPoint.series
    const dataSourcesValues = getFormattedDataSourcesValues(
      dataSources,
      dataPoints,
      measureFormats,
      yAxisPercentageFormat
    )

    const placementCoordinates = getPlacementCoordinates(
      mousePosition,
      collisionCoordinates,
      this.legendRef.current && this.legendRef.current.getBoundingClientRect()
    )

    return (
      <ChartLegend
        {...{
          className: "floating",
          uiConfigId: "chart-tooltip",
          collapsible: false,
          hasRightAxisMeasure,
          maxHeight,
          top: placementCoordinates.top, // top + 5, //offset just a bit from the mouse cursor
          left: placementCoordinates.left, // left + 5,
          title: formatDataPointXValue(
            dataPoint.x,
            dimensionFormats,
            dateFormat,
            binningResolution
          ),
          forwardedRef: this.legendRef
        }}
      >
        <SourceList
          {...{ dataSources, palette, chartType, dataSourcesValues }}
        />
      </ChartLegend>
    )
  }
}

export default FloatingChartLegend
