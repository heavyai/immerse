// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from "react"

export const useSetReplayCrossFilter = ({
  setCrossFilter,
  updateFilterAtFrame
}) =>
  useCallback(
    (filterArgs) => {
      const newFilter = updateFilterAtFrame(filterArgs)
      setCrossFilter(newFilter)
    },
    [setCrossFilter, updateFilterAtFrame]
  )
