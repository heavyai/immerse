// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { process } from "./ImmerseSQLPlusPlus/parser"

// Returns true if value contains a parameter that cannot be processed;
// this is expected if parameter does not exist on this dashboard
export const hasInvalidParameter = (val?: string) => {
  if (!val) {
    return false
  }

  const invalidParameters = new Set()
  process(val, { trackUsage: false }, { invalidParameters })
  return Boolean(invalidParameters.size)
}
