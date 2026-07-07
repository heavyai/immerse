// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  clickAfterVisible,
  createChart,
  createDashboard,
  expectContainsText,
  processPause,
  saveChart
} from "../utils"

describe("Text chart", () => {
  it("Creates and renders a Text chart with the inputted text", async () => {
    const expectedText = "HeavyDB"

    // Ideally we would use a [data-testid] attribute here but Quill generates the field
    // and doesn't appear to provide a hook for adding custom attributes
    const textFieldSelector = ".ql-editor[contenteditable=true]"
    const savedTextFieldSelector = ".ql-editor[contenteditable=false]"

    await createDashboard("ui-test/creates-text-chart")
    await createChart("text", {
      // Prevents Puppeteer from trying and failing to click these as none required for text chart
      dataSource: "",
      dimensions: [],
      measures: []
    })

    await processPause()
    await clickAfterVisible(textFieldSelector)
    await page.keyboard.type(expectedText)
    await saveChart()

    await expectContainsText(savedTextFieldSelector, expectedText)
  })
})
