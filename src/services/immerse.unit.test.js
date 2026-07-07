// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Services from "services/immerse"

beforeAll(() => {
  const throwOnAccess = (obj) => {
    const handler = {
      get(target, propKey) {
        return (...args) => {
          throw new Error(
            `Unmocked Services-con called -> ${propKey + JSON.stringify(args)}`
          )
        }
      }
    }
    return new Proxy(obj, handler)
  }

  Services.set("DbCon", throwOnAccess({}))
})

describe("Services services", () => {
  it("should load Services default services", () => {
    expect(Services.get("CrossFilter")).toBeTruthy()
    expect(Services.get("DbCon")).toBeTruthy()
    expect(Services.get("dc")).toBeTruthy()

    expect(Services.get("someRandonService")).toBeFalsy()
  })

  it("set not have __IMMERSE__ access", () => {
    // eslint-disable-next-line no-underscore-dangle
    expect(window.__IMMERSE__).toBeFalsy()
  })
})
