// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const chartSettingsComponents = {}

export function addChartSettingsComponent(chartType, SettingsComponent) {
  chartSettingsComponents[chartType] = SettingsComponent
}
