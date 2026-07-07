// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const MEASURE_NAME_ALIASES = {}

export function addDataAlias(chartType, dataAlias) {
  MEASURE_NAME_ALIASES[chartType] = dataAlias
}
