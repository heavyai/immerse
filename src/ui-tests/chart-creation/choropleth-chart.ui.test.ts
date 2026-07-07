// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  createChart,
  createDashboard,
  expectLegendRange,
  processPause,
  saveChart
} from "../utils"

xdescribe("DEBUG - Choropleth chart", () => {
  it("Creates and renders a Choropleth chart", async () => {
    await createDashboard("ui-test/creates-choropleth-chart")
    await createChart("backendChoropleth", {
      dataSource: "us_states_geo",
      dimensions: ["ALAND"],
      // Auto-selects "geom" as geo measure, empty string skips selection of first measure
      measures: ["", "AWATER"]
    })

    const pause = 2
    await processPause(pause)
    await expectLegendRange("19M", "91G")

    await saveChart()

    await expect(page).toMatchElement("canvas.mapboxgl-canvas")
  })
})
