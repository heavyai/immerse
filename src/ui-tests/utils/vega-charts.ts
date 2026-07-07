// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  clickAfterVisible,
  clickByText,
  processPause,
  waitForHidden,
  waitForVisible
} from "./common"
import {
  selectChartDataSource,
  selectCustomMeasure,
  selectMeasure
} from "./charts"

export async function createVegaChart(chartType: string, chartSpec) {
  const chartTypeBtnSelector = `.${chartType}-btn`

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click(".add-chart")
  ])

  await processPause()
  await clickAfterVisible(chartTypeBtnSelector)

  if (chartSpec.dataSource) {
    await processPause()
    await selectChartDataSource(chartSpec.dataSource)
  }

  await processPause()
  await vegaAsyncDimensions(chartSpec.dimensions)
  await vegaAsyncMeasures(chartSpec.measures)

  return await processPause()
}

export async function selectVegaDimension(
  index: number,
  dimensionName: string,
  dataLayerIndex?: number
) {
  const scopeSelector = dataLayerIndex
    ? `[data-testid="accordion-fold"]:nth-child(${dataLayerIndex})`
    : ".chart-editor-left-panel"

  const dropDownDimensionSelector = `${scopeSelector} .dimensions-container>div:nth-child(${index})`

  await clickAfterVisible(dropDownDimensionSelector)
  await waitForVisible(".selector-column-dropdown")
  await processPause()
  await clickByText(dimensionName)
  await processPause()

  await page.keyboard.press("Enter")

  await waitForHidden(".invisible-overlay")
  await waitForHidden(".selector-loading")

  return await processPause()
}

async function vegaAsyncDimensions(dimensions = []) {
  let dimensionIndex = 1
  for (const dimensionName of dimensions) {
    await selectVegaDimension(dimensionIndex, dimensionName)
    dimensionIndex = dimensionIndex + 2
  }

  return await processPause()
}

export async function selectVegaMeasure(
  index: number,
  measureName: string,
  aggregate?: string
) {
  const dropDownMeasureSelector = `.chart-editor-left-panel .measures-container>div:nth-child(${index})`

  await clickAfterVisible(dropDownMeasureSelector)
  await waitForVisible(".selector-column-dropdown")
  await processPause()
  await clickByText(measureName)
  await processPause()
  const aggregateVisible = (await page.$(".agg-type-group")) !== null
  if (aggregateVisible && aggregate) {
    await clickByText(aggregate)
  }
  await page.keyboard.press("Enter")

  await waitForHidden(".invisible-overlay")
  await waitForHidden(".selector-loading")

  return await processPause()
}

async function vegaAsyncMeasures(measures = []) {
  let measureIndex = 1

  for (const measure of measures) {
    if (typeof measure === "object" && measure.type === "custom") {
      await selectCustomMeasure(measureIndex, measure.value)
    } else if (typeof measure === "object" && measure.aggregate) {
      await selectMeasure(measureIndex, measure.name, measure.aggregate)
    } else if (measure.length) {
      await selectVegaMeasure(measureIndex, measure)
    }
    measureIndex = measureIndex + 1
  }

  return await processPause()
}
export async function selectVegaMeasureMulti(
  index: number,
  measureName: string,
  dataLayerIndex: number,
  aggregate?: string
) {
  const scopeSelector = dataLayerIndex
    ? `[data-testid="accordion-fold"]:nth-child(${dataLayerIndex})`
    : ".chart-editor-left-panel"
  const dropDownMeasureSelector = `${scopeSelector} .measures-container>div:nth-child(${index})`

  await clickAfterVisible(dropDownMeasureSelector)
  await waitForVisible(".selector-column-dropdown")
  await processPause()
  await clickByText(measureName)

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
