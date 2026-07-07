// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import R from "ramda"

const allHaveDataSource = (charts) =>
  R.compose(
    R.all((id) => charts[id].dataSource),
    R.keys,
    R.dissoc("0")
  )(charts)

export default function reducer(state) {
  const nextCharts = state.charts

  Object.keys(state.charts).forEach((key) => {
    if (isNaN(parseInt(key, 10))) {
      delete nextCharts[key]
    }
  })

  return {
    ...state,
    dashboard: {
      ...state.dashboard,
      currentDataSource:
        state.dashboard.currentDataSource || state.dashboard.table,
      dataSources: state.dashboard.dataSources || {
        [state.dashboard.table]: {
          alias: "A"
        }
      }
    },
    filters: R.all(R.has("dataSource"), state.filters)
      ? state.filters
      : R.map(R.merge({ dataSource: state.dashboard.table }))(state.filters),
    charts: allHaveDataSource(nextCharts)
      ? nextCharts
      : R.map(R.merge({ dataSource: state.dashboard.table }))(nextCharts)
  }
}
