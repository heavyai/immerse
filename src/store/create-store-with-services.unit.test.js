// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createStoreWithServices from "./create-store-with-services"
import rootReducer from "reducers"

describe("store", () => {
  const store = createStoreWithServices({}, new Map(), rootReducer)

  it("should expose its services", () => {
    store.services.set("getter", true)
    expect(store.services.get("getter")).toEqual(true)
  })

  it("should wrap dispatch in the services middleware", () => {
    store.dispatch(() => (dispatch, getState, services) => {
      services.set("setter", true)
      expect(services.get("setter")).toEqual(true)
    })
  })

  it("should wrap dispatch in the thunk middleware", () => {
    store.dispatch(() => (dispatch) => {
      expect(typeof dispatch).toEqual("function")
    })
  })

  it("should enable services middleware in thunk actions", () => {
    store.dispatch(() => (dispatch, getState, services) => {
      services.set("setter", true)
      expect(services.get("setter")).toEqual(true)
    })
  })
})
