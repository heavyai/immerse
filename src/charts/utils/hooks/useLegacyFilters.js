// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEnabledFilters } from "./useFilters"
import { useStaticValue } from "hooks"

export const useLegacyFilters = ({ chartId, layerId }) => {
  const omnifilters = useEnabledFilters()

  return useStaticValue(
    omnifilters?.find(
      (f) =>
        f.chartId === chartId &&
        (f.layerId === layerId || layerId === undefined)
    )?.chartFilters || []
  )
}
