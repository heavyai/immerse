// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const puppeteer = require("puppeteer")
const {
  waitUntilHTMLRendered,
  checkForModal,
  puppeteerRecorderHeader,
  logValue
} = require("../../utils/recorder")

xdescribe("bar test", () => {
  it("recorded bar chart test", async () => {
    let hasNoExceptions = true
    let outerPage = null
    try {
      jest.setTimeout(80000)
      const selectorLogging = false

      const updateMocks = false
      const mocksFile = "bar.queries.json"
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
        '[data-testid="dashboard-top-panel"] #dashboard-add-chart',
        selectorLogging
      )
      await page.waitForSelector(
        '[data-testid="dashboard-top-panel"] #dashboard-add-chart'
      )
      await page.click(
        '[data-testid="dashboard-top-panel"] #dashboard-add-chart'
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        '.chart-editor-top-panel-inner > [data-testid="chart-type-wrapper"] > .chart-type-wrapper-overflow > #chart-type-row > .icon',
        selectorLogging
      )
      await page.waitForSelector(
        '.chart-editor-top-panel-inner > [data-testid="chart-type-wrapper"] > .chart-type-wrapper-overflow > #chart-type-row > .icon'
      )
      await page.click(
        '.chart-editor-top-panel-inner > [data-testid="chart-type-wrapper"] > .chart-type-wrapper-overflow > #chart-type-row > .icon'
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
        "nes_games"
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
      logValue(
        "div > .chart-editor-section > .chart-settings-row > #chart-settings-sort-by-direction > span",
        selectorLogging
      )
      await page.waitForSelector(
        "div > .chart-editor-section > .chart-settings-row > #chart-settings-sort-by-direction > span"
      )
      await page.click(
        "div > .chart-editor-section > .chart-settings-row > #chart-settings-sort-by-direction > span"
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        "div > .chart-editor-section > .chart-settings-row > #chart-settings-sort-by-direction > span",
        selectorLogging
      )
      await page.waitForSelector(
        "div > .chart-editor-section > .chart-settings-row > #chart-settings-sort-by-direction > span"
      )
      await page.click(
        "div > .chart-editor-section > .chart-settings-row > #chart-settings-sort-by-direction > span"
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        "div > .custom-selector > #chart-settings-sort-by > .custom-selector-label > .sort-by-container",
        selectorLogging
      )
      await page.waitForSelector(
        "div > .custom-selector > #chart-settings-sort-by > .custom-selector-label > .sort-by-container"
      )
      await page.click(
        "div > .custom-selector > #chart-settings-sort-by > .custom-selector-label > .sort-by-container"
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue("div #chart-settings-sort-by-1", selectorLogging)
      await page.waitForSelector("div #chart-settings-sort-by-1")
      await page.click("div #chart-settings-sort-by-1")

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        ".custom-selector > #chart-settings-sort-by > .custom-selector-label > .sort-by-container > .sort-by-label",
        selectorLogging
      )
      await page.waitForSelector(
        ".custom-selector > #chart-settings-sort-by > .custom-selector-label > .sort-by-container > .sort-by-label"
      )
      await page.click(
        ".custom-selector > #chart-settings-sort-by > .custom-selector-label > .sort-by-container > .sort-by-label"
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue("div #chart-settings-sort-by-0", selectorLogging)
      await page.waitForSelector("div #chart-settings-sort-by-0")
      await page.click("div #chart-settings-sort-by-0")

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(".chart-editor-section #number-groups", selectorLogging)
      await page.waitForSelector(".chart-editor-section #number-groups")
      await page.click(".chart-editor-section #number-groups")

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(".chart-editor-section #number-groups", selectorLogging)
      await page.waitForSelector(".chart-editor-section #number-groups")
      await page.click(".chart-editor-section #number-groups")

      await await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(".chart-editor-section #number-groups")
      await page.$eval(".chart-editor-section #number-groups", function clear(
        e
      ) {
        e.value = ""
      })
      await page.type(".chart-editor-section #number-groups", "10")
      await page.keyboard.press("Enter")

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(".chart-editor-section #number-groups", selectorLogging)
      await page.waitForSelector(".chart-editor-section #number-groups")
      await page.click(".chart-editor-section #number-groups")

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(".chart-editor-section #number-groups", selectorLogging)
      await page.waitForSelector(".chart-editor-section #number-groups")
      await page.click(".chart-editor-section #number-groups")

      await await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(".chart-editor-section #number-groups")
      await page.$eval(".chart-editor-section #number-groups", function clear(
        e
      ) {
        e.value = ""
      })
      await page.type(".chart-editor-section #number-groups", "100")
      await page.keyboard.press("Enter")

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        '[data-testid="chart-editor-right-panel"] > div > .chart-editor-section > .react-toggle > .react-toggle-thumb',
        selectorLogging
      )
      await page.waitForSelector(
        '[data-testid="chart-editor-right-panel"] > div > .chart-editor-section > .react-toggle > .react-toggle-thumb'
      )
      await page.click(
        '[data-testid="chart-editor-right-panel"] > div > .chart-editor-section > .react-toggle > .react-toggle-thumb'
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        ".chart-editor-section > .react-toggle > .react-toggle-track > .react-toggle-track-x > svg",
        selectorLogging
      )
      await page.waitForSelector(
        ".chart-editor-section > .react-toggle > .react-toggle-track > .react-toggle-track-x > svg"
      )
      await page.click(
        ".chart-editor-section > .react-toggle > .react-toggle-track > .react-toggle-track-x > svg"
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
          "#chartnes_games > div > span.count-selected.not-filtered",
          (e) => {
            return e.innerHTML
          }
        )
        if (val !== "680") {
          throw new Error(
            `Could not continue, invalid count: "${val}" !== "680"`
          )
        }
      }

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(".svg-wrapper > svg > g > ._7 > rect", selectorLogging)
      await page.waitForSelector(".svg-wrapper > svg > g > ._7 > rect")
      await page.click(".svg-wrapper > svg > g > ._7 > rect")

      {
        await waitUntilHTMLRendered(page)
        await checkForModal(page)
        const val = await page.$eval(
          "#chartnes_games > div > span.count-selected",
          (e) => {
            return e.innerHTML
          }
        )
        if (val !== "14") {
          throw new Error(
            `Could not continue, invalid count: "${val}" !== "14"`
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
