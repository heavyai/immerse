// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import path from "path"

import { getTestUrl, waitForVisible } from "./utils"

describe("Data Manager page", () => {
  beforeAll(async () => {
    await page.goto(getTestUrl("/mapd/data-manager/import/create"), {
      waitUntil: "networkidle0"
    })
  })

  it("should successfully import a file", async () => {
    await expect(page).toClick('[data-testid="connector-local-file-import"]')
    await expect(page).toMatchTextContent("Connectors - Local File")

    await waitForVisible(".dz-hidden-input")
    const input = await page.$(".dz-hidden-input")
    if (!input) {
      throw new Error("Local file import input not found")
    }
    await input.uploadFile(path.resolve(__dirname, "fixtures/test.csv"))
    await expect(page).toMatchElement(".dz-success")
  })
})
