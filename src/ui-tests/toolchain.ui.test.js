// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const puppeteer = require("puppeteer")

describe("Puppeteer module and browser compatibility", () => {
  it("loads Puppeteer 25 through Jest and controls the installed browser", async () => {
    expect(typeof puppeteer.launch).toBe("function")
    expect(await browser.version()).toMatch(/Chrome\//)
    await page.setContent("<button>Ready</button>")
    await expect(page).toMatchElement("button", { text: "Ready" })
    expect(await page.evaluate(() => 6 * 7)).toBe(42)
  })
})
