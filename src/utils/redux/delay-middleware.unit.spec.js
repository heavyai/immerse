// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"

chai.use(spies)

import { applyDelay, delay, DELAY_ACTION_TYPE } from "./delay-middleware"

describe("Delay Middleware", () => {
  let timeout
  const middleware = applyDelay()()

  before(() => {
    timeout = window.setTimeout
    window.setTimeout = sinon.spy(timeout)
  })

  after(() => {
    window.setTimeout = timeout
  })

  it("should apply next action if not DELAY_ACTION_TYPE", () => {
    const next = sinon.spy()
    const action = {}
    middleware(next)(action)
    expect(next).to.have.been.calledWith(action)
  })

  it("should pass the delay action to setTimeout if action type is DELAY_ACTION_TYPE", () => {
    const next = sinon.spy()
    const delayed = () => {}
    const time = 5000
    const action = delay(delayed, time)
    middleware(next)(action)

    expect(window.setTimeout).to.have.been.calledWith(delayed, time)
    expect(next).to.have.not.been.called
  })

  describe("delay action creator", () => {
    it("should return the correct action", () => {
      const time = 5000
      const delayed = () => {}
      const action = delay(delayed, time)
      expect(delay(delayed, time)).to.deep.equal({
        type: DELAY_ACTION_TYPE,
        delayed: delayed,
        timeout: time
      })
    })
  })
})
