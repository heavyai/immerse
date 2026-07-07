// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Page, test } from "@playwright/test"
import {
  addDataSource,
  getDataLayerScopeSelector,
  MeasureName,
  selectChartType,
  waitForSelectorLoading
} from "./charts"

export async function selectVegaComboDimension(
  page: Page,
  index: number,
  dimensionName: string,
  dataLayerIndex?: number
) {
  const scopeSelector = getDataLayerScopeSelector(dataLayerIndex)
  const dropDownDimensionSelector = `${scopeSelector} .dimensions-container>div:nth-child(${index})`
  await page.locator(dropDownDimensionSelector).click()
  await page.keyboard.type(dimensionName)
  await page.keyboard.press("Enter")
  await waitForSelectorLoading(page)
}

async function asyncDimensionsVegaCombo(page: Page, dimensions = []) {
  for (const [index, dimensionName] of dimensions.entries()) {
    await selectVegaComboDimension(page, index + 1, dimensionName)
  }
}

export async function selectVegaMeasure(
  page: Page,
  index: number,
  measureName: string,
  aggregate?: string
) {
  const dropDownMeasureSelector = `.chart-editor-left-panel .measures-container>div:nth-child(${index})`

  const dropDownMeasure = await page.locator(dropDownMeasureSelector)
  await dropDownMeasure.click()
  await page.waitForSelector(".selector-column-dropdown")

  await page.getByText(measureName).click()
  const aggregateVisible = (await page.$(".agg-type-group")) !== null
  if (aggregateVisible && aggregate) {
    await page.getByText(aggregate).click()
  }
  await page.keyboard.press("Enter")

  await waitForSelectorLoading(page)
}

export async function asyncMeasuresVegaCombo(
  page: Page,
  measures: MeasureName[] = []
) {
  for (const [index, measure] of measures.entries()) {
    await selectVegaMeasure(page, index + 1, measure)
  }
}

export async function createVegaComboChart(page: Page, chartSpec) {
  return test.step("Create vega combo chart", async () => {
    const addChartButton = await page.waitForSelector(".add-chart")
    await addChartButton.click()

    await selectChartType(page, "vega-combo")
    await addDataSource(page, chartSpec)
    await asyncDimensionsVegaCombo(page, chartSpec.dimensions)
    await asyncMeasuresVegaCombo(page, chartSpec.measures)
  })
}
