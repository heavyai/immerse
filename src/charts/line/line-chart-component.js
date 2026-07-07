// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { X_ENCODING_INDEX, Y_ENCODING_INDEX } from "./line-chart-constants"
import {
  createLineChart,
  destroyLineChart,
  updateLineChart
} from "./line-chart-action-creators"
import React, { Component } from "react"
import PropTypes from "prop-types"
import { isEqual } from "lodash"
import { connect } from "react-redux"
import MapDCChartAxisOverlay from "components/chart-axis-overlay"
import { createSetter } from "utils/helpers"
import { chartSpecShape } from "constants/prop-types"
import { updateSelectorAction } from "actions/selector-action-creators"
import { makeGetParameterValuesForChart } from "components/parameters/selectors"

function isSelectorLoading({ measures, dimensions }) {
  return (
    measures.some((measure) => measure.loading) ||
    dimensions.some((dimension) => dimension.loading)
  )
}

const mapStateToProps = (state, { id }) => ({
  parameterValues: makeGetParameterValuesForChart(state)(id)
})

const createLineChartComponent = (createChart, updateChart) =>
  class LineChartComponent extends Component {
    static propTypes = {
      chart: chartSpecShape.isRequired,
      dcFlag: PropTypes.number,
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

    shouldComponentUpdate(nextProps) {
      return (
        this.getYAxisLabel(this.props.chart) !==
          this.getYAxisLabel(nextProps.chart) ||
        this.getXAxisLabel(this.props.chart) !==
          this.getXAxisLabel(nextProps.chart) ||
        !isEqual(this.props.parameterValues, nextProps.parameterValues)
      )
    }

    componentWillUnmount() {
      this.props.dispatch(destroyLineChart(this.props.dcFlag, this.props.id))
    }

    getYAxisLabel(chart) {
      const yField = chart.measures[Y_ENCODING_INDEX]

      return typeof chart.yAxisLabel === "string"
        ? chart.yAxisLabel
        : yField.axisLabel || yField.label
    }

    getXAxisLabel(chart) {
      return (
        chart.dimensions[X_ENCODING_INDEX].axisLabel ||
        chart.dimensions[X_ENCODING_INDEX].label
      )
    }

    render() {
      return (
        <div className="line">
          <MapDCChartAxisOverlay
            chartId={this.props.id}
            yAxisLabel={this.getYAxisLabel(this.props.chart)}
            xAxisLabel={this.getXAxisLabel(this.props.chart)}
            updateXAxisLabel={(value) => {
              this.props.dispatch(
                updateSelectorAction(
                  this.props.id,
                  "dimensions",
                  0,
                  createSetter("axisLabel")(value)
                )
              )
            }}
            updateYAxisLabel={(value) => {
              this.props.dispatch(
                updateSelectorAction(
                  this.props.id,
                  "measures",
                  0,
                  createSetter("axisLabel")(value)
                )
              )
            }}
          />

          <div id={`chart${this.props.id}`} />
          <div id={`chart${this.props.id}-range`} />
        </div>
      )
    }
  }

export default function constructor() {
  return connect(mapStateToProps)(
    createLineChartComponent(createLineChart, updateLineChart)
  )
}
