// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const puppeteer = require("puppeteer")
const {
  waitUntilHTMLRendered,
  checkForModal,
  puppeteerRecorderHeader
} = require("../../utils/recorder")

xdescribe("Recorded pie chart tests", () => {
  it("creates a pie chart, clicks all the options, updates the count chart", async () => {
    let hasNoExceptions = true
    let outerPage = null
    try {
      jest.setTimeout(60000)

      const updateMocks = false
      const mocksFile = "pie.queries.json"
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
        '[data-testid="dashboard-top-panel"] #dashboard-add-chart'
      )
      await page.click(
        '[data-testid="dashboard-top-panel"] #dashboard-add-chart'
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        '[data-testid="chart-type-wrapper"] > .chart-type-wrapper-overflow > #chart-type-pie > .icon > use'
      )
      await page.click(
        '[data-testid="chart-type-wrapper"] > .chart-type-wrapper-overflow > #chart-type-pie > .icon > use'
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

      await await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        '[data-testid="selector-dropdown-autocomplete"] > .react-popover > .autocomplete-inner-wrapper > .autocomplete-input > [data-testid="autocomplete-input"]'
      )
      await page.$eval(
        '[data-testid="selector-dropdown-autocomplete"] > .react-popover > .autocomplete-inner-wrapper > .autocomplete-input > [data-testid="autocomplete-input"]',
        function clear(e) {
          e.value = ""
        }
      )
      await page.type(
        '[data-testid="selector-dropdown-autocomplete"] > .react-popover > .autocomplete-inner-wrapper > .autocomplete-input > [data-testid="autocomplete-input"]',
        "strength"
      )
      await page.keyboard.press("Enter")

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        ".selector-pill-wrapper > .selector-pill > .drag-area > #measure-add-0 > .selector-label-ellipse"
      )
      await page.click(
        ".selector-pill-wrapper > .selector-pill > .drag-area > #measure-add-0 > .selector-label-ellipse"
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(2) > .autocomplete-dropdown-item-content > .value'
      )
      await page.click(
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(2) > .autocomplete-dropdown-item-content > .value'
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        '[data-testid="chart-editor-right-panel"] #chart-style-pie'
      )
      await page.click(
        '[data-testid="chart-editor-right-panel"] #chart-style-pie'
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        '.dashboard-container > .chart-editor-container > [data-testid="chart-editor-right-panel"] > div > .chart-editor-section:nth-child(1)'
      )
      await page.click(
        '.dashboard-container > .chart-editor-container > [data-testid="chart-editor-right-panel"] > div > .chart-editor-section:nth-child(1)'
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        '[data-testid="chart-editor-right-panel"] #chart-style-donut'
      )
      await page.click(
        '[data-testid="chart-editor-right-panel"] #chart-style-donut'
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        '[data-testid="display-absolute-values"] [type="checkbox"]'
      )
      await page.click(
        '[data-testid="display-absolute-values"] [type="checkbox"]'
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        '[data-testid="display-absolute-values"] [type="checkbox"]'
      )
      await page.click(
        '[data-testid="display-absolute-values"] [type="checkbox"]'
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        '[data-testid="display-percent-values"] [type="checkbox"]'
      )
      await page.click(
        '[data-testid="display-percent-values"] [type="checkbox"]'
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        '[data-testid="display-percent-values"] [type="checkbox"]'
      )
      await page.click(
        '[data-testid="display-percent-values"] [type="checkbox"]'
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        "div > .chart-editor-section > .chart-settings-row > #chart-settings-sort-by-direction > .icon"
      )
      await page.click(
        "div > .chart-editor-section > .chart-settings-row > #chart-settings-sort-by-direction > .icon"
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        "div > .chart-editor-section > .chart-settings-row > #chart-settings-sort-by-direction > .icon"
      )
      await page.click(
        "div > .chart-editor-section > .chart-settings-row > #chart-settings-sort-by-direction > .icon"
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(".chart-editor-section #number-groups")
      await page.click(".chart-editor-section #number-groups")

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
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
      await page.type(".chart-editor-section #number-groups", "13")
      await page.keyboard.press("Enter")

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(".chart-editor-section #number-groups")
      await page.click(".chart-editor-section #number-groups")

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
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
      await page.waitForSelector(
        '[data-testid="show-all-others"] [type="checkbox"]'
      )
      await page.click('[data-testid="show-all-others"] [type="checkbox"]')

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        '[data-testid="show-all-others"] [type="checkbox"]'
      )
      await page.click('[data-testid="show-all-others"] [type="checkbox"]')

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        '[data-testid="null-dimension"] [type="checkbox"]'
      )
      await page.click('[data-testid="null-dimension"] [type="checkbox"]')

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        '[data-testid="null-dimension"] [type="checkbox"]'
      )
      await page.click('[data-testid="null-dimension"] [type="checkbox"]')

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(".dashboard-container #chart-edit-apply")
      await page.click(".dashboard-container #chart-edit-apply")

      {
        await waitUntilHTMLRendered(page)
        await checkForModal(page)
        const val = await page.$eval(
          "#charttransformers > div > span.count-selected.not-filtered",
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
      await page.waitForSelector(
        ".svg-wrapper > svg > .pie-wrapper > ._0 > path"
      )
      await page.click(".svg-wrapper > svg > .pie-wrapper > ._0 > path")

      {
        await waitUntilHTMLRendered(page)
        await checkForModal(page)
        const val = await page.$eval(
          "#charttransformers > div > span.count-selected",
          (e) => {
            return e.innerHTML
          }
        )
        if (val !== "113") {
          throw new Error(
            `Could not continue, invalid count: "${val}" !== "113"`
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
