// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const selectors = {
  databaseSwitcher: ".database-switcher",
  accountPanelButton: "account-panel"
}

export const chartSelectors = {
  title: "chart-title",
  chartContainer: "chartContainerTestId"
}

export const joinSelectors = {
  title: "join-manager-modal-title",
  nameInput: "join-manager-name-input"
}

export function asTestId(testid) {
  return `[data-testid="${testid}"]`
}
