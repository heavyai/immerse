// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "expect-puppeteer"
import { processPause } from "./common"
import { DASHBOARD_TITLE_PLACEHOLDER_ID } from "../../constants/dashboards"

export async function expectContainsText(selector: string, text: string) {
  return await expect(page).toMatchElement(selector, { text })
}

export async function expectAttribute(
  selector: string,
  attributeKey: string,
  attributeValue: string
) {
  return await expect(page).toMatchElement(
    `${selector}[${attributeKey}="${attributeValue}"]`
  )
}

export const expectDashboardTitleInputToMatch = async (
  dashboardName: string
) => {
  const placeholderSelector = `[data-testid='${DASHBOARD_TITLE_PLACEHOLDER_ID}']`

  await page.waitForSelector(placeholderSelector)
  const input = await page.$(placeholderSelector)
  const inputValue = await page.evaluate((el) => el?.innerText, input)

  return await expect(inputValue).toMatch(dashboardName)
}

export async function expectLegendItems(legendItems) {
  let index = 1
  for (const legendItem of legendItems) {
    await expectContainsText(
      `.legendables .body>div:nth-child(${index}) .text`,
      legendItem
    )
    index = index + 1
  }

  return await processPause()
}

export async function expectLegendRange(legendMin, legendMax) {
  await page.waitForSelector(".legendables>.range")

  return Promise.all([
    expectContainsText(
      ".legendables>.range>.block:first-of-type>.text>span",
      legendMin
    ),
    expectContainsText(
      ".legendables>.range>.block:last-of-type>.text>span",
      legendMax
    )
  ])
}
