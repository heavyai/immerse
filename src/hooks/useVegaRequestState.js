// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from "react-redux"

export const useHasPendingVegaComboRequest = () => {
  const vegaCharts = useSelector(({ charts }) =>
    Object.values(charts || {}).filter(({ type }) => type === "vega-combo")
  )

  return vegaCharts.some((chart) =>
    Object.values(chart.data || {}).some((dataByKey) =>
      dataByKey.some((data) =>
        Object.values(data).some((beat) => beat === null || beat?.incomplete)
      )
    )
  )
}
