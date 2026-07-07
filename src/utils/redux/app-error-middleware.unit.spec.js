// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"

import * as ActionTypes from "constants/action-types"
import { setAppError } from "actions/app-action-creators"
import appErrorMiddleware from "./app-error-middleware"

chai.use(spies)

function applyMiddlewareAndReturnSpies(action) {
  const next = sinon.spy()
  const dispatch = sinon.spy()
  appErrorMiddleware()({ dispatch })(next)(action)
  return {
    next,
    dispatch
  }
}

describe("appErrorMiddleware", () => {
  it("should dispatch setAppError on CHART_RENDER_ERROR actions", () => {
    const error = "ERROR"
    const action = { type: ActionTypes.CHART_RENDER_ERROR, error }
    const { dispatch, next } = applyMiddlewareAndReturnSpies(action)
    expect(next).to.have.been.calledWith(action)
    expect(dispatch).to.have.been.calledWith(
      setAppError(action.type, action.error)
    )
  })
  it("should dispatch setAppError on CHART_REDRAW_ERROR actions", () => {
    const error = "ERROR"
    const action = { type: ActionTypes.CHART_REDRAW_ERROR, error }
    const { dispatch, next } = applyMiddlewareAndReturnSpies(action)
    expect(next).to.have.been.calledWith(action)
    expect(dispatch).to.have.been.calledWith(
      setAppError(action.type, action.error)
    )
  })
})
