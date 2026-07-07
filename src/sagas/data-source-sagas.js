// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as DashboardActions from "actions/dashboard-action-creators"
import * as DataSourceActions from "actions/data-source-action-creators"
import * as RasterChartActions from "charts/raster-chart/raster-chart-actions"
import * as ActionTypes from "constants/action-types"
import { all, call, put, select, takeEvery } from "redux-saga/effects"
import { clearSelector } from "actions/charts-action-creators"
import { updateChart } from "actions/update-chart-action-creator"
import { updateChartType } from "actions/update-chart-type-action-creators"
import Services from "services/immerse"
import R from "ramda"
import { isGeoTypeSupportedRasterChart } from "charts/raster-chart/raster-utils"
import { clearMultiSource } from "actions/chart-editor-multisource-action-creators"
import { clearCrossFilters } from "vega/actions/filter-action-creators"
import {
  getActiveFilterDataSources,
  getActiveChartDataSources
} from "utils/currently-active-datasources"
import { getTablesForDataSource } from "components/join-manager/utils"

const hasJoinDatasource = (chartType) =>
  isGeoTypeSupportedRasterChart(chartType)

export function allSources(state) {
  const charts = getActiveChartDataSources(state)
  const filters = getActiveFilterDataSources(state)
  return R.compose(
    R.reduce((accum, data) => R.merge({ [data]: true }, accum), {}),
    R.concat(charts)
  )(filters)
}

export function* cleanUpDataSources() {
  const { isMSDEnabled } = yield select((state) => state.connection)
  if (isMSDEnabled) {
    const currentSources = yield select(allSources)
    const dataSources = yield select(
      R.compose(R.prop("dataSources"), R.prop("dashboard"))
    )
    for (const source in dataSources) {
      if (!currentSources[source]) {
        yield put(DashboardActions.deleteDataSource(source))
      }
    }
  }
}

export function* resetChart(chartId, multiSourceIndex) {
  const { measures, dimensions, type } = yield select(
    (state) => state.charts[chartId]
  )

  if (R.isNil(multiSourceIndex)) {
    for (let i = 0; i < measures.length; i += 1) {
      if (measures[i].value) {
        yield put(
          clearSelector(chartId, {
            type: "measures",
            index: i
          })
        )
      }
    }
    for (let i = 0; i < dimensions.length; i += 1) {
      if (dimensions[i].value) {
        yield put(
          clearSelector(chartId, {
            type: "dimensions",
            index: i
          })
        )
      }
    }

    if (hasJoinDatasource(type)) {
      yield put(RasterChartActions.removeJoinDataSource(chartId))
    }

    yield put(updateChart(chartId, { title: "" }))
    yield put(updateChartType(chartId, type))
  } else {
    yield put(clearMultiSource(chartId, multiSourceIndex))
  }
}

export function* getColumnMetadata(services, dataSource) {
  const DbCon = services.get("DbCon")
  const CrossFilter = services.get("CrossFilter")
  const cfManager = services.get("crossfilter")
  const currentCF = yield call(cfManager.getCrossfilter, dataSource)
  if (currentCF) {
    const columnMetadata = yield call(currentCF.getColumns)
    return columnMetadata
  } else {
    const tables = getTablesForDataSource(dataSource)
    const cf = yield call(CrossFilter.crossfilter, DbCon, tables, dataSource)
    yield call(cf.getFieldsAsync)
    yield call(cfManager.setCrossfilter, dataSource, cf)
    const columnMetadata = yield call(cf.getColumns)
    return columnMetadata
  }
}

export function* selectDataSourceSaga({
  chartId: { chartId },
  dataSource,
  multiSourceIndex
}) {
  try {
    const ServicesContext = Services
    const columnMetaData = yield* getColumnMetadata(ServicesContext, dataSource)
    yield resetChart(chartId, multiSourceIndex)
    yield put(clearCrossFilters(chartId))

    yield put(
      DataSourceActions.setSource(
        { chartId },
        dataSource,
        columnMetaData,
        multiSourceIndex
      )
    )
    yield put(
      RasterChartActions.maybeAutoPopulateRasterMeasure(chartId, columnMetaData)
    )
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Error setting data source", e)
  }
}

export function* selectJoinDataSourceSaga({ chartId, dataSource }) {
  const ServicesContext = Services
  const columnMetaData = yield* getColumnMetadata(ServicesContext, dataSource)

  yield put({
    type: DataSourceActions.SELECT_GEO_JOIN_DATA_SOURCE,
    chartId,
    dataSource
  })

  yield put(RasterChartActions.updateGeoJoinColumn(chartId, null))

  yield put(DashboardActions.setJoinTableMetadata(dataSource, columnMetaData))
}

export function* clearJoinDataSourceSaga({ chartId, dataSource }) {
  yield put(RasterChartActions.removeJoinDataSource(chartId))

  yield put(DashboardActions.clearJoinTable(dataSource))
}

export default function* rootDataSourceSaga() {
  yield all([
    takeEvery("CLEAR_ALL_INPUT_FILTERS", cleanUpDataSources),
    takeEvery("REMOVE_INPUT_FILTER", cleanUpDataSources),
    takeEvery("APPLY_CHART_EDITS", cleanUpDataSources),
    takeEvery("DELETE_CHART", cleanUpDataSources),
    takeEvery("OMNIFILTERS/CLEAR_GLOBAL", cleanUpDataSources),
    takeEvery(ActionTypes.CLEAR_CHART_FILTERS, cleanUpDataSources),
    takeEvery(
      DataSourceActions.SELECT_DATA_SOURCE_REQUEST,
      selectDataSourceSaga
    ),
    takeEvery(
      DataSourceActions.SELECT_GEO_JOIN_DATA_SOURCE_REQUEST,
      selectJoinDataSourceSaga
    ),
    takeEvery(
      DataSourceActions.CLEAR_GEO_JOIN_DATA_SOURCE_REQUEST,
      clearJoinDataSourceSaga
    )
  ])
}
