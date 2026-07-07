// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getTestUrl, processPause } from "./utils"

describe("Data Manager page", () => {
  beforeAll(async () => {
    await page.goto(getTestUrl("/mapd/data-manager/import/create"), {
      waitUntil: "networkidle0"
    })
  })

  it("should successfully import a file", async () => {
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      expect(page).toClick('[data-testid="connector-local-file-import"]')
    ])
    await expect(page).toMatchTextContent("Connectors - Local File")

    await processPause()
    const input = await page.$(".dz-hidden-input")
    await input.uploadFile("src/ui-tests/fixtures/test.csv")
    await expect(page).toMatchElement(".dz-success")
  })
})
