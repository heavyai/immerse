// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const puppeteer = require("puppeteer")
const {
  waitUntilHTMLRendered,
  checkForModal,
  puppeteerRecorderHeader,
  logValue
} = require("../../utils/recorder")

// Skipping due to a maintainability issue
xdescribe("FE-11844 suite", () => {
  xit("test FE-11844", async () => {
    let hasNoExceptions = true
    let outerPage = null
    try {
      jest.setTimeout(60000)
      const selectorLogging = false

      const updateMocks = true
      const mocksFile = "FE-11844.queries.json"
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
        ".app > .dashboard-container > .dashboard-grid-container > .button > .add-chart-cta-plus",
        selectorLogging
      )
      await page.waitForSelector(
        ".app > .dashboard-container > .dashboard-grid-container > .button > .add-chart-cta-plus"
      )
      await page.click(
        ".app > .dashboard-container > .dashboard-grid-container > .button > .add-chart-cta-plus"
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
        "faker_geo_legacy"
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
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(1) > .autocomplete-dropdown-item-content > .value',
        selectorLogging
      )
      await page.waitForSelector(
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(1) > .autocomplete-dropdown-item-content > .value'
      )
      await page.click(
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(1) > .autocomplete-dropdown-item-content > .value'
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        ".react-popover > .measure-settings > .custom-sql-selector > .textarea-wrap > textarea",
        selectorLogging
      )
      await page.waitForSelector(
        ".react-popover > .measure-settings > .custom-sql-selector > .textarea-wrap > textarea"
      )
      await page.click(
        ".react-popover > .measure-settings > .custom-sql-selector > .textarea-wrap > textarea"
      )

      await await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        ".react-popover > .measure-settings > .custom-sql-selector > .textarea-wrap > textarea"
      )
      await page.$eval(
        ".react-popover > .measure-settings > .custom-sql-selector > .textarea-wrap > textarea",
        function clear(e) {
          e.value = ""
        }
      )
      await page.type(
        ".react-popover > .measure-settings > .custom-sql-selector > .textarea-wrap > textarea",
        "case when Faker_Geo_Legacy.Big_Int >= 9223371698849455000 then 11 else cast((cast(Faker_Geo_Legacy.Big_Int as float) - -9223371758128610000) * 6.505213252402347e-19 as int) end"
      )
      await page.keyboard.press("Enter")

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        ".dimensions-container > .selector-pill-wrapper > .selector-pill > .drag-area > .selector-agg",
        selectorLogging
      )
      await page.waitForSelector(
        ".dimensions-container > .selector-pill-wrapper > .selector-pill > .drag-area > .selector-agg"
      )
      await page.click(
        ".dimensions-container > .selector-pill-wrapper > .selector-pill > .drag-area > .selector-agg"
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        ".measure-settings > .bin-settings > .bin-settings-toggle > .react-toggle",
        selectorLogging
      )
      await page.waitForSelector(
        ".measure-settings > .bin-settings > .bin-settings-toggle > .react-toggle"
      )
      await page.click(
        ".measure-settings > .bin-settings > .bin-settings-toggle > .react-toggle"
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(".bin-settings-section #bin-size", selectorLogging)
      await page.waitForSelector(".bin-settings-section #bin-size")
      await page.click(".bin-settings-section #bin-size")

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(".bin-settings-section #bin-size", selectorLogging)
      await page.waitForSelector(".bin-settings-section #bin-size")
      await page.click(".bin-settings-section #bin-size")

      await await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(".bin-settings-section #bin-size")
      await page.$eval(".bin-settings-section #bin-size", function clear(e) {
        e.value = ""
      })
      await page.type(".bin-settings-section #bin-size", "3")
      await page.keyboard.press("Enter")

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        '#root > .app > .dashboard-container > .chart-editor-container > [data-testid="chart-editor-left-panel"]',
        selectorLogging
      )
      await page.waitForSelector(
        '#root > .app > .dashboard-container > .chart-editor-container > [data-testid="chart-editor-left-panel"]'
      )
      await page.click(
        '#root > .app > .dashboard-container > .chart-editor-container > [data-testid="chart-editor-left-panel"]'
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
      logValue(".data-selector-container #dimension-add-2", selectorLogging)
      await page.waitForSelector(".data-selector-container #dimension-add-2")
      await page.click(".data-selector-container #dimension-add-2")

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(1) > .autocomplete-dropdown-item-content > .value',
        selectorLogging
      )
      await page.waitForSelector(
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(1) > .autocomplete-dropdown-item-content > .value'
      )
      await page.click(
        '[data-testid="autocomplete-dropdown"] > .autocomplete-dropdown-list > [data-testid="autocomplete-dropdown-item"]:nth-child(1) > .autocomplete-dropdown-item-content > .value'
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        ".react-popover > .measure-settings > .custom-sql-selector > .textarea-wrap > textarea",
        selectorLogging
      )
      await page.waitForSelector(
        ".react-popover > .measure-settings > .custom-sql-selector > .textarea-wrap > textarea"
      )
      await page.click(
        ".react-popover > .measure-settings > .custom-sql-selector > .textarea-wrap > textarea"
      )

      await await waitUntilHTMLRendered(page)
      await checkForModal(page)
      await page.waitForSelector(
        ".react-popover > .measure-settings > .custom-sql-selector > .textarea-wrap > textarea"
      )
      await page.$eval(
        ".react-popover > .measure-settings > .custom-sql-selector > .textarea-wrap > textarea",
        function clear(e) {
          e.value = ""
        }
      )
      await page.type(
        ".react-popover > .measure-settings > .custom-sql-selector > .textarea-wrap > textarea",
        "case when Faker_Geo_Legacy.Big_Int >= 9223371698849455000 then 11 else cast((cast(Faker_Geo_Legacy.Big_Int as float) - -9223371758128610000) * 6.505213252402347e-19 as int) end"
      )
      await page.keyboard.press("Enter")

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        '#root > .app > .dashboard-container > .chart-editor-container > [data-testid="chart-editor-left-panel"]',
        selectorLogging
      )
      await page.waitForSelector(
        '#root > .app > .dashboard-container > .chart-editor-container > [data-testid="chart-editor-left-panel"]'
      )
      await page.click(
        '#root > .app > .dashboard-container > .chart-editor-container > [data-testid="chart-editor-left-panel"]'
      )

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(".data-selector-container #measure-add-2", selectorLogging)
      await page.waitForSelector(".data-selector-container #measure-add-2")
      await page.click(".data-selector-container #measure-add-2")

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
        const expected = "1,694"
        const val = await page.$eval(
          "#chart2 > div.md-table-wrapper > div.md-table-scroll > table > tr:nth-child(2) > td:nth-child(2)",
          (e) => {
            return e.innerHTML
          }
        )
        if (val !== expected) {
          throw new Error(
            `Could not continue, invalid count: "${val}" !== "${expected}"`
          )
        }
      }

      await waitUntilHTMLRendered(page)
      await checkForModal(page)
      logValue(
        "#chart1 > .md-table-wrapper > .md-table-scroll > table > .table-row:nth-child(3) > td:nth-child(1)",
        selectorLogging
      )
      await page.waitForSelector(
        "#chart1 > .md-table-wrapper > .md-table-scroll > table > .table-row:nth-child(3) > td:nth-child(1)"
      )
      await page.click(
        "#chart1 > .md-table-wrapper > .md-table-scroll > table > .table-row:nth-child(3) > td:nth-child(1)"
      )

      {
        await waitUntilHTMLRendered(page)
        await checkForModal(page)
        const expected = "1,672"
        const val = await page.$eval(
          "#chart2 > div.md-table-wrapper > div.md-table-scroll > table > tr:nth-child(2) > td:nth-child(2)",
          (e) => {
            return e.innerHTML
          }
        )
        if (val !== expected) {
          throw new Error(
            `Could not continue, invalid count: "${val}" !== "${expected}"`
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
