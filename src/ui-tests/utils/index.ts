// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  createChart,
  deleteSelector,
  saveChart,
  selectChartDataSource,
  selectDimension,
  selectMeasure,
  selectMeasureMulti,
  selectCustomMeasure,
  sortByDropdown,
  getMapRect,
  editChart,
  embedHtmlContent,
  chartEditCancel
} from "./charts"
import {
  createVegaChart,
  selectVegaDimension,
  selectVegaMeasure,
  selectVegaMeasureMulti
} from "./vega-charts"
import {
  clickAfterVisible,
  clickByText,
  waitForHidden,
  waitForVisible,
  waitForCrossfilter,
  getTestUrl,
  BASE_TEST_URL,
  processPause,
  screenshot,
  setFeatureFlag,
  clickElementWithText,
  setInputText,
  getTestId,
  toggleFeatureFlag
} from "./common"
import {
  clearDashboards,
  createDashboard,
  findDashboard,
  goToDashboardList,
  loadDashboard,
  deleteDashboard,
  saveDashboard,
  searchDashboardList
} from "./dashboards"
import {
  expectContainsText,
  expectAttribute,
  expectLegendItems,
  expectLegendRange
} from "./expect"
import {
  applyFilter,
  applyDateRangeFilter,
  removeFilter,
  selectFilterDataSource,
  selectFilterColumn,
  selectFilterPredicate,
  submitFilterValue
} from "./filters"
import { openParameterPanel } from "./parameter-panel"

export {
  createChart,
  createVegaChart,
  deleteSelector,
  saveChart,
  selectChartDataSource,
  selectDimension,
  selectMeasure,
  selectMeasureMulti,
  selectCustomMeasure,
  sortByDropdown,
  selectVegaDimension,
  selectVegaMeasure,
  selectVegaMeasureMulti,
  clickAfterVisible,
  clickByText,
  waitForHidden,
  waitForVisible,
  waitForCrossfilter,
  getTestUrl,
  BASE_TEST_URL,
  processPause,
  screenshot,
  clearDashboards,
  createDashboard,
  findDashboard,
  goToDashboardList,
  loadDashboard,
  deleteDashboard,
  saveDashboard,
  searchDashboardList,
  expectContainsText,
  expectAttribute,
  expectLegendItems,
  expectLegendRange,
  applyFilter,
  applyDateRangeFilter,
  removeFilter,
  selectFilterDataSource,
  selectFilterColumn,
  selectFilterPredicate,
  submitFilterValue,
  setFeatureFlag,
  toggleFeatureFlag,
  clickElementWithText,
  setInputText,
  getMapRect,
  getTestId,
  editChart,
  embedHtmlContent,
  chartEditCancel,
  openParameterPanel
}
