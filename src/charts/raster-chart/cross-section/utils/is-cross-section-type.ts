// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { CHART_TYPES } from "constants/chart-types"

export const isCrossSectionType = (type: string) =>
  [CHART_TYPES.CROSS_SECTION, CHART_TYPES.CROSS_SECTION_TERRAIN].includes(type)
