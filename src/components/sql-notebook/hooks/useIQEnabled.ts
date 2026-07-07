// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from "react-redux"
import { AppState } from "vega/charts/types"

export const useIQEnabled = () => {
  const iqEnabled = useSelector(
    (state: AppState) => state.sqlNotebook?.iqEnabled
  )
  return iqEnabled
}
