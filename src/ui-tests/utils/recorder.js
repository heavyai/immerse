// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Helper function to replace deprecated page.waitForTimeout()
async function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function getTestUrl(path = "/") {
  const baseUrl = "http://localhost:8002"
  return new URL(path, baseUrl).toString()
}

async function waitUntilHTMLRendered(page, timeout = 30000) {
  const checkDurationMsecs = 300
  const maxChecks = timeout / checkDurationMsecs
  let lastHTMLSize = 0
  let checkCounts = 1
  let countStableSizeIterations = 0
  const minStableSizeIterations = 3

  while (checkCounts++ <= maxChecks) {
    const html = await page.content()
    const currentHTMLSize = html.length

    if (lastHTMLSize !== 0 && currentHTMLSize === lastHTMLSize) {
      countStableSizeIterations++
    } else {
      countStableSizeIterations = 0 // reset the counter
    }

    if (countStableSizeIterations >= minStableSizeIterations) {
      // console.log("Page rendered fully..");
      break
    }

    lastHTMLSize = currentHTMLSize
    await delay(checkDurationMsecs)
  }
}

async function checkForModal(page) {
  if ((await page.$(".mdc-dialog__container")) === null) {
    return true
  } else {
    const message = await page.$(".mdc-dialog__content .dialog-message")
      .innerText
    throw new Error(`Could not continue: Warning modal found : ${message}`)
  }
}

async function checkForCount(page, table, count) {
  const currentCount = await page.$eval(
    `.animated-count > .count-widget-wrapper > #chart${table} > .count-widget > .count-selected`,
    (e) => {
      return e.innerHTML
    }
  )
  if (currentCount === count) {
    return true
  } else {
    throw new Error(
      `Could not continue, invalid count: ${currentCount} !== ${count}`
    )
  }
}

async function puppeteerRecorderHeader({
  puppeteer,
  url = getTestUrl("dashboard?enable_mock_connector=true"),
  headless = false,
  mocksFile,
  newBrowser = true
}) {
  const b = newBrowser ? await puppeteer.launch({ headless }) : browser
  const page = await b.newPage()

  await page.goto(url, {
    waitUntil: ["load", "domcontentloaded", "networkidle0", "networkidle2"]
  })

  await page.setViewport({ width: 1787, height: 1083 })

  if (mocksFile) {
    await waitUntilHTMLRendered(page)
    await checkForModal(page)
    await page.waitForSelector(
      '.app > .main-nav > .mock-container > .mock-container-invisible > label > [data-testid="upload-query-mocks"]'
    )
    const mockUploadHandle = await page.$(
      '.app > .main-nav > .mock-container > .mock-container-invisible > label > [data-testid="upload-query-mocks"]'
    )

    await mockUploadHandle.uploadFile(mocksFile)
  }

  return { browser: b, page }
}

function logValue(value, logging = false) {
  if (logging) {
    // eslint-disable-next-line
    console.log(value)
  }
}

module.exports = {
  waitUntilHTMLRendered,
  checkForModal,
  checkForCount,
  puppeteerRecorderHeader,
  logValue
}
