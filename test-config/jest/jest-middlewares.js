// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { navigationMiddleware } from "services/navigation"
import { withExtraArgument } from "redux-thunk"
import promiseMiddleware from "redux-promise-middleware"
import createSagaMiddleware from "redux-saga"
import appErrorMiddleware from "../../src/utils/redux/app-error-middleware"
import { applyDelay } from "../../src/utils/redux/delay-middleware"
import trackingMiddleware from "../../src/utils/redux/tracking-middleware"
import chartEditorErrorHandlingMiddleware from "../../src/utils/redux/chart-editor-error-handler-middleware"
import chartUpdateMiddleware from "../../src/utils/redux/chart-update-middleware"
import MapD from "../../src/services/mapd"

const sagaMiddleware = createSagaMiddleware()

export default [
  navigationMiddleware(history),
  sagaMiddleware,
  withExtraArgument(MapD),
  promiseMiddleware(),
  applyDelay(),
  appErrorMiddleware(),
  trackingMiddleware(),
  chartUpdateMiddleware(),
  chartEditorErrorHandlingMiddleware()
]
