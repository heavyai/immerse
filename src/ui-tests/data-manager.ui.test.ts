// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import path from "path"

import { getTestUrl, waitForVisible } from "./utils"

describe("Data Manager page", () => {
  beforeAll(async () => {
    await page.goto(getTestUrl("/heavyai/data-manager/import/create"), {
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

    const uploadResponsePromise = page.waitForResponse(
      (response) => new URL(response.url()).pathname === "/upload",
      { timeout: 30000 }
    )
    await input.uploadFile(path.resolve(__dirname, "fixtures/test.csv"))
    const uploadResponse = await uploadResponsePromise

    if (!uploadResponse.ok()) {
      throw new Error(
        `File upload failed with HTTP ${uploadResponse.status()} ${uploadResponse.statusText()}`
      )
    }

    const uploadResult = await page.waitForSelector(".dz-success, .dz-error", {
      visible: true,
      timeout: 10000
    })
    const resultClass = await uploadResult?.evaluate(
      (element) => element.className
    )

    if (resultClass?.includes("dz-error")) {
      const errorMessage = await uploadResult?.evaluate(
        (element) => element.textContent
      )
      throw new Error(`Dropzone rejected the file: ${errorMessage}`)
    }

    expect(resultClass).toContain("dz-success")
  })
})
