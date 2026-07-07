// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"

chai.use(spies)

import {
  getDashboardsRequest,
  getDashboardsError,
  getDashboardsSuccess,
  getDashboards,
  deleteDashboardSuccess,
  deleteDashboardRequest,
  deleteDashboardError,
  deleteDashboard
} from "./dashboards-action-creator"

import {
  GET_DASHBOARDS_ERROR,
  GET_DASHBOARDS_REQUEST,
  GET_DASHBOARDS_SUCCESS
} from "constants/action-types"

import { DELAY_ACTION_TYPE } from "utils/redux/delay-middleware"
import { MS_IN_HALF_SECONDS } from "constants/magic-variables"

describe("Dashboards Action Creators", () => {
  describe("getDashboards", () => {
    let dispatch
    let dispatched = []
    const views = [1, 2, 3, 4, 5]
    const services = new Map()
    const resolve = () => new Promise(resolve => resolve(views))
    const reject = () => new Promise((resolve, reject) => reject())

    beforeEach(() => {
      dispatched = []
      dispatch = sinon.spy(a => dispatched.push(a))
    })

    it("should dispatch request and success on promise success", () => {
      services.set("DbCon", { getDashboardsAsync: resolve })
      const task = getDashboards()
      return task(dispatch, null, services).then(() => {
        expect(dispatched).to.deep.equal([
          getDashboardsRequest(),
          getDashboardsSuccess(views)
        ])
      })
    })

    it("should dispatch request and error on promise error", () => {
      services.set("DbCon", { getDashboardsAsync: reject })
      const task = getDashboards()
      return task(dispatch, null, services).then(() => {
        expect(dispatched).to.deep.equal([
          getDashboardsRequest(),
          getDashboardsError()
        ])
      })
    })
  })

  describe("deleteDashboardAsync", () => {
    let dispatch
    let dispatched = []
    const services = new Map()
    const resolve = () => new Promise(resolve => resolve())
    const reject = () => new Promise((resolve, reject) => reject("ERROR"))

    beforeEach(() => {
      dispatched = []
      dispatch = sinon.spy(a => dispatched.push(a))
    })

    it("should dispatch request and success on promise success", () => {
      services.set("DbCon", { deleteDashboardAsync: resolve })
      const task = deleteDashboard(123)
      return task(dispatch, null, services).then(() => {
        dispatched[1](dispatch)
        dispatched[3].delayed()
        expect(dispatched[0]).to.deep.equal(deleteDashboardRequest(123))
        expect(dispatched[2]).to.deep.equal({ type: "DELETE_DASHBOARD_DONE" })
        expect(dispatched[3].type).to.eql(DELAY_ACTION_TYPE)
        expect(dispatched[3].timeout).to.eql(MS_IN_HALF_SECONDS)
        expect(dispatched[4]).to.deep.equal({
          type: "DELETE_DASHBOARD_SUCCESS",
          id: 123
        })
      })
    })

    it("should dispatch request and error on promise error", () => {
      services.set("DbCon", { deleteDashboardAsync: reject })
      const task = deleteDashboard("TEST")
      return task(dispatch, null, services).then(() => {
        expect(dispatched).to.deep.equal([
          deleteDashboardRequest("TEST"),
          deleteDashboardError("ERROR")
        ])
      })
    })
  })
})
