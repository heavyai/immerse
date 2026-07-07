// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { chartIdMatchesUsageId, getChartIdFromUsageId } from "./utils"

describe("parameter utils test suite", () => {
  it("can chartIdMatchesUsageId", () => {
    expect(chartIdMatchesUsageId("1", "1")).toEqual(true)
    expect(chartIdMatchesUsageId("1", "1-x")).toEqual(true)
    expect(chartIdMatchesUsageId("1", "1-thisisalayerid")).toEqual(true)
    expect(chartIdMatchesUsageId("1", "2")).toEqual(false)
    expect(chartIdMatchesUsageId("1", "12")).toEqual(false)
    expect(chartIdMatchesUsageId("1", "123-1-1-1")).toEqual(false)
  })

  it("can getChartIdFromUsageId", () => {
    expect(getChartIdFromUsageId("1")).toEqual("1")
    expect(getChartIdFromUsageId("count")).toEqual("count")
    expect(getChartIdFromUsageId("count-layer")).toEqual("count")
    expect(getChartIdFromUsageId("1-2")).toEqual("1")
    expect(getChartIdFromUsageId("1-other-stuff-is-here")).toEqual("1")
  })
})
