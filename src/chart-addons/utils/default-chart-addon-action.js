// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  addChartAddonToChart,
  removeChartAddonFromChart
} from "chart-addons/chart-addon-action-creators"

export const defaultChartAddonAction = ({
  chartId,
  chartAddonType,
  currentChartAddon,
  dispatch
}) => {
  if (chartAddonType === currentChartAddon) {
    dispatch(removeChartAddonFromChart(chartId))
  } else {
    dispatch(removeChartAddonFromChart(chartId))
    dispatch(addChartAddonToChart(chartId, chartAddonType))
  }
}
