// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from "react-redux"

export const useIsUserGeneratedFilter = (filterName) => {
  const filter = useSelector((state) =>
    state.omnifilters.find((f) => f.name === filterName)
  )
  return filter?.userGenerated || false
}
