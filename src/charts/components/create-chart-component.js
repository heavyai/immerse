// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  setChartHasError,
  setChartDCFlag,
  setCustomDefaultOtherColorValue
} from "actions/charts-action-creators"
import { addCustomColorDomain } from "actions/charts-color-action-creators"
import { updateChart as updateChartAction } from "actions/update-chart-action-creator"
import {
  chartRenderError,
  chartRenderRequest,
  chartRenderSuccess
} from "actions/dc-action-creators"
import { chartSpecShape, crossfilterShape } from "constants/prop-types"
import { map, prop, path } from "ramda"
import React, { Component } from "react"
import PropTypes from "prop-types"
import addChartEventListeners from "charts/utils/add-chart-event-listeners"
import dc from "services/dc"
import { diff } from "utils/helpers"
import equals from "ramda/src/equals"
import listeners from "charts/utils/event-listeners"
import { mapBinnedDimensions } from "utils/map-binned-dimensions"
import { valueContainsParameter } from "components/parameters/utils"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"
import { getTablesForDataSource } from "components/join-manager/utils"

const addBaseEventListeners = addChartEventListeners(listeners)
const mapValues = map(prop("value"))

function applyFilters(chart, { filters, areFiltersInverse }) {
  filters.forEach((filterValue) => {
    chart.filter(filterValue, areFiltersInverse)
  })
}

function dimensionValuesChanged(dimensions, nextDimensions) {
  const dimensionValues = mapValues(dimensions)
  const nextDimensionValues = mapValues(nextDimensions)
  return !equals(dimensionValues, nextDimensionValues)
}

const hasChangedParameterValues = (selectors, parameterValuesChanges) =>
  parameterValuesChanges &&
  Object.keys(parameterValuesChanges).some((parameterName) =>
    selectors.some((selector) =>
      valueContainsParameter(selector.value, parameterName)
    )
  )

function shouldDestroyCallRender(
  changes,
  { type, dimensions, measures },
  nextChart,
  parameterValueChanges
) {
  if (
    hasChangedParameterValues(dimensions, parameterValueChanges) ||
    hasChangedParameterValues(measures, parameterValueChanges)
  ) {
    return true
  }

  if (
    changes.dimensions &&
    dimensionValuesChanged(dimensions, nextChart.dimensions)
  ) {
    return true
  } else if (
    changes.measures &&
    type === "number" &&
    path([0, "value"], measures) !== path([0, "value"], nextChart.measures)
  ) {
    return true
  } else {
    return false
  }
}

function isSelectorLoading({ measures, dimensions }) {
  return (
    (measures && measures.some((measure) => measure.loading)) ||
    (dimensions && dimensions.some((dimension) => dimension.loading))
  )
}

export default function createChartComponent(
  createChart,
  updateChart,
  addListeners = addBaseEventListeners
) {
  class Chart extends Component {
    static propTypes = {
      allChartsInitialized: PropTypes.bool.isRequired,
      chart: chartSpecShape.isRequired,
      crossfilter: crossfilterShape.isRequired,
      dispatch: PropTypes.func.isRequired,
      hasError: PropTypes.bool.isRequired,
      id: PropTypes.string.isRequired
    }

    constructor(props) {
      super(props)
      this.dcChart = null
      this.renderEpoch = 0
      this.createChart = createChart(props.crossfilter, this.props.dispatch)
      this.updateChart = updateChart(this.props.dispatch, this.props.id)
      this.addChartEventListeners = addListeners(props)
    }

    componentDidMount() {
      if (!this.props.hasError && !isSelectorLoading(this.props.chart)) {
        this.createAndRenderChart(this.props.chart)
      }
    }

    UNSAFE_componentWillReceiveProps({ chart: nextChart, parameterValues }) {
      const changes = diff(this.props.chart, nextChart)
      const parameterValueChanges = diff(
        this.props.parameterValues,
        parameterValues
      )
      const hasChanged =
        Object.keys(changes).length ||
        hasChangedParameterValues(
          nextChart.dimensions,
          parameterValueChanges
        ) ||
        hasChangedParameterValues(nextChart.measures, parameterValueChanges)
      if (hasChanged) {
        if (this.dcChart) {
          if (
            shouldDestroyCallRender(
              changes,
              this.props.chart,
              nextChart,
              parameterValueChanges
            )
          ) {
            this.shouldCallReactRender = true
            return Promise.resolve()
          } else if (this.createChartPromise) {
            return this.createChartPromise.then(() => {
              this.updateChart(
                this.dcChart,
                Object.assign({}, changes),
                Object.assign({}, nextChart)
              )
            })
          }
        } else {
          return this.createAndRenderChart(nextChart)
        }
      }

      return Promise.resolve()
    }

    shouldComponentUpdate() {
      if (this.shouldCallReactRender) {
        this.shouldCallReactRender = false
        return true
      }
      return false
    }

    componentDidUpdate() {
      this.createAndRenderChart(this.props.chart)
    }

    componentWillUnmount() {
      this.destroyChart()
    }

    syncChartStateWithAppState = () => {
      if (
        this.props.chart.type === "histogram" &&
        this.props.chart.dimensions[1]
      ) {
        this.props.dispatch(
          addCustomColorDomain(
            this.props.id,
            this.props.chart.dimensions[1].value,
            this.dcChart.series().selected().slice(),
            "other"
          )
        )
      } else {
        this.props.dispatch(
          setCustomDefaultOtherColorValue(
            this.props.id,
            "Default",
            "defaultOtherDomain",
            true
          )
        )
      }
    }

    chartRenderSuccess = () =>
      this.props.dispatch(
        chartRenderSuccess(
          this.props.id,
          this.props.dashboardId,
          this.props.tabId
        )
      )

    renderChart = (chartSpec, epoch) => (dcChart) => {
      if (this.renderEpoch === epoch) {
        const allBinParams = mapBinnedDimensions(chartSpec.dimensions)
        dcChart.binParams(allBinParams)
        applyFilters(dcChart, chartSpec)
        dcChart.id = this.props.id
        if (
          typeof dcChart.isCountChart === "function" &&
          !dcChart.isCountChart()
        ) {
          this.addChartEventListeners(dcChart)
        }
        this.dcChart = dcChart
        // eslint-disable-next-line no-underscore-dangle
        this.props.dispatch(setChartDCFlag(this.props.id, dcChart.__dcFlag__))

        if (this.props.allChartsInitialized) {
          this.props.dispatch(
            updateChartAction(this.props.id, { loading: true })
          )
          return dcChart.renderAsync().then(() => {
            this.props.dispatch(
              updateChartAction(this.props.id, { loading: false })
            )
            this.chartRenderSuccess()
            this.syncChartStateWithAppState(dcChart)
          })
        } else {
          this.chartRenderSuccess()
          return Promise.resolve()
        }
      } else {
        return Promise.resolve()
      }
    }

    createAndRenderChart = (chartSpec) => {
      const epoch = this.renderEpoch + 1
      this.renderEpoch = epoch
      this.props.dispatch(chartRenderRequest(this.props.id))
      this.createChartPromise = this.createChart(
        chartSpec,
        this.chartRef,
        this.props.id
      )

      return this.createChartPromise
        .then(this.renderChart(chartSpec, epoch))
        .catch((e) => {
          this.props.dispatch(
            updateChartAction(this.props.id, { loading: false })
          )

          // Why both `chartRenderError` and `setChartHasError`? Read on.
          if (!getFeatureFlag(available_feature_flags.CHART_LEVEL_ERRORS)) {
            // If chart level errors are enabled, the error should only be displayed on the chart.
            this.props.dispatch(chartRenderError(e, this.props.id))
          }
          //
          // `chartRenderError` sets an `error` and `id` in state.dc.render while `setChartHasError`
          // sets `hasError` on a single chart in state.charts[]. `chartRenderError` has a side effect
          // of triggering the error modal (among other possible side effects).
          //
          // `setChartHasError` prevent `createAndRenderChart` from being called again if it errors out
          // the first time (see `this.props.hasError` logic in `componentDidMount`)
          this.props.dispatch(setChartHasError(this.props.id, e))
        })
    }

    setChartRef = (node) => {
      this.chartRef = node
    }

    destroyChart = () => {
      if (this.dcChart) {
        this.dcChart.on("filtered", null)
        this.dcChart.filterAll()
        this.dcChart.resetSvg()
        this.dcChart.destroyChart()
        const tables = getTablesForDataSource(this.props.chart.dataSource)
        dc.deregisterChart(this.dcChart, tables)
      }
    }

    render() {
      return <div id={`chart${this.props.id}`} ref={this.setChartRef} />
    }
  }

  return Chart
}
