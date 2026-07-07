// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { call, put, select } from "redux-saga/effects"
import * as ActionTypes from "../../raster-chart-actions"
import * as rasterUtils from "../../raster-utils"
import Services from "../../../../services/immerse"
import {
  isEmpty,
  isSelectorUsable,
  toSQLAgg
} from "../../../../utils/selector-helpers"
import { getColumnType } from "../../../../actions/selector-action-creators"
import { getGroupedDomain } from "./get-grouped-domain"

export const COLOR_MEASURE_INDEX = 3

export function* getSelectorMetaData(action) {
  let { dimensions } = yield select(rasterUtils.selectChart(action.chartId))
  dimensions = dimensions.filter(isSelectorUsable)
  let result = null
  if (action.selector.type === "POINT" && isEmpty(dimensions)) {
    // Get the geo domain (min / max) for point types
    const { currentDataSource } = yield select((state) => state.dashboard)
    const domain = yield call(
      Services.get("crossfilter").getCrossfilter(
        currentDataSource,
        action.chartId
      ).getPointGeoDomain,
      action.selector,
      action.index
    )

    result = {
      ...action,
      domain,
      type: action.selector.type
    }
  } else if (action.selector.type === "CUSTOM" && isEmpty(dimensions)) {
    const { table } = yield select((state) => state.dashboard)
    const type = yield call(getColumnType, action.selector.value, table)
    const domain = yield call(
      Services.get("crossfilter").getCrossfilter(table, action.chartId)
        .getDomain,
      { ...action.selector, type }
    )

    result = { ...action, domain, type }
  } else if (isEmpty(dimensions)) {
    const { dataSource } = yield select(rasterUtils.selectChart(action.chartId))
    const domain = yield call(
      Services.get("crossfilter").getCrossfilter(dataSource, action.chartId)
        .getDomain,
      action.selector
    )
    const { type, ...rest } = action
    result = { ...rest, domain }
    result.hideOther = true
  } else {
    const { dataSource, measures } = yield select(
      rasterUtils.selectChart(action.chartId)
    )
    const measure = measures[action.index]
    const { id: dashboardId } = yield select((state) => state.dashboard)
    const domain = yield call(
      getGroupedDomain,
      dimensions,
      toSQLAgg({
        ...measure,
        value: rasterUtils.pointValue(measures, action.index)
      }),
      dataSource,
      dashboardId,
      action.chartId
    )
    const { type, ...rest } = action
    result = { ...rest, domain, groupby: true }
  }
  result.initMinMax = result.domain
  yield put(ActionTypes.updateMeasure(result))
  return result
}
