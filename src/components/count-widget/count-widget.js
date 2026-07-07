// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import CountChart from "charts/count/count-chart-wrapper"
import { crossfilterShape } from "constants/prop-types"
import { initialChart } from "reducers/charts/helpers/initialChart"

export const countChartSpec = {
  ...initialChart({ type: "count" }),
  measures: [],
  dimensions: [],
  type: "count",
  id: "COUNT",
  height: 0,
  width: 0
}

CountWidget.propTypes = {
  allChartsInitialized: PropTypes.bool.isRequired,
  crossfilter: crossfilterShape.isRequired,
  dispatch: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  dashboardId: PropTypes.number.isRequired,
  tabId: PropTypes.string.isRequired
}

export default function CountWidget(props) {
  return (
    <div className="count-widget-wrapper">
      <CountChart
        allChartsInitialized={props.allChartsInitialized}
        chart={Object.assign({}, countChartSpec, {
          id: props.id,
          dataSource: props.id
        })}
        crossfilter={props.crossfilter}
        dispatch={props.dispatch}
        hasError={false}
        id={props.id}
        dashboardId={props.dashboardId}
        tabId={props.tabId}
      />
    </div>
  )
}
