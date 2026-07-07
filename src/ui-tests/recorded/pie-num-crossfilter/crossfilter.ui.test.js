// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const puppeteer = require("puppeteer")
const {
  waitUntilHTMLRendered,
  checkForModal,
  puppeteerRecorderHeader,
  logValue
} = require("../../utils/recorder")

xdescribe("pie/num crossfilter section", () => {
  it("pie/num crossfilters", async () => {
    let hasNoExceptions = true
    let outerPage = null
    try {
      jest.setTimeout(60000)
      const selectorLogging = false

      const updateMocks = false
      const mocksFile = "crossfilter.queries.json"
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
      logValue(
        ".dashboard-top-panel-inner > .right-wrapper > div > #dashboard-add-chart > .mdc-button__label",
        selectorLogging
      )
      await page.waitForSelector(
        ".dashboard-top-panel-inner > .right-wrapper > div > #dashboard-add-chart > .mdc-button__label"
      )
      await page.click(
        ".dashboard-top-panel-inner > .right-wrapper > div > #dashboard-add-chart > .mdc-button__label"
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        '.chart-editor-top-panel-inner > [data-testid="chart-type-wrapper"] > .chart-type-wrapper-overflow > #chart-type-pie > .icon',
        selectorLogging
      )
      await page.waitForSelector(
        '.chart-editor-top-panel-inner > [data-testid="chart-type-wrapper"] > .chart-type-wrapper-overflow > #chart-type-pie > .icon'
      )
      await page.click(
        '.chart-editor-top-panel-inner > [data-testid="chart-type-wrapper"] > .chart-type-wrapper-overflow > #chart-type-pie > .icon'
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        '.data-selector-container > div > .chart-editor-section > .data-source-selector > [data-testid="add-source"]',
        selectorLogging
      )
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
      logValue(".data-selector-container #dimension-add-1", selectorLogging)
      await page.waitForSelector(".data-selector-container #dimension-add-1")
      await page.click(".data-selector-container #dimension-add-1")

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(8) > .autocomplete-dropdown-item-content > .value',
        selectorLogging
      )
      await page.waitForSelector(
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(8) > .autocomplete-dropdown-item-content > .value'
      )
      await page.click(
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(8) > .autocomplete-dropdown-item-content > .value'
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        ".selector-pill-wrapper > .selector-pill > .drag-area > #measure-add-0 > .selector-label-ellipse",
        selectorLogging
      )
      await page.waitForSelector(
        ".selector-pill-wrapper > .selector-pill > .drag-area > #measure-add-0 > .selector-label-ellipse"
      )
      await page.click(
        ".selector-pill-wrapper > .selector-pill > .drag-area > #measure-add-0 > .selector-label-ellipse"
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(2) > .autocomplete-dropdown-item-content > .value',
        selectorLogging
      )
      await page.waitForSelector(
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(2) > .autocomplete-dropdown-item-content > .value'
      )
      await page.click(
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(2) > .autocomplete-dropdown-item-content > .value'
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(".dashboard-container #chart-edit-apply", selectorLogging)
      await page.waitForSelector(".dashboard-container #chart-edit-apply")
      await page.click(".dashboard-container #chart-edit-apply")

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        ".dashboard-top-panel-inner > .right-wrapper > div > #dashboard-add-chart > .mdc-button__label",
        selectorLogging
      )
      await page.waitForSelector(
        ".dashboard-top-panel-inner > .right-wrapper > div > #dashboard-add-chart > .mdc-button__label"
      )
      await page.click(
        ".dashboard-top-panel-inner > .right-wrapper > div > #dashboard-add-chart > .mdc-button__label"
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        '.chart-editor-top-panel-inner > [data-testid="chart-type-wrapper"] > .chart-type-wrapper-overflow > #chart-type-number > .icon',
        selectorLogging
      )
      await page.waitForSelector(
        '.chart-editor-top-panel-inner > [data-testid="chart-type-wrapper"] > .chart-type-wrapper-overflow > #chart-type-number > .icon'
      )
      await page.click(
        '.chart-editor-top-panel-inner > [data-testid="chart-type-wrapper"] > .chart-type-wrapper-overflow > #chart-type-number > .icon'
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        ".selector-pill-wrapper > .selector-pill > .drag-area > #measure-add-0 > .selector-label-ellipse",
        selectorLogging
      )
      await page.waitForSelector(
        ".selector-pill-wrapper > .selector-pill > .drag-area > #measure-add-0 > .selector-label-ellipse"
      )
      await page.click(
        ".selector-pill-wrapper > .selector-pill > .drag-area > #measure-add-0 > .selector-label-ellipse"
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(2) > .autocomplete-dropdown-item-content > .value',
        selectorLogging
      )
      await page.waitForSelector(
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(2) > .autocomplete-dropdown-item-content > .value'
      )
      await page.click(
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(2) > .autocomplete-dropdown-item-content > .value'
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(".dashboard-container #chart-edit-apply", selectorLogging)
      await page.waitForSelector(".dashboard-container #chart-edit-apply")
      await page.click(".dashboard-container #chart-edit-apply")

      {
        await waitUntilHTMLRendered(page)
        await checkForModal(page)
        const val = await page.$eval(
          "#chart2 > div.number-chart-wrapper > span",
          (e) => {
            return e.innerHTML
          }
        )
        if (val !== "609") {
          throw new Error(
            `Could not continue, invalid count: "${val}" !== "609"`
          )
        }
      }

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        ".svg-wrapper > svg > .pie-wrapper > ._3 > path",
        selectorLogging
      )
      await page.waitForSelector(
        ".svg-wrapper > svg > .pie-wrapper > ._3 > path"
      )
      await page.click(".svg-wrapper > svg > .pie-wrapper > ._3 > path")

      {
        await waitUntilHTMLRendered(page)
        await checkForModal(page)
        const val = await page.$eval(
          "#chart2 > div.number-chart-wrapper > span",
          (e) => {
            return e.innerHTML
          }
        )
        if (val !== "46") {
          throw new Error(
            `Could not continue, invalid count: "${val}" !== "46"`
          )
        }
      }

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        ".svg-wrapper > svg > .pie-wrapper > ._2 > path",
        selectorLogging
      )
      await page.waitForSelector(
        ".svg-wrapper > svg > .pie-wrapper > ._2 > path"
      )
      await page.click(".svg-wrapper > svg > .pie-wrapper > ._2 > path")

      {
        await waitUntilHTMLRendered(page)
        await checkForModal(page)
        const val = await page.$eval(
          "#chart2 > div.number-chart-wrapper > span",
          (e) => {
            return e.innerHTML
          }
        )
        if (val !== "137") {
          throw new Error(
            `Could not continue, invalid count: "${val}" !== "137"`
          )
        }
      }
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
