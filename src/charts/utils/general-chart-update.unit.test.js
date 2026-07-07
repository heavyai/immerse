// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import generalChartUpdate from "./general-chart-update"

describe("generalChartUpdate", () => {
  let chart = null
  beforeEach(() => {
    chart = {
      a: jest.fn(),
      height: jest.fn()
    }
  })

  it("applies the update from diff", () => {
    const diff = {
      a: false,
      height: true,
      foo: false
    }
    generalChartUpdate(chart, diff)
    expect(chart.a).toHaveBeenCalledWith(false)
    expect(chart.height).toHaveBeenCalledWith(true)
    expect(chart.foo).toEqual(undefined)
  })
})
