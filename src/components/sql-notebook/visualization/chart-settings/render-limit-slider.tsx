// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { Icon } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"
import { POINT_RENDER_LIMIT } from "components/sql-notebook/constants"
import { ChartSettings } from "components/sql-notebook/types"
import { LargeValueSlider } from "./large-value-slider"

import "./render-limit-slider.scss"

export const RenderLimitSlider = ({
  updateSettings,
  min = 1000,
  max = POINT_RENDER_LIMIT,
  value = POINT_RENDER_LIMIT,
  step = 1000
}: {
  updateSettings: (updates: Partial<ChartSettings>) => void
  min?: number
  max?: number
  value?: number
  step?: number
}) => {
  return (
    <div className="sql-notebook__render-limit-slider">
      <div className="settings-label">
        <span>Render Limit</span>
        <Tooltip
          className="render-limit-slider__tooltip"
          content={`Limits how many geometries are rendered.`}
        >
          <Icon icon={{ icon: "info_outline", size: "xsmall" }} />
        </Tooltip>
      </div>
      <LargeValueSlider
        value={value}
        max={max}
        min={min}
        step={step}
        onChange={(v: number) =>
          updateSettings({
            renderLimit: v as number
          })
        }
      />
    </div>
  )
}
