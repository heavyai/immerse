// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import reducer from "./reducer"

import {
  SET_IMMERSE_UI_KEY,
  SET_IMMERSE_UI_KEYS,
  ENABLE_ALL_IMMERSE_UI_KEYS,
  DISABLE_ALL_IMMERSE_UI_KEYS
} from "./constants"

describe("immerse ui provider reducer test suite", () => {
  it("can SET_IMMERSE_UI_KEY", () => {
    const initialState = { a: "b" }
    const newState = reducer(initialState, {
      type: SET_IMMERSE_UI_KEY,
      payload: { key: "a", value: "c" }
    })
    expect(newState).toEqual({ a: "c" })
  })

  it("can SET_IMMERSE_UI_KEYS", () => {
    const initialState = { a: "b", x: "y" }
    const newState = reducer(initialState, {
      type: SET_IMMERSE_UI_KEYS,
      payload: { a: "c", x: "z" }
    })
    expect(newState).toEqual({ a: "c", x: "z" })
  })

  it("can ENABLE_ALL_IMMERSE_UI_KEYS", () => {
    const initialState = { a: false, b: false, c: true }
    const newState = reducer(initialState, {
      type: ENABLE_ALL_IMMERSE_UI_KEYS
    })
    expect(newState).toEqual({ a: true, b: true, c: true })
  })

  it("can DISABLE_ALL_IMMERSE_UI_KEYS", () => {
    const initialState = { a: false, b: false, c: true }
    const newState = reducer(initialState, {
      type: DISABLE_ALL_IMMERSE_UI_KEYS
    })
    expect(newState).toEqual({ a: false, b: false, c: false })
  })
})
