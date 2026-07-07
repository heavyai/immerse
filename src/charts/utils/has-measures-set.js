// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * If all measure names passed in have a `value` associated with them in chart.measures
 * this returns true. otherwise it returns false.
 *
 * @param {Chart} chart
 * @param {Array<string>} measureNames
 * @returns {boolean} do all measure names passed in have a value as well
 */
export function hasMeasuresSet(chart, measureNames = []) {
  return measureNames.every((n) => {
    return Boolean(chart.measures.find((m) => m.name === n)?.value)
  })
}
