// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { VegaComboChart } from "vega/charts/types"
import { MarkSettings } from "vega/constants/data-selection-types"

export const sumOptionsEnabled = (
  chart: VegaComboChart,
  axis: MarkSettings["axis"]
) => {
  const { dataSelections } = chart
  return (
    dataSelections.flatMap(({ measures: { size } }) =>
      size.filter((measure) => measure.markSettings.axis === axis)
    ).length > 0
  )
}
