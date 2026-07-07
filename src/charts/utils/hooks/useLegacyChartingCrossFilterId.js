// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEnabledFilters } from "./useFilters"

export const useLegacyChartingCrossFilterId = (chartId) => {
  const filters = useEnabledFilters()
  return filters.find(
    (f) => f.chartId === chartId && f.appliesTo === "CROSSFILTER"
  )?.name
}
