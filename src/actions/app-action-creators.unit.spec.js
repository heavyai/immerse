// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import * as actions from "./app-action-creators"

describe("App Action Creators", () => {
  describe("setAppError", () => {
    it("should return the proper action", () => {
      const errorType = "UPDATE"
      const error = "error message"
      expect(actions.setAppError(errorType, error)).to.deep.equal({
        type: "SET_APP_ERROR",
        error,
        errorType
      })
    })
  })
  describe("resetAppError", () => {
    it("should return the proper action", () => {
      expect(actions.resetAppError().type).to.eql("RESET_APP_ERROR")
    })
  })
  describe("saveLastChartAction", () => {
    it("should return the proper action", () => {
      const action = {}
      expect(actions.saveLastChartAction(action)).to.deep.equal({
        type: "SAVE_LAST_CHART_ACTION",
        action
      })
    })
  })
  describe("setUserAgent", () => {
    it("should return the proper action when string contains firefox", () => {
      const string = "user agent firefox"
      expect(actions.setUserAgent(string)).to.deep.equal({
        type: "SET_USER_AGENT",
        isFirefox: true
      })
    })
    it("should return the proper action when string does not contain firefox", () => {
      const string = "user agent chrome"
      expect(actions.setUserAgent(string)).to.deep.equal({
        type: "SET_USER_AGENT",
        isFirefox: false
      })
    })
  })
})
