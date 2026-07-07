// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as DataSourceActions from "actions/data-source-action-creators"
import * as FilterActions from "actions/dashboard-filters-action-creators"
import { all, call, put, select, takeEvery } from "redux-saga/effects"
import action from "utils/redux/action"
import { getColumnMetadata } from "sagas/data-source-sagas"
import {
  redrawAll,
  redrawAllFromDashboardFilter
} from "actions/dc-action-creators"
import Services from "services/immerse"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"
import {
  SET_DASHBOARD_FILTER,
  TOGGLE_BY_NAME
} from "vega/constants/filter-action-types"
import { fitCrossSectionsToFilter } from "charts/raster-chart/cross-section/cross-section"
import { getTablesForDataSource } from "components/join-manager/utils"

export function* handleFilterStateChange({ index, attributes }) {
  const {
    connection: { isMSDEnabled },
    dashboard: { currentDataSource },
    filters
  } = yield select((state) => state)
  const dataSource = isMSDEnabled ? attributes.dataSource : currentDataSource
  const groups = getTablesForDataSource(dataSource)
  const Filter = Services.get("newFilter")
  const cf = Services.get("crossfilter").getCrossfilter(dataSource)
  // a crossfilter applies to a dashboard, so a crossfilter's global filter
  // is a dashboard-wide filter, and not a app-wide filter (such as a global expression filter)
  const oldFilters = yield call(cf.getGlobalFilter)

  const isAddingNewFilter = filters.length > oldFilters.length
  try {
    yield call(Filter.setFilters, dataSource, filters)
    yield put.resolve(redrawAllFromDashboardFilter(groups))
  } catch (error) {
    // If we've just added a new filter and an error is thrown,
    // set the filter to invalid
    if (isAddingNewFilter) {
      yield put(FilterActions.invalidDashboardFilter(index))
    }
  }
}

export function* handleClearAllFilters() {
  const Filter = Services.get("newFilter")
  const { dataSources } = yield select((state) => state.dashboard)
  yield call(Filter.clearAllFilters, Object.keys(dataSources))
  yield put(updateDashboardSaveState())
  yield put(redrawAll(null, true))
}

export function* handleGetFilterSize({ index }) {
  const MAX_CARDINALITY = 2000000
  try {
    const connector = Services.get("DbCon")

    const { value, dataSource } = yield select((state) => state.filters[index])
    const stmt = `SELECT APPROX_COUNT_DISTINCT(${value}) AS n FROM ${dataSource}`

    const result = yield call(connector.queryAsync, stmt)
    const shouldAutosuggest = result[0].n < MAX_CARDINALITY
    yield put(
      action(FilterActions.GET_FILTER_SIZE_SUCCESS, {
        index,
        shouldAutosuggest
      })
    )
  } catch (error) {
    yield put(action(FilterActions.GET_FILTER_SIZE_ERROR, { index, error }))
  }
}

export function* handleGetFilterMinMax({ index, value, filter }) {
  const cf = Services.get("crossfilter").getCrossfilter(filter.dataSource)
  const bounds = yield call(cf.getMinMax, value)
  const minMaxValues = {
    min_val: bounds[0],
    max_val: bounds[1]
  }
  yield put(
    FilterActions.setFilter(index, {
      minMaxValues,
      ...filter,
      expression: null
    })
  )
}

export function* selectFilterDataSourceSaga({ index, dataSource }) {
  const columnMetaData = yield* getColumnMetadata(Services, dataSource)
  yield put(
    DataSourceActions.setSource(
      { filterIndex: index },
      dataSource,
      columnMetaData
    )
  )
  yield put(
    action(FilterActions.SELECT_FILTER_DATA_SOURCE, { index, dataSource })
  )
}

export default function* rootFilterSaga() {
  yield all([
    takeEvery(
      FilterActions.SELECT_FILTER_DATA_SOURCE_REQUEST,
      selectFilterDataSourceSaga
    ),
    takeEvery(FilterActions.REMOVE_INPUT_FILTER, handleFilterStateChange),
    takeEvery(FilterActions.SET_FILTER, handleFilterStateChange),
    takeEvery(FilterActions.CLEAR_ALL_INPUT_FILTERS, handleClearAllFilters),
    takeEvery(FilterActions.GET_FILTER_SIZE_REQUEST, handleGetFilterSize),
    takeEvery(FilterActions.GET_FILTER_MIN_MAX, handleGetFilterMinMax),
    takeEvery(SET_DASHBOARD_FILTER, fitCrossSectionsToFilter),
    takeEvery(TOGGLE_BY_NAME, fitCrossSectionsToFilter)
  ])
}
