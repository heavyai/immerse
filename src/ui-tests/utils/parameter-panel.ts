// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { waitForVisible } from "./common"

export const openParameterPanel = async () => {
  /* This function opens parameter panel in dashboard page */

  const parameterPanelHandleSelector = "[data-testid='parameter-panel-handle']"
  const parameterPanelSelector = ".parameter-panel"
  await waitForVisible(parameterPanelHandleSelector)
  const parameterPanelIsOpen = await page.$(parameterPanelSelector)
  if (!parameterPanelIsOpen) {
    await page.click(parameterPanelHandleSelector)
  }
  return await waitForVisible(parameterPanelSelector)
}
