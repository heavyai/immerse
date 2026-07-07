// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const puppeteer = require("puppeteer")
const {
  waitUntilHTMLRendered,
  checkForModal,
  puppeteerRecorderHeader
} = require("../../utils/recorder")

xdescribe("recorded table test", () => {
  it("recorded table test", async () => {
    let hasNoExceptions = true
    let outerPage = null
    try {
      jest.setTimeout(60000)

      const updateMocks = false
      const mocksFile = "table.queries.json"
      const mocksPath = `${__dirname}/${mocksFile}`
      const { page } = await puppeteerRecorderHeader({
        headless: true,
        puppeteer,
        mocksFile: updateMocks ? undefined : mocksPath,
        newBrowser: false
      })

      outerPage = page
      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        ".dashboard-top-panel-inner > .right-wrapper > div > #dashboard-add-chart > .mdc-button__label"
      )
      await page.click(
        ".dashboard-top-panel-inner > .right-wrapper > div > #dashboard-add-chart > .mdc-button__label"
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        '.data-selector-container > div > .chart-editor-section > .data-source-selector > [data-testid="add-source"]'
      )
      await page.click(
        '.data-selector-container > div > .chart-editor-section > .data-source-selector > [data-testid="add-source"]'
      )

      await await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        '[data-testid="data-source-autocomplete"] > .react-popover > .autocomplete-inner-wrapper > .autocomplete-input > [data-testid="autocomplete-input"]'
      )
      await page.$eval(
        '[data-testid="data-source-autocomplete"] > .react-popover > .autocomplete-inner-wrapper > .autocomplete-input > [data-testid="autocomplete-input"]',
        function clear(e) {
          e.value = ""
        }
      )
      await page.type(
        '[data-testid="data-source-autocomplete"] > .react-popover > .autocomplete-inner-wrapper > .autocomplete-input > [data-testid="autocomplete-input"]',
        "transformers"
      )
      await page.keyboard.press("Enter")

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(".data-selector-container #dimension-add-1")
      await page.click(".data-selector-container #dimension-add-1")

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(8) > .autocomplete-dropdown-item-content > .value'
      )
      await page.click(
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(8) > .autocomplete-dropdown-item-content > .value'
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(".data-selector-container #dimension-add-1")
      await page.click(".data-selector-container #dimension-add-1")

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(10) > .autocomplete-dropdown-item-content > .value'
      )
      await page.click(
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(10) > .autocomplete-dropdown-item-content > .value'
      )
      if (updateMocks) {
        await waitUntilHTMLRendered(page)
        await page.$eval(
          '[data-testid="query-mocks-file"]',
          // eslint-disable-next-line
          (e, mocksFile) => (e.value = mocksFile),
          mocksFile
        )
        await page.waitForSelector(
          '.app > .main-nav > .mock-container > .mock-container-invisible > [data-testid="download-query-mocks"]'
        )
        await page.click(
          '.app > .main-nav > .mock-container > .mock-container-invisible > [data-testid="download-query-mocks"]'
        )
      }
    } catch (e) {
      hasNoExceptions = e
    } finally {
      if (outerPage) {
        await outerPage.close()
      }
    }

    expect(hasNoExceptions).toEqual(true)
  })
})
