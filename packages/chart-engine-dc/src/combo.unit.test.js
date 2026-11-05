// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Chart, d3 } from "./combo"
import * as combo from "./combo"

it("renders and cleans up a legacy line chart with modular D3 dependencies", () => {
  const container = document.createElement("div")
  document.body.appendChild(container)
  const chart = Chart(container)
  try {
    chart
      .setConfig({
        keyType: "number",
        width: 400,
        height: 240,
        legendIsEnabled: false,
        brushIsEnabled: false,
        tooltipIsEnabled: false
      })
      .setData({
        series: [
          {
            id: 0,
            group: 0,
            name: "Revenue",
            values: [
              { x: 1, y: 2 },
              { x: 2, y: 3 }
            ]
          }
        ]
      })
    expect(container.querySelector("svg")).not.toBeNull()
    expect(container.querySelector("path[d]")).not.toBeNull()
    expect(d3.scaleLinear().domain([0, 2]).range([0, 100])(1)).toBe(50)
    chart.destroy()
    expect(container.querySelector("svg")).toBeNull()
  } finally {
    chart.destroy()
    container.remove()
  }
})

it("preserves the historical combo plugin export surface", () => {
  expect(Object.keys(combo).sort()).toEqual(
    [
      "Binning",
      "Brush",
      "BrushRangeEditor",
      "Chart",
      "Constants",
      "DataGenerator",
      "DomainEditor",
      "Hover",
      "Interactors",
      "Label",
      "Legend",
      "Observer",
      "Scale",
      "Tooltip",
      "_Utils",
      "autoFormatter",
      "colors",
      "d3",
      "formatDataPoint",
      "formatTooltipTitle"
    ].sort()
  )
})
