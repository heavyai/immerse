// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from "react"
import { connect } from "react-redux"
import {
  useVegaChartData,
  useRenderSnapshot
} from "charts/utils/hooks/useCachedChartData"
import { withQueryResultState } from "./index"

export function withChartQueryResults(Component) {
  function ChartWithQueryResults(props) {
    const id = props.cid ?? props.id ?? props.chart?.id
    const data = useVegaChartData(id)
    const chart = useMemo(
      () => (data === undefined ? props.chart : { ...props.chart, data }),
      [props.chart, data]
    )
    return <Component {...props} chart={chart} />
  }
  ChartWithQueryResults.displayName = `WithChartQueryResults(${
    Component.displayName || Component.name || "Chart"
  })`
  return ChartWithQueryResults
}
// Legacy connected Top-N controls still expect a state-shaped read model. Only
// these consumers receive a projection; the Redux store itself stays unchanged.
export function connectWithQueryResults(mapState, mapDispatch) {
  return (Component) => {
    const Connected = connect(
      () => {
        const select = mapState()
        return (state, props) =>
          select(withQueryResultState(state, props.queryResultSnapshot), props)
      },
      mapDispatch,
      (stateProps, dispatchProps, ownProps) => {
        const { queryResultSnapshot, ...props } = ownProps
        return { ...props, ...stateProps, ...dispatchProps }
      }
    )(Component)
    function QueryResultsConnection(props) {
      const snapshot = useRenderSnapshot()
      return <Connected {...props} queryResultSnapshot={snapshot} />
    }
    return QueryResultsConnection
  }
}
