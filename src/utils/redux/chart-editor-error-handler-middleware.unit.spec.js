// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"

import * as ActionTypes from "constants/action-types"
import middleware, {
  getSetErrorAction
} from "./chart-editor-error-handler-middleware"

chai.use(spies)

function applyMiddlewareAndReturnSpies(state, action) {
  const next = sinon.spy()
  const dispatch = sinon.spy()
  middleware()({ dispatch, getState: () => state })(next)(action)
  return {
    next,
    dispatch
  }
}

describe("chartEditorErrorHandlingMiddleware", () => {
  it("should apply next middleware if there is no error action type", () => {
    const action = { type: "" }
    const state = {
      chartEditor: {
        editId: "1"
      },
      app: {}
    }
    const { dispatch, next } = applyMiddlewareAndReturnSpies(state, action)
    expect(next).to.have.been.calledWith(action)
    expect(dispatch).to.have.not.been.called
  })
  it("should call dispatch if there is an error action type, action id matches edit id, and there is a setErrorAction", () => {
    const action = { type: ActionTypes.CHART_RENDER_ERROR, id: "1" }
    const state = {
      chartEditor: {
        editId: "1"
      },
      app: {
        lastChartUpdateAction: {
          type: ActionTypes.ADD_DIMENSION,
          index: 0
        }
      }
    }
    const { dispatch, next } = applyMiddlewareAndReturnSpies(state, action)
    expect(next).to.have.been.calledWith(action)
    expect(dispatch).to.have.been.calledWith(
      getSetErrorAction(action.id, state.app.lastChartUpdateAction)
    )
  })
})
