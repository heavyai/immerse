// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from "react-redux"
import { AppState } from "vega/charts/types"
import { CONTROL_PANEL_ADMIN } from "constants/immerse-roles"

export const useIsControlPanelAdmin = () =>
  useSelector(
    (state: AppState) =>
      state.connection.isSuperuser ||
      state.connection.roles.includes(CONTROL_PANEL_ADMIN)
  )

/**
 * Currently, users with the CONTROL_PANEL_ADMIN role should largely function as
 * a superuser as far as the control panel goes. However, a true superuser check
 * is needed in some cases to hide any functionality blocked on backend.
 */
export const useIsSuperuser = () =>
  useSelector((state: AppState) => state.connection.isSuperuser)
