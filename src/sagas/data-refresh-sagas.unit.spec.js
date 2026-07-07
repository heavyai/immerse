// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import {
  handleSetStreamingInterval,
  refreshDashboardData
} from "./data-refresh-sagas"
import { expectSaga } from "redux-saga-test-plan"

import * as DashboardActions from "actions/dashboard-action-creators"
import * as ModalTypes from "constants/modal-types"
import * as UIActions from "actions/ui-action-creators"

import { SET_STREAMING_INTERVAL } from "constants/action-types"

describe("Data Refresh Sagas", () => {
  describe("handleSetStreamingInterval", () => {
    it("should handle auto-refresh off and on case", () => {
      const INTERVAL = 10

      return expectSaga(handleSetStreamingInterval, { interval: INTERVAL })
        .call(DashboardActions.stopStreaming)
        .put({ type: SET_STREAMING_INTERVAL, interval: INTERVAL })
        .run()
    })
  })

  describe("refreshDashboardData", () => {
    it("should", () => {
      return expectSaga(refreshDashboardData)
        .withState({
          charts: {},
          dashboard: {
            streaming: { request: false }
            // dataSources: {
            //   "flights": true,
            //   "contribs": true
            // }
          },
          dc: { redrawAll: { pending: false }, initialRender: { done: true } }
        })
        .put(DashboardActions.refreshDashboardRequest())
        .run()
    })
  })
})
