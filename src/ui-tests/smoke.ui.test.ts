// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { promises as fs } from "fs"
import path from "path"

import { getTestUrl } from "./utils"

const artifactDirectory =
  process.env.PUPPETEER_ARTIFACT_DIR ||
  path.resolve(process.cwd(), "puppeteer-artifacts")
const browserLog: string[] = []

async function replaceInputValue(selector: string, value: string) {
  await page.click(selector, { clickCount: 3 })
  await page.keyboard.type(value)
}

describe("Immerse smoke test", () => {
  beforeEach(() => {
    page.on("console", (message) => {
      browserLog.push(`[console:${message.type()}] ${message.text()}`)
    })
    page.on("pageerror", (error) => {
      browserLog.push(`[pageerror] ${error.stack || error.message}`)
    })
    page.on("requestfailed", (request) => {
      browserLog.push(
        `[requestfailed] ${request.method()} ${request.url()} ${
          request.failure()?.errorText || "unknown error"
        }`
      )
    })
  })

  afterEach(async () => {
    await fs.mkdir(artifactDirectory, { recursive: true })

    if (!page.isClosed()) {
      await page.screenshot({
        path: path.join(artifactDirectory, "immerse-smoke.png"),
        fullPage: true
      })
      await fs.writeFile(
        path.join(artifactDirectory, "immerse-smoke.html"),
        await page.content()
      )
    }

    await fs.writeFile(
      path.join(artifactDirectory, "immerse-smoke-browser.log"),
      `${browserLog.join("\n")}\n`
    )
  })

  it("loads the dashboard list and communicates with HeavyDB", async () => {
    const sessionResponsePromise = page.waitForResponse(
      (response) => new URL(response.url()).pathname === "/session/validate"
    )

    const navigationResponse = await page.goto(getTestUrl(), {
      waitUntil: "domcontentloaded"
    })
    const sessionResponse = await sessionResponsePromise

    expect(navigationResponse?.ok()).toBe(true)
    expect(sessionResponse.status()).toBeLessThan(500)
    await expect(sessionResponse.json()).resolves.toBeDefined()

    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="login-form"]') ||
        document.querySelector('[data-testid="dashboard-search-bar-field"]')
    )

    if (await page.$('[data-testid="login-form"]')) {
      await replaceInputValue("#username-field", "admin")
      await replaceInputValue("#password-field", "HyperInteractive")
      await replaceInputValue("#database-field", "heavyai")

      const loginResponsePromise = page.waitForResponse(
        (response) =>
          response.request().method() === "POST" &&
          new URL(response.url()).origin === new URL(getTestUrl()).origin
      )

      await page.click('[data-testid="connect-button"]')

      const loginResponse = await loginResponsePromise
      expect(loginResponse.ok()).toBe(true)
    }

    await page.waitForSelector('[data-testid="dashboard-search-bar-field"]', {
      visible: true
    })
    await page.waitForSelector('[data-testid="new-dashboard-button"]', {
      visible: true
    })
  })
})
