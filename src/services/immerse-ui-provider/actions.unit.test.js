// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  SET_IMMERSE_UI_KEY,
  SET_IMMERSE_UI_KEYS,
  ENABLE_ALL_IMMERSE_UI_KEYS,
  DISABLE_ALL_IMMERSE_UI_KEYS
} from "./constants"

import {
  setImmerseUIKey,
  setImmerseUIKeys,
  enableAllImmerseUIKeys,
  disableAllImmerseUIKeys
} from "./actions"

describe("immerse ui provider actions test suite", () => {
  it("can setImmerseUIKey", () => {
    expect(setImmerseUIKey("able", "baker")).toEqual({
      type: SET_IMMERSE_UI_KEY,
      payload: { key: "able", value: "baker" }
    })
  })
  it("can setImmerseUIKeys", () => {
    const payload = { x: true, y: false }
    expect(setImmerseUIKeys(payload)).toEqual({
      type: SET_IMMERSE_UI_KEYS,
      payload
    })
  })
  it("can enableAllImmerseUIKeys", () => {
    expect(enableAllImmerseUIKeys()).toEqual({
      type: ENABLE_ALL_IMMERSE_UI_KEYS
    })
  })
  it("can disableAllImmerseUIKeys", () => {
    expect(disableAllImmerseUIKeys()).toEqual({
      type: DISABLE_ALL_IMMERSE_UI_KEYS
    })
  })
})
