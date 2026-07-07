// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Component } from "react"
import PropTypes from "prop-types"
import { chartSpecShape } from "constants/prop-types"
function isSelectorLoading({ measures, dimensions }) {
  return (
    measures.some((measure) => measure.loading) ||
    dimensions.some((dimension) => dimension.loading)
  )
}

const createSagaChart = (createChart, updateChart) =>
  class SagaChartComponent extends Component {
    static propTypes = {
      chart: chartSpecShape.isRequired,
      dispatch: PropTypes.func.isRequired,
      hasError: PropTypes.bool.isRequired,
      id: PropTypes.string.isRequired
    }

    componentDidMount() {
      if (!this.props.hasError && !isSelectorLoading(this.props.chart)) {
        this.props.dispatch(createChart(this.props.id, this.props.chart))
      }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
      if (
        this.props.chart.width !== nextProps.chart.width ||
        this.props.chart.height !== nextProps.chart.height
      ) {
        this.props.dispatch(
          updateChart(this.props.id, {
            width: nextProps.chart.width,
            height: nextProps.chart.height
          })
        )
      }
    }

    shouldComponentUpdate() {
      return false
    }

    render() {
      return <div id={`chart${this.props.id}`} />
    }
  }

export default createSagaChart
