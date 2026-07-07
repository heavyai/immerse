// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as DashboardActions from "actions/dashboard-action-creators"
import * as DCActions from "actions/dc-action-creators"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"

import { all, call, put, select, take, takeEvery } from "redux-saga/effects"

import {
  REFRESH_BINNED_DATA,
  REFRESH_DASHBOARD,
  SET_STREAMING_INTERVAL,
  SET_STREAMING_INTERVAL_REQUEST,
  UPDATE_CHART_BIN_EXTENT
} from "constants/action-types"

import Services from "services/immerse"

import { getDataSource } from "reducers/charts/helpers/multi-source-helpers"
import { comparableValue } from "utils/helpers"
import { MINMAX_TOKEN } from "utils/ImmerseSQLPlusPlus/trackable-tokens"
import { setChartSpecificBinFilters } from "vega/actions/filter-action-creators-crossfilter-interop"
import { CHART_TYPES } from "../constants/charts"

const INTERRUPTED_BOUNDS_REFRESH_MESSAGE =
  "Navigated away from dashboard while updating bounds"

export function* handleSetStreamingInterval(action) {
  yield call(DashboardActions.stopStreaming)

  if (action.interval) {
    yield put(DashboardActions.startStreaming(action.interval))
  }

  yield put({
    type: SET_STREAMING_INTERVAL,
    interval: action.interval
  })

  yield put(updateDashboardSaveState(true))
}

// Refreshes charts when the user clicks the "refresh" button, or sets a refresh
// interval. Does not pertain to vega combo charts, which handle refreshes
// differently (see PR #7157)
export function* refreshDashboardData() {
  const {
    dashboard: { streaming, id, selectedTabId },
    dc: { redrawAll, initialRender }
  } = yield select((s) => s)

  if (!(streaming.request || redrawAll.pending) && initialRender.done) {
    yield put(DashboardActions.refreshDashboardRequest())

    yield* refreshBinnedData({ dashboardId: id, tabId: selectedTabId })

    const dc = Services.get("dc")

    const countCharts = dc.chartRegistry
      .listAll()
      .filter((chart) => chart.isCountChart())

    if (countCharts.length) {
      for (const chart of countCharts) {
        yield call(chart.tot, null)
      }

      yield put.resolve(DCActions.redrawAll(null, true))
    }

    yield put(DashboardActions.refreshDashboardComplete())
  }
}

function* getBounds(d, index, dashboardId, selectedTab) {
  const { chartId, dimension } = d
  const charts = yield select((state) => state.charts)
  const chart = charts[chartId]
  const dataSource = getDataSource(chart, dimension.multiSourceIndex)
  const crossfilter = Services.get("crossfilter")

  const { selectedTabId: newSelectedTab, id: newDashboardId } = yield select(
    (state) => state.dashboard
  )

  const cf = crossfilter.getCrossfilter(
    dataSource,
    chartId,
    dimension.multiSourceIndex
  )

  // It's possible that we've navigated away from the originating dashboard by
  // this point. If this lands while initializing another dashboard,
  // getCrossfilter can return null, so just bail on any outdated request.
  if (
    !cf ||
    (selectedTab && newSelectedTab && selectedTab !== newSelectedTab) ||
    dashboardId !== newDashboardId
  ) {
    throw Error(INTERRUPTED_BOUNDS_REFRESH_MESSAGE)
  }

  const result = { ...d }

  yield cf
    .getMinMax(
      dimension.value,
      {},
      { token: `${MINMAX_TOKEN}/binning/${index}/${d.multiSourceIndex}` }
    )
    .then((bounds) => {
      result.minMaxBounds = bounds
    })
  yield cf
    .getMinMax(
      dimension.value,
      {},
      {
        token: `${MINMAX_TOKEN}/binning/includeFilters/${index}/${d.multiSourceIndex}`,
        ignoreFilters: false
      }
    )
    .then((bounds) => {
      result.currentBounds = bounds
    })

  return result
}

export function* refreshBinnedData({ dashboardId, tabId }) {
  const dc = Services.get("dc")
  const charts = yield select((state) => state.charts)

  const binnableDimensions = Object.keys(charts)
    .filter(
      (chartId) =>
        Array.isArray(charts[chartId].dimensions) && !charts[chartId].dataError
    )
    .reduce(
      (accum, chartId) => [
        ...accum,
        ...charts[chartId].dimensions
          .map((dimension, index) => ({
            chartId,
            index,
            dimension
          }))
          .filter((d) => d.dimension.isBinned)
      ],
      []
    )

  // Go through each binnable dimension and generate:
  //    1. an absolute min/max query that gets the full extent of the dataset
  //    2. a min/max query that includes global filters
  let binnableDimensionsWithBounds = []

  try {
    binnableDimensionsWithBounds = yield all(
      binnableDimensions.map((d, index) =>
        getBounds(d, index, dashboardId, tabId)
      )
    )
  } catch (e) {
    if (e.message !== INTERRUPTED_BOUNDS_REFRESH_MESSAGE) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
    return
  }

  // Go through each binnable dimension, check for differences, and then update
  // min/max and currentHigh/Low as necessary
  for (const d of binnableDimensionsWithBounds) {
    const { dimension, minMaxBounds, currentBounds, chartId, index } = d
    const chart = charts[chartId]
    const [min_val, max_val] = minMaxBounds
    const [currentLowValue, currentHighValue] = currentBounds

    // "comparableValue" is a stupid utility function. It'll return the result of date.getTime()
    // if it's a date object, and otherwise the object itself. Totally would love to swap out
    // this technique for something less dumb.
    const compMin = comparableValue(min_val)
    const compMax = comparableValue(max_val)
    const compCurrLow = comparableValue(currentLowValue)
    const compCurrHigh = comparableValue(currentHighValue)
    const minValDelta = compMin !== comparableValue(dimension.min_val)
    const maxValDelta = compMax !== comparableValue(dimension.max_val)
    const currLowDelta =
      compCurrLow !== comparableValue(dimension.currentLowValue)
    const currHighDelta =
      compCurrHigh !== comparableValue(dimension.currentHighValue)

    if (
      (minValDelta || maxValDelta || currLowDelta || currHighDelta) &&
      !dimension.extentsSet
    ) {
      const updates = {
        min_val: minValDelta ? min_val : dimension.min_val,
        max_val: maxValDelta ? max_val : dimension.max_val,
        currentLowValue:
          !dimension.extentsSet && currLowDelta
            ? currentLowValue
            : dimension.currentLowValue,
        currentHighValue:
          !dimension.extentsSet && currHighDelta
            ? currentHighValue
            : dimension.currentHighValue
      }
      if (chart.type === CHART_TYPES.HEAT) {
        updates.currentLowValue = ![undefined, null].includes(
          dimension.currentLowValue
        )
          ? dimension.currentLowValue
          : updates.currentLowValue
        updates.currentHighValue = ![undefined, null].includes(
          dimension.currentLowValue
        )
          ? dimension.currentHighValue
          : updates.currentHighValue
      }
      yield put({
        type: UPDATE_CHART_BIN_EXTENT,
        chartId,
        index,
        ...updates
      })

      yield put.resolve(setChartSpecificBinFilters(chartId))
    }
  }

  dc.chartRegistry.listAll().forEach((chart) => {
    if (typeof chart.rangeChart === "function" && chart.rangeChart()) {
      const minMax = chart.rangeChart().x().domain().slice()
      chart.xOriginalDomain(minMax)
    }
  })
}

function* takeRefreshDashboardData() {
  while (true) {
    const action = yield take(REFRESH_DASHBOARD)
    yield* refreshDashboardData(action)
  }
}

export default function* rootDataRefreshSagas() {
  yield all([
    takeEvery(SET_STREAMING_INTERVAL_REQUEST, handleSetStreamingInterval),
    takeRefreshDashboardData(),
    takeEvery(REFRESH_BINNED_DATA, refreshBinnedData)
  ])
}
