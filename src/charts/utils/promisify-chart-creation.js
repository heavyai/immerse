// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export default function promisifyChartCreation(create) {
  return function chartCreationAsync(crossFilter, dispatch) {
    return function chartCreationPromise(chartSpec, node, chartId) {
      const chartCrossFilter =
        crossFilter && crossFilter.cloneWithChartId
          ? crossFilter.cloneWithChartId(chartId)
          : crossFilter
      return new Promise((resolve, reject) => {
        create(chartCrossFilter, dispatch, chartId)(
          chartSpec,
          node,
          (err, Chart) => {
            if (err) {
              reject(err)
            } else {
              resolve(Chart)
            }
          }
        )
      })
    }
  }
}
