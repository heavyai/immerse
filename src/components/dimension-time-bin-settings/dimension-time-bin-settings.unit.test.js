// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  BINNING_INTERVAL_OPTIONS,
  EXTRACT_INTERVAL_OPTIONS,
  createOptions
} from "components/dimension-time-bin-settings/dimension-time-bin-settings"

describe("DimensionTimeBinSettings helpers", () => {
  const lowerBound = new Date("Mon Dec 31 2007 16:57:00 GMT-0800 (PST)")
  const upperBound = new Date("Thu Jan 01 2009 10:27:00 GMT-0800 (PST)")
  const binBounds = [lowerBound, upperBound]

  describe("createOptions", () => {
    it("returns expected options for line chart binning", () => {
      const options = createOptions({
        binning: true,
        binBounds,
        chartType: "line"
      })

      expect(options).toStrictEqual([
        { value: "auto", label: "Auto" },
        { value: "quarter", label: "Quarter", numSeconds: 7776000 },
        { value: "month", label: "Month", numSeconds: 2592000 },
        { value: "week", label: "Week", numSeconds: 604800 },
        { value: "day", label: "Day", numSeconds: 86400 }
      ])
    })

    it("returns expected options for histogram chart binning", () => {
      const options = createOptions({
        binning: true,
        binBounds,
        chartType: "histogram"
      })

      expect(options).toStrictEqual([
        { value: "auto", label: "Auto" },
        { value: "quarter", label: "Quarter", numSeconds: 7776000 },
        { value: "month", label: "Month", numSeconds: 2592000 },
        { value: "week", label: "Week", numSeconds: 604800 },
        { value: "day", label: "Day", numSeconds: 86400 }
      ])
    })

    it("returns full BINNING_INTERVAL_OPTIONS for table chart binning", () => {
      const options = createOptions({
        binning: true,
        binBounds,
        chartType: "table"
      })

      expect(options).toStrictEqual(BINNING_INTERVAL_OPTIONS)
    })

    it("returns EXTRACT_INTERVAL_OPTIONS when binning is false", () => {
      const options = createOptions({
        binning: false,
        binBounds,
        chartType: "table"
      })

      expect(options).toStrictEqual(EXTRACT_INTERVAL_OPTIONS)
    })
  })
})
