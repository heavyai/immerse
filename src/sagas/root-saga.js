// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { all } from "redux-saga/effects"
import chartEditorSaga from "sagas/chart-editor-saga"
import dataSourceSaga from "sagas/data-source-sagas"
import lineSaga from "charts/line/line-chart-sagas"
import rasterChartSaga from "charts/raster-chart/raster-chart-sagas"
import refreshSagas from "sagas/data-refresh-sagas"
import rootDashboardSaga from "sagas/dashboard-sagas"
import rootFilterSaga from "sagas/dashboard-filter-sagas"
import routingRootSaga from "sagas/route-sagas"

export default function* rootSaga() {
  yield all([
    rasterChartSaga(),
    lineSaga(),
    rootFilterSaga(),
    rootDashboardSaga(),
    dataSourceSaga(),
    refreshSagas(),
    chartEditorSaga(),
    routingRootSaga()
  ])
}
