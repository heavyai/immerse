// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createChart, createDashboard, saveChart } from "../utils"

describe("Bubble (Scatter) chart", () => {
  it("Creates and renders a Bubble (Scatter) chart", async () => {
    await createDashboard("ui-test/creates-bubble-chart")
    await createChart("scatter", {
      dataSource: "flights_donotmodify",
      dimensions: ["dest_city"],
      measures: ["carrierdelay", "securitydelay"]
    })
    await saveChart()

    await expect(page).toMatchElement("circle.bubble")
  })
})
