// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"

import * as allActionTypes from "constants/action-types"
import { saveLastChartAction } from "actions/app-action-creators"
import chartUpdateMiddleware from "./chart-update-middleware"

chai.use(spies)

async function applyMiddlewareAndReturnSpies(action) {
  const next = sinon.spy()
  const dispatch = sinon.spy()
  const getState = () => ({ charts: {} })
  await chartUpdateMiddleware()({ dispatch, getState })(next)(action)
  return {
    next,
    dispatch
  }
}

describe("chartUpdateMiddleware", () => {
  it("should not dispatch saveLastChartAction on Chart Update Action Types without proper payload", async () => {
    const types = Object.keys(allActionTypes)
    const actions = types.map((type) => ({ type, payload: {} }))
    actions.forEach(async (action) => {
      const { next } = await applyMiddlewareAndReturnSpies(action)
      expect(next).to.have.been.calledWith(action)
    })
  })

  it("should dispatch saveLastChartAction on Chart Update Action Types with proper payload", async () => {
    const sortColumnAction = {
      type: "UPDATE_CHART",
      payload: {
        sortColumn: {}
      }
    }
    const orderColumnAction = {
      type: "UPDATE_CHART",
      payload: {
        ordering: {}
      }
    }
    const resultFromSort = await applyMiddlewareAndReturnSpies(sortColumnAction)
    const resultFromOrdering = await applyMiddlewareAndReturnSpies(
      orderColumnAction
    )
    expect(resultFromSort.dispatch).to.have.been.calledWith(
      saveLastChartAction(sortColumnAction)
    )
    expect(resultFromOrdering.dispatch).to.have.been.calledWith(
      saveLastChartAction(orderColumnAction)
    )
  })
})
