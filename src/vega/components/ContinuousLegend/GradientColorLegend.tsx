// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useRef, useState } from "react"
import GradientLegendTooltip from "./GradientLegendTooltip"
import d3 from "services/d3"

type Props = {
  /** Colors to display, e.g. ["#22A7F0", "#3ad6cd", "#d4e666"] */
  colors: string[]

  /** Flag to decide reverse the order of colors */
  reverse?: boolean

  /** Dynamic domain calculated from the transformed data, color measures */
  domain: number[]
}

const GradientColorLegend: FC<Props> = ({ colors, reverse, domain }) => {
  const legendColorRef = useRef<HTMLDivElement>(null)
  const [tooltipContent, setTooltipContent] = useState(null)
  const [mouseXPosition, setMouseXPosition] = useState(0)

  const displayColors = reverse ? Array.from(colors).reverse() : colors

  const legendDivWidth = legendColorRef.current
    ? legendColorRef.current.clientWidth
    : 0

  // Using d3 linear scale to match the mouse position of the legend div with
  // CSS3 linear-gradient background to read the associated domain interval
  const scale = d3.scale
    .linear()
    .domain([0, legendDivWidth])
    .range(domain)
    .clamp(true)

  const onMouseMoveEvent = (e) => {
    if (legendColorRef.current) {
      const legendDiv = e.target.getBoundingClientRect()
      const mousePositionOnLegend = e.clientX - legendDiv.left

      const tooltipValue = scale(mousePositionOnLegend)

      setTooltipContent(parseFloat(tooltipValue.toFixed(3)))

      const legendClientRect = legendColorRef.current.getBoundingClientRect()
      // update tooltip position
      setMouseXPosition(e.clientX - legendClientRect.left)
    }
  }

  return (
    <div className="vega-gradient-legend">
      <div
        className="color-item"
        data-testid="color-measure-gradient-legend"
        ref={legendColorRef}
        style={{
          background: `linear-gradient(to right, ${displayColors})`
        }}
        onMouseMove={onMouseMoveEvent}
        onMouseOut={() => setTooltipContent(null)}
      />
      {tooltipContent && (
        <GradientLegendTooltip
          mouseXPosition={mouseXPosition}
          tooltipContent={tooltipContent}
        />
      )}
    </div>
  )
}

export default GradientColorLegend
