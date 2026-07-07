// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  clickAfterVisible,
  clickByText,
  processPause,
  waitForHidden,
  waitForVisible
} from "./common"

export async function createChart(chartType: string, chartSpec) {
  const chartTypeBtnSelector = `.${chartType}-btn`

  if (!chartSpec.multilayer) {
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      page.click(".add-chart")
    ])
  }

  await processPause()
  await clickAfterVisible(chartTypeBtnSelector)

  if (chartSpec.dataSource) {
    await processPause()
    await selectChartDataSource(chartSpec.dataSource)
  }

  await processPause()
  await asyncDimensions(chartSpec.dimensions)
  await asyncMeasures(chartSpec.measures)

  return await processPause()
}

export async function editChart(chartId: string) {
  /* This function edits chart through the dashboard page
  :param chartId: enter the chart number
  */

  const chartSettingsSelector = `#chart-${chartId}-settings`

  return await clickAfterVisible(chartSettingsSelector)
}

export async function chartEditCancel() {
  const chartEditCancelSelector = '[data-testid="chart-edit-cancel"]'

  return await clickAfterVisible(chartEditCancelSelector)
}

export async function embedHtmlContent(content: string, confirm: boolean) {
  /* This function adds the content to the text chart
  :param content: enter the Html content
  :param confirm: enter the true or false (gives option to apply the Html content or cancel)
  */
  const embedButtonSelector = "button[title='Show HTML source']"
  const textFieldSelector = ".ql-editor[contenteditable=true]"
  const okButtonSelector = ".ql-html-buttonOk"
  const cancelButtonSelector = ".ql-html-buttonCancel"

  await clickAfterVisible(embedButtonSelector)
  await clickAfterVisible(textFieldSelector)
  await page.keyboard.type(content)

  if (confirm === true) {
    await clickAfterVisible(okButtonSelector)
  } else {
    await clickAfterVisible(cancelButtonSelector)
  }

  return await processPause()
}

async function asyncDimensions(dimensions = []) {
  let dimensionIndex = 1
  for (const dimensionName of dimensions) {
    await selectDimension(dimensionIndex, dimensionName)
    dimensionIndex = dimensionIndex + 1
  }

  return await processPause()
}

async function asyncMeasures(measures = []) {
  let measureIndex = 1
  for (const measure of measures) {
    if (typeof measure === "object" && measure.type === "custom") {
      await selectCustomMeasure(measureIndex, measure.value)
    } else if (typeof measure === "object" && measure.aggregate) {
      await selectMeasure(measureIndex, measure.name, measure.aggregate)
    } else if (measure.length) {
      await selectMeasure(measureIndex, measure)
    }
    measureIndex = measureIndex + 1
  }

  return await processPause()
}

export async function deleteSelector(selectorType: string, index: number) {
  const removeSelector = `.${selectorType}-container>div:nth-child(${index}) .remove`

  return await clickAfterVisible(removeSelector)
}

export async function saveChart() {
  await processPause()
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click('[data-testid="chart-edit-apply"]')
  ])
  return await processPause()
}

// dataLayerIndex is 1-indexed
export async function selectChartDataSource(
  dataSource: string,
  dataLayerIndex?: number
) {
  const scopeSelector = dataLayerIndex
    ? `[data-testid="accordion-fold"]:nth-child(${dataLayerIndex})`
    : ".chart-editor-left-panel"

  const dataSourceInputSelector = `${scopeSelector} [data-testid="autocomplete-input"]`
  const dropDownDataSourceSelector = `${scopeSelector} [data-testid="autocomplete-dropdown-item"]:first-of-type`

  await clickAfterVisible(`${scopeSelector} .data-source-selector`)
  await waitForVisible(dataSourceInputSelector)
  await page.type(dataSourceInputSelector, dataSource)

  return await clickAfterVisible(dropDownDataSourceSelector)
}

export async function selectDimension(
  index: number,
  dimensionName: string,
  dataLayerIndex?: number
) {
  const scopeSelector = dataLayerIndex
    ? `[data-testid="accordion-fold"]:nth-child(${dataLayerIndex})`
    : ".chart-editor-left-panel"

  const dropDownDimensionSelector = `${scopeSelector} .dimensions-container>div:nth-child(${index})`
  const selectDimensionInputSelector = `${scopeSelector} .dimensions-container .autocomplete-input input`

  await clickAfterVisible(dropDownDimensionSelector)
  await clickAfterVisible(selectDimensionInputSelector)
  await page.keyboard.type(dimensionName)
  await page.keyboard.press("Enter")
  await page.keyboard.press("Enter")

  await waitForHidden(".invisible-overlay")
  await waitForHidden(".selector-loading")

  return await processPause()
}

export async function selectMeasure(
  index: number,
  measureName: string,
  aggregate?: string
) {
  const dropDownMeasureSelector = `.measures-container>div:nth-child(${index}) [data-testid="column-selector-select-button"]`
  const selectMeasureInputSelector =
    ".measures-container .autocomplete-input input"

  await clickAfterVisible(dropDownMeasureSelector)
  await processPause()
  await clickAfterVisible(selectMeasureInputSelector)
  await page.keyboard.type(measureName)
  await page.keyboard.press("Enter")

  const aggregateVisible = (await page.$(".agg-type-group")) !== null
  if (aggregateVisible && aggregate) {
    await clickByText(aggregate)
  }
  await page.keyboard.press("Enter")

  await waitForHidden(".invisible-overlay")
  await waitForHidden(".selector-loading")

  return await processPause()
}

export async function selectMeasureMulti(
  index: number,
  measureName: string,
  dataLayerIndex: number,
  aggregate?: string
) {
  const scopeSelector = dataLayerIndex
    ? `[data-testid="accordion-fold"]:nth-child(${dataLayerIndex})`
    : ".chart-editor-left-panel"
  const dropDownMeasureSelector = `${scopeSelector} .measures-container>div:nth-child(${index}) [data-testid="column-selector-select-button"]`
  const selectMeasureInputSelector = `${scopeSelector} .measures-container .autocomplete-input input`

  await clickAfterVisible(dropDownMeasureSelector)
  await processPause()
  await clickAfterVisible(selectMeasureInputSelector)
  await page.keyboard.type(measureName)
  await page.keyboard.press("Enter")

  const aggregateVisible =
    (await page.$(`${scopeSelector} .agg-type-group`)) !== null
  if (aggregateVisible && aggregate) {
    await clickByText(aggregate)
  }
  await page.keyboard.press("Enter")

  await waitForHidden(".invisible-overlay")
  await waitForHidden(".selector-loading")

  return await processPause()
}

export async function selectCustomMeasure(
  index: number,
  customMeasure: string
) {
  const dropDownMeasureSelector = `.measures-container>div:nth-child(${index})`
  const selectMeasureOptionSelector =
    ".measures-container .autocomplete-dropdown-item:nth-child(1)"

  await clickAfterVisible(dropDownMeasureSelector)
  await clickAfterVisible(selectMeasureOptionSelector)
  await page.type(".custom-sql-manager textarea", customMeasure)
  await page.click('[data-testid="custom-sql-manager-apply"]')

  await waitForHidden(".invisible-overlay")
  await waitForHidden(".selector-loading")

  return await processPause()
}

export async function sortByDropdown(sortNumber: number) {
  const sortSelector = `.custom-selector-popup>div:nth-child(${sortNumber})`

  await waitForVisible(".sort-by-dropdown")
  await page.click(".sort-by-dropdown > .custom-selector-display")
  await waitForVisible(".sort-by-dropdown > .react-popover")

  return await page.click(sortSelector)
}

export async function getMapRect(selector = "canvas.mapboxgl-canvas") {
  const mapCanvas = await page.$(selector)

  const mapRect = await page.evaluate((el) => {
    const { x, y, width, height } = el.getBoundingClientRect()
    // For some reason, the DOMRect does not like to exit the page context -
    // it comes out as an empty object if returned directly.
    return { x, y, width, height }
  }, mapCanvas)

  return mapRect
}
