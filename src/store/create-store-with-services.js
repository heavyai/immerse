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
import { composeWithDevTools } from "redux-devtools-extension/logOnlyInProduction"
import createSagaMiddleware from "redux-saga"
import { createLogger } from "redux-logger"
import dataSourceReducer from "reducers/data-source-higher-order-reducer"
import history from "services/history"
import { routerMiddleware } from "connected-react-router"
import loadDashboard from "reducers/load-dashboard-higher-order-reducer"
import resetAppState from "reducers/reset-app-state-higher-order-reducer"
import rootSaga from "sagas/root-saga"
import thunk from "redux-thunk"
import promiseMiddleware from "redux-promise-middleware"
import { setAutoFreeze } from "immer"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const { REDUX_LOGGING, REDUX_TRACE, REDUX_MAX_AGE } = available_feature_flags

const ignoredActions = {
  SELECTOR_PILL_HOVER: true,
  SELECTOR_PILL_NOT_HOVER: true
}

const sagaMiddleware = createSagaMiddleware()

// turn off immer's auto freezing to allow non-immer reducers
// to modify state (https://immerjs.github.io/immer/freezing/)
setAutoFreeze(false)

export default function createStoreWithServices(
  initialState,
  services,
  reducer
) {
  let middleware = [
    routerMiddleware(history),
    sagaMiddleware,
    thunk.withExtraArgument(services),
    promiseMiddleware(),
    applyDelay(),
    appErrorMiddleware(),
    chartUpdateMiddleware(),
    cancelAsyncMiddleware(),
    chartEditorErrorHandlingMiddleware(),
    selectorDefaultUpdateMiddleware()
  ]

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

  if (module.hot) {
    module.hot.accept("../reducers", () => {
      store.replaceReducer(reducer)
    })
  }

  sagaMiddleware.run(rootSaga)

  return {
    ...store,
    services
  }
}
