// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from "react"

export const useUpdateInternalFilter = ({
  filter,
  setInternalFilter,
  needsToUpdateCrossfilter
}) =>
  useEffect(() => {
    if (needsToUpdateCrossfilter) {
      setInternalFilter(filter)
    }
  }, [filter, setInternalFilter, needsToUpdateCrossfilter])
