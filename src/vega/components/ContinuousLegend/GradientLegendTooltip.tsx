// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

type Props = {
  /** Mouse X relative to the GradientColorLegend div */
  mouseXPosition: number

  /** Domain interval value */
  tooltipContent: string | null
}

const GradientLegendTooltip: FC<Props> = ({
  mouseXPosition,
  tooltipContent
}) => {
  return (
    <div
      className="legend-tooltip"
      data-testid="color-measure-legend-tooltip"
      style={{
        left: mouseXPosition
      }}
    >
      {" "}
      {tooltipContent}
    </div>
  )
}

export default GradientLegendTooltip
