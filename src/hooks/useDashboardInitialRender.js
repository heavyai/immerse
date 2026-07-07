// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from "react-redux"

export const useDashboardInitialRender = () => {
  return useSelector(({ dc }) => dc?.initialRender)
}

export const useDashboardInitialRenderDone = () => {
  return useDashboardInitialRender()?.done
}

export const useDashboardInitialRenderPending = () => {
  return useDashboardInitialRender()?.pending
}

export const useDashboardInitialRenderError = () => {
  return useDashboardInitialRender()?.error
}
