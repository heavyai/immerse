// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import addChartEventListeners from "./add-chart-event-listeners"

describe("addChartEventListeners", () => {
  const filterSpy = jest.fn()
  const listeners = {
    filtered: filterSpy
  }
  const props = "props"
  const chart = "chart"
  it("should add event listeners", () => {
    addChartEventListeners(listeners)(props)(chart)
    expect(filterSpy).toHaveBeenCalledWith(props, chart, "filtered")
  })
})
