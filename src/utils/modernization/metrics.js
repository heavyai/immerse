// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Opt-in development instrumentation. Record action names/counts, never payloads.
export function createActionMetrics(target) {
  const counts = {}
  target.read = () => ({ ...counts })
  target.reset = () => Object.keys(counts).forEach((key) => delete counts[key])
  return () => (forward) => (action) => {
    const result = forward(action)
    if (typeof action.type === "string") {
      counts[action.type] = (counts[action.type] || 0) + 1
    }
    return result
  }
}
