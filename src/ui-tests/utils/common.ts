// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { waitUntilHTMLRendered } from "./recorder"

// Helper function to replace deprecated page.waitForTimeout()
async function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export async function clickAfterVisible(selector: string) {
  await page.waitForSelector(selector, { visible: true })
  return await page.click(selector)
}

// Source for escapeXpathString and clickByText: https://gist.github.com/tokland/d3bae3b6d3c1576d8700405829bbdb52
function escapeXpathString(str: string) {
  const splitQuotes = str.replace(/'/g, `', "'", '`)
  return `concat('${splitQuotes}', '')`
}

export async function clickByText(text: string) {
  const escapedText = escapeXpathString(text)
  const xpath = `//*[contains(text(), ${escapedText})]`

  // Use page.locator with XPath (new Puppeteer v20+ API)
  const locator = page.locator(`::-p-xpath(${xpath})`)

  try {
    await locator.click()
  } catch (error) {
    throw new Error(`Element not found: ${text}`)
  }
}

export async function waitForHidden(selector: string) {
  return await page.waitForSelector(selector, { hidden: true })
}

export async function waitForVisible(selector: string) {
  return await page.waitForSelector(selector, { visible: true })
}

export async function waitForCrossfilter() {
  await processPause()
  await waitUntilHTMLRendered(page)
  return await processPause()
}

export function getTestUrl(path = "/") {
  const baseUrl = "http://localhost:8002"

  return new URL(path, baseUrl).toString()
}

export const BASE_TEST_URL = getTestUrl()

export async function processPause(seconds = 1) {
  const PROCESS_PAUSE = 1000

  return await delay(PROCESS_PAUSE * seconds)
}

export async function screenshot(name: string) {
  const path = `src/ui-tests/_screenshot-${name}.png`

  return await page.screenshot({ path })
}

// Sets your feature-flag, then reloads the page. Make sure to navigate to a
// page before calling this function, or you will get a "Failed to read the
// 'localStorage'" error. Example navigation:
//
// await page.goto(getTestUrl("control-panel"), { waitUntil: "networkidle0" })
//
export async function setFeatureFlag(featureFlag: string, value: any) {
  const featureFlags = await page.evaluate(
    /* istanbul ignore next */ () =>
      window.localStorage && window.localStorage.featureflags
        ? window.localStorage.featureflags
        : false
  )
  await processPause()
  if (featureFlags) {
    const featureFlagsParsed = JSON.parse(featureFlags)
    featureFlagsParsed[featureFlag] = value
    const featureFlagsJSON = JSON.stringify(featureFlagsParsed)

    await page.evaluate((featureFlagsJSONVal) => {
      window.localStorage.featureflags = featureFlagsJSONVal
    }, featureFlagsJSON)
    await processPause()
  }

  return await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })
}

export async function toggleFeatureFlag(featureFlags: string, toggle: boolean) {
  /* This function enables the feature flag in the control-panel
  :param featureFlags: enter the feature flags name
  :param toggle: enter the true or false (gives option to enable/disable the feature flag)
  */
  const inputSearchSelector = ".mdc-text-field__input"
  const enabledFeatureFlag = ".mdc-switch__thumb"
  const applyFeatureFlag = ".mdc-button--unelevated"

  await page.goto(getTestUrl("/control-panel"), {
    waitUntil: "networkidle0"
  })
  await clickAfterVisible(inputSearchSelector)
  await page.keyboard.type(featureFlags)

  if (toggle === true || toggle === false) {
    await clickAfterVisible(enabledFeatureFlag)
  }

  return await clickAfterVisible(applyFeatureFlag)
}

export async function clickElementWithText(selector: string, text: string) {
  await page.evaluate(
    (selectorVal, textVal) => {
      const elementToClick = Array.from(
        document.querySelectorAll(selectorVal)
      ).find((element) => element.innerText === textVal)
      if (elementToClick) {
        elementToClick.click()
      }
    },
    selector,
    text
  )
  return await processPause()
}

export async function setInputText(selector: string, text: string) {
  await processPause()
  await page.waitForSelector(selector, { visible: true })
  await page.focus(selector)

  await page.evaluate(() => document.execCommand("selectall", false))
  await processPause()
  await page.keyboard.type(text)
}

export const getTestId = (testId: string) => `[data-testid="${testId}"]`

export async function setParameterUrl(
  tabHrefSelector: string,
  parameter: string
) {
  /* This function updates the parameter through the URL
  :param tabHrefSelector: enter the tab href selector
  :param parameter: enter the parameter name and new value
  note: Need to navigate to existing dashboard before setting parameter through the URL
  */

  const tabHref = await page.waitForSelector(tabHrefSelector)
  const hrefValue = await page.evaluate((el) => el?.href, tabHref)
  await page.goto(getTestUrl(`${hrefValue}&${parameter}`), {
    waitUntil: "networkidle0",
    timeout: 0
  })
  return await processPause()
}
