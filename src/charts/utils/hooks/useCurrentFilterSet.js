// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from "react-redux"

export const useCurrentFilterSet = () => {
  return useSelector((state) =>
    Object.values(state.filterZones).find((filterSet) => filterSet.selected)
  )
}
