// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { NUM_RESULTS } from "actions/autosuggest-action-creators"
import { escapeSqlString } from "vega/constants/filter-types"
import { makeCached, getSharedCache } from "utils/performance/MagicCache"
import { enqueue, QUEUE_RESOLUTION } from "utils/performance/MagicQueue"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import buildFilterString from "services/ImmerseCrossFilter/build-filter-string"
import Services from "services/immerse"

export const START_GET_DISTINCT_COLUMN_VALUES_REQUEST =
  "START_GET_DISTINCT_COLUMN_VALUES_REQUEST"
export const GET_DISTINCT_COLUMN_VALUES_SUCCESS =
  "GET_DISTINCT_COLUMN_VALUES_SUCCESS"
export const GET_DISTINCT_COLUMN_VALUES_ERROR =
  "GET_DISTINCT_COLUMN_VALUES_ERROR"
export const CLEAR_DISTINCT_COLUMN_VALUES = "CLEAR_DISTINCT_COLUMN_VALUES"
export const GET_COLUMN_MIN_MAX_SUCCESS = "GET_COLUMN_MIN_MAX_SUCCESS"
export const GET_COLUMN_MIN_MAX_ERROR = "GET_COLUMN_MIN_MAX_ERROR"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const startDistinctColumnValues = (dataSource, column, requestTime) => ({
  type: START_GET_DISTINCT_COLUMN_VALUES_REQUEST,
  dataSource,
  column,
  requestTime
})

const getDistinctColumnValuesSuccess = (
  dataSource,
  column,
  data,
  requestTime
) => ({
  type: GET_DISTINCT_COLUMN_VALUES_SUCCESS,
  dataSource,
  column,
  data,
  requestTime
})

const getDistinctColumnValuesError = (dataSource, column, error) => ({
  type: GET_DISTINCT_COLUMN_VALUES_ERROR,
  dataSource,
  column,
  error
})

const getColumnMinMaxSuccess = (dataSource, column, data) => ({
  type: GET_COLUMN_MIN_MAX_SUCCESS,
  dataSource,
  column,
  data
})

const getColumnMinMaxError = (dataSource, column, error) => ({
  type: GET_COLUMN_MIN_MAX_ERROR,
  dataSource,
  column,
  error
})

const FAKE_FILTER_PANEL_CHART = "FAKE_FILTER_PANEL_CHART"

export const getDistinctColumnValues = ({
  dataSource,
  column,
  searchTerm,
  // Defaulting to match the filter dropdown limit for consistency
  limit = NUM_RESULTS,
  excludeNulls = false,
  ignoredDashboardFilters = [],
  ignoreAllFilters = false
}) => {
  const requestTime = Date.now()
  let whereClause = excludeNulls ? `where ${column} is not null` : ""

  if (searchTerm) {
    whereClause = `where ${column} ILIKE '%${escapeSqlString(searchTerm)}%'`
  }

  const connector = Services.get("DbCon")
  const crossfilter = Services.get("crossfilter").getCrossfilter(
    dataSource,
    FAKE_FILTER_PANEL_CHART
  )

  if (
    getFeatureFlag(available_feature_flags.FILTERS_ACCEPT_FILTERS) &&
    crossfilter &&
    !ignoreAllFilters
  ) {
    const filterString = process(
      buildFilterString(FAKE_FILTER_PANEL_CHART, {
        tables: crossfilter.getTables(),
        dataSource: crossfilter.getDataSource(),
        useFakeChart: true,
        excludeFilters: ignoredDashboardFilters
      }),
      { trackUsage: false }
    )

    if (filterString) {
      whereClause = whereClause
        ? `${whereClause} AND (${filterString})`
        : `WHERE ${filterString}`
    }
  }

  const cachedQuery = makeCached(
    enqueue(
      async ({ query }) => {
        return connector.queryAsync(query)
      },
      {
        key: `getDistinctColumnValues`,
        delay: 200,
        resolution: QUEUE_RESOLUTION.SHARED
      }
    ),
    {
      maxCacheSize: 100,
      keyAge: 60 * 60 * 1000, // 1 hour
      memoizer: ({ query }) => query,
      cache: getSharedCache("getDistinctColumnValues")
    }
  )

  const query = `SELECT ${column} as col, count(*) as num FROM ${dataSource} ${whereClause} group by col order by num desc limit ${limit}`
  const cardinalityQuery = `SELECT approx_count_distinct(${column}) as num FROM ${dataSource}`

  return async (dispatch, getState, services) => {
    try {
      let cardinality = 0
      const max_cardinality = getFeatureFlag(
        available_feature_flags.AUTOCOMPLETE_TABLE_LIMIT
      )

      if (max_cardinality >= 0) {
        try {
          cardinality = await cachedQuery({
            query: process(cardinalityQuery, { trackUsage: false }),
            connector
          })

          if (cardinality[0].num > max_cardinality) {
            return
          }
        } catch (e) {
          // couldn't get cardinality? ehh, it's probably fine. Just wing it and continue.
        }
      }
      dispatch(startDistinctColumnValues(dataSource, column, requestTime))
      const data = await cachedQuery({
        query: process(query, { trackUsage: false }),
        services
      })
      dispatch(
        getDistinctColumnValuesSuccess(dataSource, column, data, requestTime)
      )
    } catch (e) {
      dispatch(getDistinctColumnValuesError(dataSource, column, e, requestTime))
    }
  }
}

export const clearDistinctColumnValues = (dataSource, column) => ({
  type: CLEAR_DISTINCT_COLUMN_VALUES,
  dataSource,
  column
})

export const getColumnMinMax = (dataSource, column) => {
  const query = `SELECT min(${column}) as '${column}_min', max(${column}) as '${column}_max' FROM ${dataSource}`
  return function executeSQLThunk(dispatch, getState, services) {
    return services
      .get("DbCon")
      .queryAsync(process(query, { trackUsage: false }))
      .then((data) => {
        dispatch(getColumnMinMaxSuccess(dataSource, column, data))
      })
      .catch((error) => {
        dispatch(getColumnMinMaxError(dataSource, column, error))
      })
  }
}
