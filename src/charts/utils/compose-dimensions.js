// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mapToValues } from "utils/selector-helpers"

export default function composeDimensions(crossFilter, chartSpec) {
  const values = mapToValues(chartSpec.dimensions)
  const dimensions = crossFilter.dimension(values)
  return dimensions
}
