// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { navigateToChartEditor } from "actions/dashboard-action-creators"

export function createNewChartAfterMax(maxContainerInt) {
  return (dispatch) => {
    const newChartId = maxContainerInt || 1
    dispatch(navigateToChartEditor(newChartId))
  }
}
