// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createAutoTitle } from "./chart-title-helpers"
import chartState from "utils/test-helpers/mock-app-states/charts"
import "charts/chart-definitions"

describe("Chart Title Helpers", () => {
  describe("createAutoTitle", () => {
    it("handles multiple measures, dimensions, aggregates", () => {
      expect(createAutoTitle(chartState.charts["1"]).title).toEqual(
        "Avg Actualelapsedtime by Arrdelay, Plane Type"
      )
      expect(createAutoTitle(chartState.charts["2"]).title).toEqual(
        "# Records by Dest, Dest State"
      )
      expect(createAutoTitle(chartState.charts["3"]).title).toEqual(
        "Avg Arrdelay, # of Unique Plane Status by Airtime"
      )
      expect(createAutoTitle(chartState.charts["4"]).title).toEqual(
        "Avg Double  by City, Color"
      )
      expect(createAutoTitle(chartState.charts["5"]).title).toEqual(
        "# Records, Max Col Big 1 by Actualelapsedtime, Col Decimal 1, State Name"
      )
      expect(createAutoTitle(chartState.charts["6"]).title).toEqual(
        "Avg Col Integer 2, Avg Col Big 1, Stddev Lon by Col Ts9 1, Col Double 2"
      )
    })

    it("adds datasource for geocharts", () => {
      expect(createAutoTitle(chartState.charts["7"]).title).toEqual(
        "Flights Abcdef Del"
      )
      expect(createAutoTitle(chartState.charts["8"]).title).toEqual(
        "Data Types Basic3 / Data Types Basic3 Col Decimal 1, Col Boolean 1"
      )
      expect(createAutoTitle(chartState.charts["9"]).title).toEqual(
        "Data Types Basic3 # of Unique Col Boolean 1 by Col Big 1"
      )
    })
  })
})
