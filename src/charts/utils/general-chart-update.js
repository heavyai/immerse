// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Parent --> utils/update-factory
import dc from "services/dc"

export default function generalChartUpdate(chart, diff) {
  const shouldDisableTransition = {
    height: true,
    width: true
  }

  Object.keys(diff).forEach((value) => {
    const update = diff[value]
    const dcValue = chart[value]
    if (dcValue) {
      if (shouldDisableTransition[value]) {
        dc.disableTransitions(true)
      }

      dcValue(update)

      if (shouldDisableTransition[value]) {
        dc.disableTransitions(false)
      }
    }
  })
}
