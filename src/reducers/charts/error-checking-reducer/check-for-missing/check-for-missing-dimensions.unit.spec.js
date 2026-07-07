// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"

import checkForMissingDimensions from "./check-for-missing-dimensions"

const checkHeat = checkForMissingDimensions("heat")

describe("checkForMissingDimensions", () => {
  it("should set each dimension to the proper isRequired", () => {
    expect(checkHeat([{ value: "test" }, {}])).to.deep.equal([
      { value: "test", isRequired: false },
      { isRequired: true }
    ])

    expect(checkHeat([{ value: "test", loading: true }, {}])).to.deep.equal([
      { value: "test", loading: true, isRequired: true },
      { isRequired: true }
    ])
  })
})
