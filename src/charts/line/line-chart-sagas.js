// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as ActionTypes from "./line-chart-action-creators"
import * as AppActions from "actions/app-action-creators"
import * as ChartActions from "actions/charts-action-creators"
import * as DCActions from "actions/dc-action-creators"
import {
  getCardinality,
  setDimensionBinning
} from "actions/selector-action-creators"
import { addLineChartEventListeners, createLineChartAsync } from "./line"
import { all, call, put, select, takeEvery } from "redux-saga/effects"
import { filter, last } from "ramda"
import { NUMERICAL_AND_TIME_TYPES as BINABLE_TYPES } from "constants/data-types"
import { mergeR } from "utils/ramda-helpers"
import { registry } from "./line-chart-registry"
import Services from "services/immerse"
import { SET_DC_CHART_AXIS_DOMAIN } from "constants/action-types"
import { updateChart } from "actions/update-chart-action-creator"
import { addCustomColorDomain } from "actions/charts-color-action-creators"

function isSelectorUsable({ value, isError, inactive, loading }) {
  return value && !isError && !inactive && !loading
}

function selectChartStateForDCChart(chart) {
  return Object.assign({}, chart, {
    measures: filter(isSelectorUsable, chart.measures),
    dimensions: filter(isSelectorUsable, chart.dimensions)
  })
}

const selectChart = (id) => ({ charts }) => charts[id]

export function getDimensionBinning({ id, dimension, dataSource }) {
  if (BINABLE_TYPES[dimension.type]) {
    return Promise.all([
      Services.get("crossfilter")
        .getCrossfilter(dataSource, id)
        .getMinMax(dimension.value),
      getCardinality(dimension.value, dataSource)
    ])
  } else {
    return Promise.resolve()
  }
}

export function* updateChartColors(chart, id, dcChart) {
  if (chart.dimensions[1]) {
    yield put(
      addCustomColorDomain(
        id,
        chart.dimensions[1].value,
        dcChart.focus().series().selected().slice(),
        "other"
      )
    )
    const chartState = yield select(({ charts }) =>
      selectChartStateForDCChart(charts[id])
    )

    yield call(dcChart.setState, chartState)
  } else {
    yield put(
      ChartActions.setCustomDefaultOtherColorValue(
        id,
        "Default",
        "defaultOtherDomain",
        true
      )
    )
  }
}

export function* createAndRenderLineChart({ id, chartSpec }) {
  const node = yield call([document, "getElementById"], `chart${id}`)
  const rangeNode = yield call([document, "getElementById"], `chart${id}-range`)

  if (node === null) {
    return
  }

  try {
    yield put(
      updateChart(id, {
        width: chartSpec.width,
        height: chartSpec.height
      })
    )
    yield put(DCActions.chartRenderRequest(id))

    const { color, measures, dimensions } = yield select(({ charts }) =>
      selectChartStateForDCChart(charts[id])
    )
    const chart = { ...chartSpec, color, measures, dimensions }
    const dcChart = yield call(createLineChartAsync, id, chart, node, rangeNode)
    // eslint-disable-next-line no-underscore-dangle
    const focus = registry[dcChart.__dcFlag__]

    yield call(addLineChartEventListeners, { id }, focus)

    // eslint-disable-next-line no-underscore-dangle
    yield put(ChartActions.setChartDCFlag(id, dcChart.__dcFlag__))
    yield put(updateChart(id, { loading: true }))
    yield call(dcChart.renderAsync)
    if (!(color.customDomain && color.customDomain.length)) {
      yield call(updateChartColors, chart, id, dcChart)
    }
    yield put(updateChart(id, { loading: false }))

    yield put(DCActions.chartRenderSuccess(id))
  } catch (e) {
    yield put(updateChart(id, { loading: false }))
    yield put(DCActions.chartRenderError(e, id))
  }
}

export function* updateLineChart(action) {
  const { dcFlag } = yield select(selectChart(action.id))
  const dcChart = Services.get("dc").getChart(dcFlag)
  if (dcChart) {
    const focus = registry[dcFlag]
    if (action.updates.height) {
      yield call(focus.resize, action.updates.width, action.updates.height)
    } else if (action.updates.renderArea) {
      yield call(focus.renderArea, action.updates.renderArea)
      yield call(focus.renderAsync)
    }
  }
}

export function* updateLineChartWithRange(action) {
  const { dcFlag, ...chart } = yield select(selectChart(action.id))
  const dcChart = Services.get("dc").getChart(dcFlag)
  if (dcChart) {
    const chartState = selectChartStateForDCChart(chart)
    yield call(
      dcChart.setState,
      { ...chartState },
      { updateRange: true, updateFocus: true }
    )
  }
}

export function* removeLineChartMeasure({ id }) {
  const { dcFlag } = yield select(selectChart(id))
  yield* handleDestroyLine({ dcFlag })
}

export function* removeLineChartDimension({ id, index }) {
  const { dcFlag, ...chart } = yield select(selectChart(id))
  const dcChart =
    typeof dcFlag === "number" ? Services.get("dc").getChart(dcFlag) : null

  if (dcChart) {
    yield* handleDestroyLine({ dcFlag })

    if (index === 1) {
      const chartSpec = selectChartStateForDCChart(chart)
      yield* createAndRenderLineChart({ id, chartSpec })
    }
  }
}

export function* setLineChartMeasure(action) {
  try {
    yield put(ActionTypes.addMeasure(action))
    const { type, ...rest } = action
    yield put(ActionTypes.updateMeasure({ ...rest, loading: false }))

    const { dcFlag, ...chart } = yield select(selectChart(action.id))
    const dcChart =
      typeof dcFlag === "number" ? Services.get("dc").getChart(dcFlag) : null

    if (dcChart) {
      const focus = registry[dcFlag]
      const chartState = selectChartStateForDCChart(chart)
      yield call(focus.updateGroupAggregation, chartState)
      yield call(focus.redrawAsync)
    }
  } catch (e) {
    yield put(AppActions.setAppError("CHART_RENDER_ERROR", e))
    yield put(
      ChartActions.updateSelector(
        action.id,
        "measures",
        action.index,
        mergeR({ loading: false, isError: true })
      )
    )
    yield put(updateChart(action.id, { loading: false }))
  }
}

export function* handleMeasureAggType(action) {
  try {
    const { dcFlag, ...chart } = yield select(selectChart(action.id))
    const dcChart =
      typeof dcFlag === "number" ? Services.get("dc").getChart(dcFlag) : null

    if (dcChart) {
      const focus = registry[dcFlag]
      const chartState = selectChartStateForDCChart(chart)
      yield call(focus.updateGroupAggregation, chartState)
      yield call(focus.redrawAsync)
    }
  } catch (e) {
    yield put(AppActions.setAppError("CHART_RENDER_ERROR", e))
    yield put(
      ChartActions.updateSelector(
        action.id,
        "measures",
        action.index,
        mergeR({ loading: false, isError: true })
      )
    )
    yield put(updateChart(action.id, { loading: false }))
  }
}

export function* setLineChartDimension(action) {
  try {
    const { dcFlag, dataSource } = yield select(selectChart(action.id))
    const dcChart =
      typeof dcFlag === "number" ? Services.get("dc").getChart(dcFlag) : null
    if (dcChart) {
      yield* handleDestroyLine({ dcFlag })
    }
    yield put(ActionTypes.addDimension(action))
    const { type, ...rest } = action
    const [domain, cardinality] = yield call(getDimensionBinning, {
      id: action.id,
      dimension: action.selector,
      dataSource
    })
    if (domain) {
      yield put(
        setDimensionBinning(
          action.id,
          "line",
          action.index,
          action.selector,
          domain,
          cardinality
        )
      )
    }
    yield put(ActionTypes.updateDimension({ ...rest, loading: false }))
  } catch (e) {
    yield put(AppActions.setAppError("CHART_RENDER_ERROR", e))
    yield put(
      ChartActions.updateSelector(
        action.id,
        "dimensions",
        action.index,
        mergeR({ loading: false, isError: true })
      )
    )
    yield put(updateChart(action.id, { loading: false }))
  }
}

export function* customColorHandler(action) {
  const { dcFlag, type, ...chart } = yield select(selectChart(action.chartId))
  if (type === "line" || type === "histogram") {
    const dcChart = registry[dcFlag]
    if (dcChart) {
      const chartState = selectChartStateForDCChart(chart)
      yield call(dcChart.setState, { ...chartState })
    }
  }
}

export function* updateLineChartSolidColor(action) {
  try {
    const { dcFlag } = yield select(selectChart(action.id))
    const focusChart = registry[dcFlag]
    focusChart.updateColorSolid(action.updates.color)
    yield call(focusChart.redrawAsync)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)
  }
}

function* handleRangeChartToggleOn({ id }) {
  try {
    const { dcFlag, ...chart } = yield select(selectChart(id))
    const focusChart = registry[dcFlag]
    focusChart.enableRangeChart({ ...chart, id })
    yield call(focusChart.renderAsync)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)
  }
}

function* handleRangeChartToggleOff({ id }) {
  try {
    const { dcFlag } = yield select(selectChart(id))
    const focusChart = registry[dcFlag]
    if (focusChart) {
      focusChart.disableRangeChart()
    }
    yield call(focusChart.renderAsync)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)
  }
}

function* handleExtractUpdate({ id }) {
  try {
    const { dcFlag, ...chart } = yield select(selectChart(id))
    const focusChart = registry[dcFlag]
    if (focusChart) {
      focusChart.setExtractInterval(chart.dimensions[0])
      yield call(focusChart.renderAsync)
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)
  }
}

function* handleDateTruncUpdate({ id }) {
  try {
    const { dcFlag, ...chart } = yield select(selectChart(id))
    const focusChart = registry[dcFlag]
    if (focusChart) {
      focusChart.setDateTruncInterval(chart.dimensions[0])
      yield call(focusChart.renderAsync)
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)
  }
}

function* handleSeriesDimension(action) {
  try {
    const { dcFlag } = yield select(selectChart(action.id))
    const dcChart =
      typeof dcFlag === "number" ? Services.get("dc").getChart(dcFlag) : null
    yield put(ActionTypes.addDimension({ ...action, loading: false }))
    if (dcChart) {
      const chart = yield select(selectChart(action.id))
      const focusChart = registry[dcFlag]
      focusChart.setSeriesDimension(action.id, chart, [
        last(chart.filters),
        last(chart.rangeFilter)
      ])
      yield call(focusChart.renderAsync)
      yield put(
        addCustomColorDomain(
          action.id,
          chart.dimensions[1].value,
          focusChart.focus().series().selected().slice(),
          "other"
        )
      )
      const chartState = yield select(({ charts }) =>
        selectChartStateForDCChart(charts[action.id])
      )

      yield call(focusChart.setState, chartState)
    }
  } catch (e) {
    yield put(AppActions.setAppError("CHART_RENDER_ERROR", e))
    yield put(
      ChartActions.updateSelector(
        action.id,
        "dimensions",
        action.index,
        mergeR({ loading: false, isError: true })
      )
    )
    yield put(updateChart(action.id, { loading: false }))
  }
}

function* handleDestroyLine({ dcFlag }) {
  const focusChart = registry[dcFlag]
  if (focusChart) {
    yield call(focusChart.destroyChart)
  }
}

function* setDcChartAxisdomain({ chartId, axisType, minMax }) {
  const { dcFlag } = yield select(selectChart(chartId))
  const dcChart =
    typeof dcFlag === "number" ? Services.get("dc").getChart(dcFlag) : null
  if (dcChart) {
    yield call(dcChart[axisType]().domain, minMax)
    yield call(dcChart.renderAsync)
  }
}

function* handleBinExtentUpdate(action) {
  const { dcFlag, ...chart } = yield select(selectChart(action.id))
  const dcChart =
    typeof dcFlag === "number" ? Services.get("dc").getChart(dcFlag) : null
  if (dcChart) {
    const focusChart = registry[dcFlag]
    yield call(focusChart.updateBinExtent, chart)
    yield call(focusChart.redrawAsync)
  }
}

function* handleLineChartReset({ id, spec }) {
  const { dcFlag } = yield select(selectChart(id))
  yield* handleDestroyLine({ dcFlag })
  yield* createAndRenderLineChart({ id, chartSpec: spec })
}

function* handleClearFilters({ id }) {
  const { dcFlag } = yield select(selectChart(id))
  const dcChart = Services.get("dc").getChart(dcFlag)
  if (dcChart) {
    const focus = registry[dcFlag]
    yield call(focus.filter, [])
    yield call(focus.redrawAsync)
  }
}

function* handleToggleBinning({ id }) {
  const { dcFlag, ...chart } = yield select(selectChart(id))
  const focusChart = registry[dcFlag]
  if (focusChart) {
    yield call(focusChart.toggleBinning, chart)
    yield call(focusChart.redrawAsync)
  }
}

export default function* root() {
  yield all([
    takeEvery(ActionTypes.TOGGLE_BINNING, handleToggleBinning),
    takeEvery(ActionTypes.CLEAR_LINE_CHART_FILTERS, handleClearFilters),
    takeEvery(ActionTypes.RESET_LINE_CHART, handleLineChartReset),
    takeEvery(ActionTypes.UPDATE_NUM_BINS, handleBinExtentUpdate),
    takeEvery(ActionTypes.UPDATE_BIN_EXTENT, handleBinExtentUpdate),
    takeEvery(SET_DC_CHART_AXIS_DOMAIN, setDcChartAxisdomain),
    takeEvery(ActionTypes.DESTROY_LINE_CHART, handleDestroyLine),
    takeEvery(ActionTypes.UPDATE_LINE_MEASURE_AGGTYPE, handleMeasureAggType),
    takeEvery(
      ActionTypes.SET_LINE_CHART_SERIES_DIMENSION,
      handleSeriesDimension
    ),
    takeEvery(ActionTypes.UPDATE_DATETRUNC_INTERVAL, handleDateTruncUpdate),
    takeEvery(ActionTypes.UPDATE_EXTRACT_INTERVAL, handleExtractUpdate),
    takeEvery(ActionTypes.TOGGLE_RANGE_CHART_ON, handleRangeChartToggleOn),
    takeEvery(ActionTypes.TOGGLE_RANGE_CHART_OFF, handleRangeChartToggleOff),
    takeEvery(ActionTypes.UPDATE_LINE_SOLID_COLOR, updateLineChartSolidColor),
    takeEvery(ActionTypes.CREATE_LINE_CHART, createAndRenderLineChart),
    takeEvery(ActionTypes.SET_LINE_CHART_MEASURE, setLineChartMeasure),
    takeEvery(ActionTypes.SET_LINE_CHART_DIMENSION, setLineChartDimension),
    takeEvery(ActionTypes.UPDATE_LINE_CHART, updateLineChart),
    takeEvery(ActionTypes.REMOVE_LINE_CHART_MEASURE, removeLineChartMeasure),
    takeEvery(
      ActionTypes.REMOVE_LINE_CHART_DIMENSION,
      removeLineChartDimension
    ),
    takeEvery(
      ActionTypes.UPDATE_LINE_CHART_DIMENSION,
      updateLineChartWithRange
    ),
    takeEvery(ActionTypes.UPDATE_LINE_CHART_MEASURE, updateLineChartWithRange),
    takeEvery("ADD_CUSTOM_COLOR", customColorHandler),
    takeEvery("SET_CUSTOM_COLOR", customColorHandler),
    takeEvery("REMOVE_CUSTOM_COLOR", customColorHandler),
    takeEvery("SET_CUSTOM_DEFAULT_OTHER_COLOR", customColorHandler),
    takeEvery("TOGGLE_OTHER", customColorHandler)
  ])
}
