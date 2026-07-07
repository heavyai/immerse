// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { compose, map, prop } from "ramda"

const mapIdAndConvertToInt = compose(map(Number), map(prop("id")))

export function newChartIndex(dashboardContainers) {
  const allDashboardContainerToInt = mapIdAndConvertToInt(dashboardContainers)
  const maxInt = allDashboardContainerToInt.length
    ? Math.max(...allDashboardContainerToInt)
    : 0
  return maxInt + 1
}
