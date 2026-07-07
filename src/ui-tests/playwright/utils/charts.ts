// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Page, expect, test } from "@playwright/test"
import { BASE_TEST_URL } from "ui-tests/utils"
import { asTestId, chartSelectors } from "../ui-automation/selectors"
import { getChartIdFromPage, waitForThriftResponse } from "./common"

// dataLayerIndex is 1-indexed
export async function selectChartDataSource(
  page: Page,
  dataSource: string,
  dataLayerIndex?: number
) {
  const scopeSelector = getDataLayerScopeSelector(dataLayerIndex)

  const dataSourceInputSelector = `${scopeSelector} [data-testid="autocomplete-input"]`

  const dataSourceSelector = await page.waitForSelector(
    `${scopeSelector} .data-source-selector`
  )
  dataSourceSelector.click()
  await page.locator(dataSourceInputSelector).fill(dataSource)

  await page
    .getByTestId("autocomplete-dropdown-item")
    .locator("div")
    .first()
    .click()
  // Can't depend on a network call here as table may already be stored in crossfilter
  await expect(page.getByText("Connect to a Data Source")).toHaveCount(0)
  await waitForSelectorLoading(page)
}

export function getDataLayerScopeSelector(dataLayerIndex?: number) {
  return dataLayerIndex
    ? `[data-testid="accordion-fold"]:nth-child(${dataLayerIndex})`
    : ".chart-editor-left-panel"
}

export async function selectDimension(
  page: Page,
  index: number,
  dimensionName: string,
  dataLayerIndex?: number
) {
  const scopeSelector = getDataLayerScopeSelector(dataLayerIndex)
  const dropDownDimensionSelector = `${scopeSelector} .dimensions-container>div:nth-child(${index})`
  const selectDimensionInputSelector = `${scopeSelector} .dimensions-container .autocomplete-input input`

  await page.waitForSelector(".add-btn.inactive", { state: "hidden" })
  await page.locator(dropDownDimensionSelector).click()
  await page.locator(selectDimensionInputSelector).click()
  await page.keyboard.type(dimensionName)
  await page.keyboard.press("Enter")
  await page.keyboard.press("Enter")
  await waitForSelectorLoading(page)
  await expect(page.getByText(dimensionName, { timeout: 5000 })).toBeDefined()
}

async function asyncDimensions(page: Page, dimensions = []) {
  let dimensionIndex = 1
  for (const dimensionName of dimensions) {
    await selectDimension(page, dimensionIndex, dimensionName)
    dimensionIndex = dimensionIndex + 1
  }
}

export async function selectMeasure(
  page: Page,
  index: number,
  measureName: string,
  aggregate?: string
) {
  const dropDownMeasureSelector = `.measures-container>div:nth-child(${index}) [data-testid="column-selector-select-button"]`
  const selectMeasureInputSelector =
    ".measures-container .autocomplete-input input"

  await page.locator(dropDownMeasureSelector).click()
  await page.locator(selectMeasureInputSelector).click()
  await page.locator(selectMeasureInputSelector).fill(measureName)

  await page.locator(selectMeasureInputSelector).press("Enter")

  const aggregateVisible = (await page.locator(".agg-type-group")) !== null
  if (aggregateVisible && aggregate) {
    await page.locator(".agg-type-wrapper").getByText(aggregate).click()
  }
  await page.keyboard.press("Enter")
  await waitForSelectorLoading(page)
  await expect(page.getByText(measureName, { timeout: 5000 })).toBeDefined()
}

export async function selectMeasureMulti(
  page: Page,
  index: number,
  measureName: string,
  dataLayerIndex: number,
  aggregate?: string
) {
  const scopeSelector = getDataLayerScopeSelector(dataLayerIndex)
  const dropDownMeasureSelector = `${scopeSelector} .measures-container>div:nth-child(${index}) [data-testid="column-selector-select-button"]`
  const selectMeasureInputSelector = `${scopeSelector} .measures-container .autocomplete-input input`

  await page.locator(dropDownMeasureSelector).click()
  await page.locator(selectMeasureInputSelector).click()
  await page.locator(selectMeasureInputSelector).fill(measureName)
  await page.locator(selectMeasureInputSelector).press("Enter")

  if (aggregate) {
    await page.waitForSelector(`${scopeSelector} .agg-type-group`)
    await page.getByText(aggregate).click()
  }

  await page.keyboard.press("Enter")

  await waitForSelectorLoading(page)
}

export async function selectCustomMeasure(
  page: Page,
  index: number,
  customMeasure: string
) {
  const dropDownMeasureSelector = `.measures-container>div:nth-child(${index})`
  const selectMeasureOptionSelector =
    ".measures-container .autocomplete-dropdown-item:nth-child(1)"

  await page.locator(dropDownMeasureSelector).click()
  await page.locator(selectMeasureOptionSelector).click()
  await page.locator(".custom-sql-manager textarea").fill(customMeasure)
  await page.getByTestId("custom-sql-manager-apply").click()

  await waitForSelectorLoading(page)
}

export type MeasureName = string
type MeasureWithAggregate = {
  name: string
  aggregate: string
}
type CustomMeasure = {
  type: "custom"
  value: string
}

type UITestMeasure = MeasureName | MeasureWithAggregate | CustomMeasure

const isCustomMeasure = (measure: UITestMeasure): measure is CustomMeasure =>
  (measure as CustomMeasure).type === "custom"

const isMeasureWithAggregate = (
  measure: UITestMeasure
): measure is MeasureWithAggregate =>
  Boolean((measure as MeasureWithAggregate).aggregate)

async function asyncMeasures(page: Page, measures: UITestMeasure[] = []) {
  let measureIndex = 1
  for (const measure of measures) {
    if (isCustomMeasure(measure)) {
      await selectCustomMeasure(page, measureIndex, measure.value)
    } else if (isMeasureWithAggregate(measure)) {
      await selectMeasure(page, measureIndex, measure.name, measure.aggregate)
    } else {
      await selectMeasure(page, measureIndex, measure)
    }
    measureIndex = measureIndex + 1
  }
}

export async function addDataSource(page, chartSpec) {
  return test.step("Add data source", async () => {
    if (chartSpec.dataSource) {
      let tableDeetsPromise = Promise.resolve()
      if (!chartSpec.tableAlreadyLoaded) {
        tableDeetsPromise = waitForThriftResponse(page, "get_table_details")
      }

      await selectChartDataSource(page, chartSpec.dataSource)
      await page.waitForSelector(".add-btn.inactive", { state: "hidden" })
      await page.waitForSelector(".selector-box.button.inactive", {
        state: "hidden"
      })
      await tableDeetsPromise
    }
  })
}

export async function selectChartType(page: Page, chartType: string) {
  return test.step("Select chart type", async () => {
    const chartTypeBtnSelector = `.${chartType}-btn`
    const chartTypeButton = await page.waitForSelector(chartTypeBtnSelector)
    await chartTypeButton.click()
  })
}

export async function createChart(page: Page, chartType: string, chartSpec) {
  if (!chartSpec.multilayer) {
    const addChartButton = await page.waitForSelector(".add-chart")
    await addChartButton.click()
  }

  const chartId = getChartIdFromPage(page)
  await selectChartType(page, chartType)
  await addDataSource(page, chartSpec)
  await asyncDimensions(page, chartSpec.dimensions)
  await asyncMeasures(page, chartSpec.measures)
  return chartId
}

export async function saveChart(page: Page) {
  await page.getByTestId("chart-edit-apply").click()
  await page.waitForResponse(BASE_TEST_URL)
}

/**
 * NOT a selector in the DOM sense, but an immerse selector (dimension or measure)
 * This will wait for selectors to not be in loading state.
 * Use this after selecting a measure, or after selecting a datasource where measures are
 * auto populated.
 *
 * @param page Playwright page object
 */
export async function waitForSelectorLoading(page: Page) {
  await page.waitForSelector(".invisible-overlay", { state: "hidden" })
  await page.waitForSelector(".selector-loading", { state: "hidden" })
}

/**
 * Waits for a response from a render_vega call. This should ensure that
 * the thrift call has been made and we have received a response
 * TBD on the utility of wrapping the generic thrift response method. Trying it out.
 *
 * @param page Playwright page object
 */
export const waitForRenderVega = async (page: Page) => {
  // This waits for a render_vega response
  await waitForThriftResponse(page, "render_vega")
}

/**
 * Waits for tiles to load, then render_vega call, and ensures that the DOM elements are there
 * Use after chart creation or editing to make sure the map is loaded fully in the DOM
 *
 * @param page Playwright page object
 */
export const waitForMapboxChartLoad = async (
  page: Page,
  chartLocator?: string
) => {
  // Wait for tiles to load
  await page.waitForResponse(/https:\/\/api\.mapbox\.com.*\.pbf.*/)
  // Wait for the render vega call
  await waitForRenderVega(page)
  // Wait for map DOM to be there
  await page.waitForSelector(
    chartLocator || asTestId(chartSelectors.chartContainer)
  )
  await page.waitForSelector(".mapboxgl-canvas")
}
