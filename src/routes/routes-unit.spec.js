// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"
import proxyquire from "proxyquire"

let setDatabaseNameSpy = sinon.spy()
let loadDashboardLinkSpy = sinon.spy()
let setLoadLinkIdSpy = sinon.spy()
const { loadLink, checkConnection, checkForDemo } = proxyquire("./index", {
  "actions/dashboard-action-creators": {
    loadDashboardLink: loadDashboardLinkSpy,
    setLoadLinkId: setLoadLinkIdSpy
  },
  "actions/connection-action-creators": {
    setDatabaseName: setDatabaseNameSpy
  }
})

chai.use(spies)

describe("Routes", () => {
  let dispatch, getState, dispatchGetState, nextState, replace
  beforeEach(() => {
    dispatch = sinon.spy()
    getState = () => ({
      connection: {
        isConnected: true,
        isDemo: false
      }
    })
    dispatchGetState = {
      dispatch,
      getState
    }
    nextState = {
      location: {
        pathname: "/dashboard/123"
      },
      params: {
        database: "heavyai",
        dashboardid: "278fhj78"
      }
    }
    replace = sinon.spy()
  })
})
