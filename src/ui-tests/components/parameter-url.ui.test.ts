// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { processPause, setParameterUrl } from "ui-tests/utils/common"
import {
  openParameterPanel,
  expectAttribute,
  expectContainsText,
  clickAfterVisible
} from "../utils"
import {
  findDashboard,
  goToDashboardList,
  importDashboard,
  searchDashboardList
} from "../utils/dashboards"

describe("Parameter url", () => {
  beforeAll(async () => {
    const dashboardName = "Demo: Parameter URL (don’t delete)"
    const dashboardNameHighlighted = ".search-term-highlight"

    await goToDashboardList()
    await searchDashboardList(dashboardName)
    const dashboardFound = (await findDashboard(dashboardName)) !== null

    if (!dashboardFound) {
      // if the dashboard does not exist, it will be imported
      await importDashboard(
        "src/ui-tests/test-json-files/Demo_ Parameter URL (don’t delete).json"
      )
      await searchDashboardList(dashboardName)
    }

    await clickAfterVisible(
      `div[title='${dashboardName}'] > span > ${dashboardNameHighlighted}`
    )
  })
  it("should be able to update value of the parameter through url in the first tab", async () => {
    const parameterPanelSelector = ".parameter-panel__content"
    const dashboardGridLayoutSelector = ".dashboard.react-grid-layout"
    const textFieldSelector = ".mdc-text-field__input"
    const widgetNumberValueSelector =
      ".parameter-widget__numeric-input__text-field"
    const nthOfTypeSelector = "> div:nth-of-type"
    const widgetValue = "value"
    const columnTypeNewValue = "American Airlines"
    const columnNewValue = "airtime"
    const numberNewValue = "40"
    const customNewValue = "max(airtime)"
    const titleTableSelector = "#chart-1-title"
    const titleComboSelector = "#chart-2-title"
    const parametersValues = `parameter.number_type=${numberNewValue}&parameter.custom-type=${customNewValue}&parameter.column_value_type=${columnTypeNewValue}&parameter.column_type=${columnNewValue}`
    const firstTabHrefSelector =
      ".dashboard-tab-scroll-container > div:nth-of-type(1) > a"

    await setParameterUrl(firstTabHrefSelector, parametersValues)
    await processPause()
    await expectAttribute(
      `${dashboardGridLayoutSelector} ${nthOfTypeSelector}(2) form ${textFieldSelector}`,
      widgetValue,
      columnTypeNewValue
    )
    await expectAttribute(
      `${dashboardGridLayoutSelector} ${nthOfTypeSelector}(1) form ${textFieldSelector}`,
      widgetValue,
      columnNewValue
    )
    await expectAttribute(
      `${dashboardGridLayoutSelector} ${widgetNumberValueSelector} ${textFieldSelector}`,
      widgetValue,
      numberNewValue
    )
    await expectAttribute(
      `${dashboardGridLayoutSelector} ${nthOfTypeSelector}(3) ${textFieldSelector}`,
      widgetValue,
      customNewValue
    )
    await processPause()
    await openParameterPanel()
    await expectAttribute(
      `${parameterPanelSelector} ${nthOfTypeSelector}(3) ${textFieldSelector}`,
      widgetValue,
      columnTypeNewValue
    )
    await expectAttribute(
      `${parameterPanelSelector} ${nthOfTypeSelector}(2) ${textFieldSelector}`,
      widgetValue,
      columnNewValue
    )
    await expectAttribute(
      `${parameterPanelSelector} ${widgetNumberValueSelector} ${textFieldSelector}`,
      widgetValue,
      numberNewValue
    )
    await expectAttribute(
      `${parameterPanelSelector} ${nthOfTypeSelector}(4) ${textFieldSelector}`,
      widgetValue,
      customNewValue
    )
    await expectContainsText(
      titleTableSelector,
      `${columnNewValue} ${customNewValue}`
    )
    await expectContainsText(
      titleComboSelector,
      `${columnTypeNewValue} and ${numberNewValue} by Carrier Name`
    )
  })
  it("should be able to update value of the parameter through url in the second tab", async () => {
    const parameterPanelSelector = ".parameter-panel__content"
    const dashboardGridLayoutSelector = ".dashboard.react-grid-layout"
    const textFieldSelector = ".mdc-text-field__input"
    const widgetNumberValueSelector =
      ".parameter-widget__numeric-input__text-field"
    const nthOfTypeSelector = "> div:nth-of-type"
    const widgetValue = "value"
    const columnTypeNewValue = "Delta Air Lines"
    const columnNewValue = "taxiin"
    const numberNewValue = "58"
    const customNewValue = "max(taxiin)"
    const titleHeatSelector = "#chart-2-title"
    const titlePieSelector = "#chart-3-title"
    const titleNumberSelector = "#chart-4-title"
    const parametersValues = `parameter.number_type=${numberNewValue}&parameter.custom-type=${customNewValue}&parameter.column_value_type=${columnTypeNewValue}&parameter.column_type=${columnNewValue}`
    const secondTabHrefSelector =
      ".dashboard-tab-scroll-container > div:nth-of-type(2) > a"
    const secondTabSelector = "div:nth-of-type(2) > a > .dashboard-tab-name"

    await clickAfterVisible(secondTabSelector)
    await processPause()
    await setParameterUrl(secondTabHrefSelector, parametersValues)
    await processPause()
    await expectAttribute(
      `${dashboardGridLayoutSelector} ${nthOfTypeSelector}(2) form ${textFieldSelector}`,
      widgetValue,
      columnTypeNewValue
    )
    await expectAttribute(
      `${dashboardGridLayoutSelector} ${nthOfTypeSelector}(1) form ${textFieldSelector}`,
      widgetValue,
      columnNewValue
    )
    await expectAttribute(
      `${dashboardGridLayoutSelector} ${widgetNumberValueSelector} ${textFieldSelector}`,
      widgetValue,
      numberNewValue
    )
    await expectAttribute(
      `${dashboardGridLayoutSelector} ${nthOfTypeSelector}(3) ${textFieldSelector}`,
      widgetValue,
      customNewValue
    )
    await processPause()
    await openParameterPanel()
    await expectAttribute(
      `${parameterPanelSelector} ${nthOfTypeSelector}(3) ${textFieldSelector}`,
      widgetValue,
      columnTypeNewValue
    )
    await expectAttribute(
      `${parameterPanelSelector} ${nthOfTypeSelector}(2) ${textFieldSelector}`,
      widgetValue,
      columnNewValue
    )
    await expectAttribute(
      `${parameterPanelSelector} ${widgetNumberValueSelector} ${textFieldSelector}`,
      widgetValue,
      numberNewValue
    )
    await expectAttribute(
      `${parameterPanelSelector} ${nthOfTypeSelector}(4) ${textFieldSelector}`,
      widgetValue,
      customNewValue
    )
    await expectContainsText(
      titlePieSelector,
      `${customNewValue} by ${columnNewValue}`
    )
    await expectContainsText(
      titleHeatSelector,
      `${columnTypeNewValue} and ${numberNewValue} by Carrier Name, Airtime`
    )
    await expectContainsText(titleNumberSelector, "Avg Taxiin")
  })
})
