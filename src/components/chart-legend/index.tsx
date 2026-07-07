// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import cx from "classnames"
import { noop } from "utils/helpers"

type DataSource = {
  index: number
  table: string
}

interface ChartLegendProps {
  hasRightAxisMeasure?: boolean
  palette: any
  chartType: string
  dataSources: DataSource[]
  maxHeight: number
  legendCollapsed?: boolean
  toggleChartLegend?: () => void
  top: number
  left: number
  isTooltipMode: boolean
  tooltipDataPoint: any
  collapsible?: boolean
}

const getStyle = (top: number, left: number, maxHeight: number) => ({
  maxHeight: `${maxHeight}px`,
  top: top ? `${top}px` : null,
  left: left ? `${left}px` : null
})

const ChartLegend = ({
  maxHeight,
  top,
  left,
  hasRightAxisMeasure,
  title = "Legend",
  children,
  className = null,
  collapsible = true,
  forwardedRef,
  collapsed = false,
  uiConfigId = "legend-discrete",
  onHeaderClick = noop
}: ChartLegendProps) => (
  <div
    {...{
      className: cx(
        "chart-legend",
        { "has-right-axis": hasRightAxisMeasure },
        { collapsed },
        className
      ),
      style: getStyle(top, left, maxHeight),
      "data-ui-config-id": uiConfigId,
      ref: forwardedRef
    }}
  >
    <h5
      {...{
        className: "title p-2 m-0",
        onClick: onHeaderClick
      }}
    >
      {title}
      {collapsible && <span className="legend-collapse ml-1">∨</span>}
    </h5>
    {!collapsed && <ul className="list-unstyled m-0">{children}</ul>}
  </div>
)

export default ChartLegend
