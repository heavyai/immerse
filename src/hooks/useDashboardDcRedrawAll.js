// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from "react-redux"

export const useDashboardDcRedrawAll = () => {
  return useSelector(({ dc }) => dc?.redrawAll)
}

export const useDashboardDcRedrawAllDone = () => {
  return useDashboardDcRedrawAll()?.done
}

export const useDashboardDcRedrawAllPending = () => {
  return useDashboardDcRedrawAll()?.pending
}

export const useDashboardDcRedrawAllError = () => {
  return useDashboardDcRedrawAll()?.error
}
