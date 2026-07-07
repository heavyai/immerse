// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import reducer from "./single-source-to-multi-reducer"
import R from "ramda"

describe("SSD to MSD Reducer", () => {
  const ssdState = {
    filters: [],
    dashboard: {
      table: "flights"
    },
    charts: {
      1: {},
      2: {}
    }
  }

  const msdState = reducer(ssdState)

  it("should add data source to all chart states", () => {
    expect(
      R.keys(R.pickBy(R.propEq("dataSource", "flights"))(msdState.charts))
    ).to.deep.equal(R.keys(msdState.charts))
  })

  it("should return state if already multisource", () => {
    expect(reducer(msdState)).to.deep.equal(msdState)
  })
})
