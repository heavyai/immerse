// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCurrentFilterSet } from "./useCurrentFilterSet"

export const useInternalCrossfilterId = ({
  chartId,
  name = "crossfilter",
  useGeneratedInternalId = true
}) => {
  const currentFilterSet = useCurrentFilterSet()
  return useGeneratedInternalId
    ? `${chartId}/${name}/${currentFilterSet.id}`
    : name
}
