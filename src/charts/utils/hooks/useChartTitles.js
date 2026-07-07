// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from "react-redux"

import { createAutoTitle } from "components/chart-title/chart-title-helpers"

import { process as processParameters } from "utils/ImmerseSQLPlusPlus/parser"

export const useChartTitles = () => {
  return useSelector((state) =>
    Object.keys(state.charts).reduce((bucket, chartId) => {
      if (!chartId.match(/^\d+$/)) {
        return bucket
      }

      const chart = state.charts[chartId]

      let title = chart.title

      if (title === "") {
        const autoTitle = createAutoTitle(chart)
        title = autoTitle.title
      }

      const processedTitle = processParameters(title, {
        chartId,
        token: "chartTitle"
      })

      bucket[chartId] = processedTitle
      return bucket
    }, {})
  )
}
