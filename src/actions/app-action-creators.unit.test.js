// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as actions from "./app-action-creators"
import { RESET_APP_ERROR } from "constants/action-types"

describe("App Action Creators", () => {
  describe("resetAppError", () => {
    it("should return the proper action", () => {
      const text = RESET_APP_ERROR
      expect(actions.resetAppError().type).toBe(text)
      expect(actions.resetAppError()).toHaveProperty("type", text)
    })
  })
  describe("saveLastChartAction", () => {
    it("should return the proper action", () => {
      const action = {}
      expect(actions.saveLastChartAction(action)).toStrictEqual({
        type: "SAVE_LAST_CHART_ACTION",
        action
      })
    })
  })
  describe("setUserAgent", () => {
    it("should return the proper action when string contains firefox", () => {
      const string = "user agent firefox"
      expect(actions.setUserAgent(string)).toStrictEqual({
        type: "SET_USER_AGENT",
        isFirefox: true
      })
      expect(actions.setUserAgent(string)).toHaveProperty("isFirefox", true)
    })
    it("should return the proper action when string does not contain firefox", () => {
      const string = "user agent chrome"
      expect(actions.setUserAgent(string)).toStrictEqual({
        type: "SET_USER_AGENT",
        isFirefox: false
      })
      expect(actions.setUserAgent(string)).toHaveProperty("isFirefox", false)
    })
  })
})
