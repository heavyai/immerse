// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import ChartTitle from "./chart-title"
import { connect } from "react-redux"
import { createAutoTitle } from "./chart-title-helpers"
import { updateChart } from "actions/update-chart-action-creator"
import { makeGetParameterValuesForChart } from "components/parameters/selectors"

export function mapStateToProps(state, { id }) {
  const {
    currentLayer,
    dataSelections,
    dimensions,
    hasError,
    layers,
    measures,
    type
  } = state.charts[id]
  let title = state.charts[id].title
  let parametersInAutoTitle = {}

  if (title === "" && !(hasError || type === "table")) {
    const autoTitle = createAutoTitle(state.charts[id])
    title = autoTitle.title
    parametersInAutoTitle = autoTitle.parametersInAutoTitle
  }

  return {
    title,
    parametersInAutoTitle,
    parameterValues: makeGetParameterValuesForChart(state)(id),
    measures,
    dimensions,
    currentLayer,
    layers,
    dataSelections,
    chartType: type
  }
}

export function mapDispatchToProps(dispatch, { id }) {
  return {
    updateChartTitle: (title) =>
      dispatch(
        updateChart(id, {
          title,
          // If the user manually updates the chart title, this prevents the (Copy)
          // from auto-pending
          copyNumber: 0
        })
      )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChartTitle)
