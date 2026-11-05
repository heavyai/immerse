// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { applyMiddleware, compose, createStore } from "redux"
import appErrorMiddleware from "utils/redux/app-error-middleware"
import { applyDelay } from "utils/redux/delay-middleware"
import chartEditorErrorHandlingMiddleware from "utils/redux/chart-editor-error-handler-middleware"
import chartUpdateMiddleware from "utils/redux/chart-update-middleware"
import cancelAsyncMiddleware from "utils/redux/cancel-async-middleware"
import selectorDefaultUpdateMiddleware from "utils/redux/selector-default-update-middleware"
import clearDashboard from "reducers/clear-dashboard"
import { composeWithDevToolsLogOnlyInProduction as composeWithDevTools } from "@redux-devtools/extension"
import createSagaMiddleware from "redux-saga"
import { createLogger } from "redux-logger"
import dataSourceReducer from "reducers/data-source-higher-order-reducer"
import history from "services/history"
import { navigationMiddleware } from "services/navigation"
import loadDashboard from "reducers/load-dashboard-higher-order-reducer"
import resetAppState from "reducers/reset-app-state-higher-order-reducer"
import rootSaga from "sagas/root-saga"
import { withExtraArgument } from "redux-thunk"
import { vegaResultsMiddleware } from "services/query-results/middleware"
import { createFilterWorkflows } from "services/filter-workflows"
import {
  getQueryRuntime,
  queryLifecycleMiddleware
} from "services/query-runtime"
import promiseMiddleware from "utils/redux/promise-action-middleware"
import { setAutoFreeze } from "immer"
import { createActionMetrics } from "utils/modernization/metrics"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const { REDUX_LOGGING, REDUX_TRACE, REDUX_MAX_AGE } = available_feature_flags

const ignoredActions = {
  SELECTOR_PILL_HOVER: true,
  SELECTOR_PILL_NOT_HOVER: true
}

// turn off immer's auto freezing to allow non-immer reducers
// to modify state (https://immerjs.github.io/immer/freezing/)
setAutoFreeze(false)

export default function createStoreWithServices(
  initialState,
  services,
  reducer
) {
  const sagaMiddleware = createSagaMiddleware()
  const queryRuntime = getQueryRuntime(services)
  const filters = createFilterWorkflows(services)
  let middleware = [
    queryLifecycleMiddleware(queryRuntime),
    filters.middleware,
    navigationMiddleware(history),
    sagaMiddleware,
    withExtraArgument(services),
    promiseMiddleware(),
    applyDelay(),
    appErrorMiddleware(),
    chartUpdateMiddleware(),
    cancelAsyncMiddleware(),
    chartEditorErrorHandlingMiddleware(),
    selectorDefaultUpdateMiddleware(),
    vegaResultsMiddleware(queryRuntime)
  ]

  if (
    process.env.NODE_ENV === "development" &&
    window.immerseModernizationMetrics
  ) {
    middleware.push(createActionMetrics(window.immerseModernizationMetrics))
  }

  if (getFeatureFlag(REDUX_LOGGING)) {
    /* eslint-enable no-process-env */
    middleware = [
      ...middleware,
      createLogger({
        collapsed: true,
        predicate: (_getState, { type }) => !(type in ignoredActions)
      })
    ]
  }

  const higherOrderReducer = compose(
    dataSourceReducer,
    resetAppState,
    clearDashboard,
    loadDashboard
  )

  const reduxtrace = getFeatureFlag(REDUX_TRACE)
  const reduxMaxAge = getFeatureFlag(REDUX_MAX_AGE)

  const store = composeWithDevTools({ trace: reduxtrace, maxAge: reduxMaxAge })(
    applyMiddleware(...middleware)
  )(createStore)(higherOrderReducer(reducer), initialState)

  if (
    process.env.NODE_ENV === "development" &&
    window.immerseModernizationMetrics
  ) {
    window.immerseModernizationMetrics.readQueryOwnership = () => {
      const state = store.getState()
      return {
        reduxChartCache: Object.prototype.hasOwnProperty.call(
          state,
          "chartData"
        ),
        reduxVegaResultCharts: Object.entries(state.charts || {})
          .filter(
            ([, chart]) =>
              ["vega-combo", "box-plot"].includes(chart.type) &&
              chart.data &&
              Object.keys(chart.data).length
          )
          .map(([id]) => id),
        runtimeQueryCharts: Object.keys(queryRuntime.getSnapshot()),
        runtimeRenderCharts: Object.keys(queryRuntime.getRenderSnapshot())
      }
    }
  }

  if (module.hot) {
    module.hot.accept("../reducers", () => {
      store.replaceReducer(reducer)
    })
  }

  const sagaTask = sagaMiddleware.run(rootSaga)

  return {
    ...store,
    services,
    dispose() {
      filters.dispose()
      sagaTask.cancel()
      queryRuntime.dispose()
    }
  }
}
