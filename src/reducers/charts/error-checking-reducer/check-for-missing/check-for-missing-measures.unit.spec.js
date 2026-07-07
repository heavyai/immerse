// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"

import checkForMissingMeasures from "./check-for-missing-measures"

const checkPie = checkForMissingMeasures("pie")
const checkPointmap = checkForMissingMeasures("pointmap")

describe("checkForMissingMeasures", () => {
  it("should set each dimension to the proper isRequired", () => {
    expect(checkPie([{}, {}])).to.deep.equal([
      { isRequired: true },
      { isRequired: false }
    ])

    expect(
      checkPointmap([{}, {}, {}, { value: "recipient_party", loading: true }])
    ).to.deep.equal([
      { isRequired: true },
      { isRequired: true },
      { isRequired: false },
      { value: "recipient_party", loading: true, isRequired: false }
    ])
  })
})
