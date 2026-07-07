// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import { LabelConfig, ChartConfig, UserConfig } from "../types"
import AxisLabelWidth from "./AxisLabelWidth"
import MaxLegendWidth from "./MaxLegendWidth"
import ChartMargin from "./ChartMargin"

interface Props {
  // Theme used for styling slider
  showChartMargin: boolean
  showAxisTruncation: boolean
  userSettings: UserConfig
  setLabelSettings: (labelSettings: LabelConfig) => void
  setChartSettings: (chartSettings: ChartConfig) => void
}

const ChartSection: FC<Props> = ({
  showAxisTruncation,
  showChartMargin,
  userSettings,
  setChartSettings,
  setLabelSettings
}) => {
  return (
    <>
      {showChartMargin && (
        <ChartMargin
          chartSettings={userSettings.chart}
          setChartSettings={setChartSettings}
        />
      )}
      {showAxisTruncation && (
        <AxisLabelWidth
          labelSettings={userSettings.label}
          setLabelSettings={setLabelSettings}
        />
      )}
      <MaxLegendWidth
        chartSettings={userSettings.chart}
        setChartSettings={setChartSettings}
      />
    </>
  )
}

export default ChartSection
