// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { promises as fs } from "fs"
import path from "path"

import {
  createDashboard,
  deleteDashboard,
  getTestUrl,
  saveDashboard
} from "./utils"
import { expectDashboardTitleInputToMatch } from "./utils/expect"

const artifactDirectory =
  process.env.PUPPETEER_ARTIFACT_DIR ||
  path.resolve(process.cwd(), "puppeteer-artifacts")
const browserLog: string[] = []

describe("Immerse smoke test and sessionization", () => {
  beforeAll(() => {
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

  afterAll(async () => {
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

  it("loads the dashboard list, connects to HeavyDB, and maintains the session on refresh", async () => {
    const browserContext = page.browserContext()
    const cookies = await browserContext.cookies()
    if (cookies.length) {
      await browserContext.deleteCookie(...cookies)
    }

    const sessionResponsePromise = page.waitForResponse(
      (response) => new URL(response.url()).pathname === "/session/validate"
    )
    const loginResponsePromise = page.waitForResponse(
      (response) => new URL(response.url()).pathname === "/session/create"
    )

    const navigationResponse = await page.goto(getTestUrl(), {
      waitUntil: "domcontentloaded"
    })
    const sessionResponse = await sessionResponsePromise
    const loginResponse = await loginResponsePromise

    expect(navigationResponse?.ok()).toBe(true)
    expect(sessionResponse.status()).toBe(401)
    expect(loginResponse.ok()).toBe(true)
    expect(
      await page.evaluate(() => {
        const config = window.APP_CONFIG?.[0]
        return {
          database: config?.database,
          password: config?.password,
          username: config?.username
        }
      })
    ).toEqual(
      expect.objectContaining({
        database: "heavyai",
        password: "HyperInteractive",
        username: "admin"
      })
    )

    await page.waitForSelector('[data-testid="dashboard-search-bar-field"]', {
      visible: true
    })
    await page.waitForSelector('[data-testid="new-dashboard-button"]', {
      visible: true
    })

    await page.reload()

    await expect(page).toMatchElement(".dashboards-container")
  })

  it("maintains session on dashboard refresh and navigates directly to a saved dashboard ", async () => {
    const dashboardName = await createDashboard(
      "ui-tests/sessionization-dashboard"
    )
    await saveDashboard()

    await expectDashboardTitleInputToMatch(dashboardName)

    await page.reload({
      waitUntil: "networkidle0"
    })

    await expectDashboardTitleInputToMatch(dashboardName)

    const dashboardUrl = page.url()

    await page.goto(dashboardUrl, { waitUntil: "networkidle0" })

    await expectDashboardTitleInputToMatch(dashboardName)

    await deleteDashboard(dashboardName)
  })

  it("redirects to page requested after connection", async () => {
    await page.goto(getTestUrl("sql-editor"), { waitUntil: "networkidle0" })
    await expect(page).toMatchTextContent("SQL Editor")
  })

  it("should show 'New Dashboard' button with createDashboard privilege", async () => {
    await page.goto(getTestUrl(""), { waitUntil: "networkidle0" })
    await expect(page).toMatchTextContent("New Dashboard")
  })
})
