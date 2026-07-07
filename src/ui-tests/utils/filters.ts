// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { clickAfterVisible, waitForVisible } from "./common"

export async function applyFilter(index: number, filter) {
  const sqlFilterOptionSelector = `.sql-filters-container>div:nth-child(${index})`

  await clickAfterVisible(sqlFilterOptionSelector)
  await waitForVisible(sqlFilterOptionSelector)
  await selectFilterDataSource(filter.dataSource)
  await selectFilterColumn(filter.column)
  await selectFilterPredicate(filter.predicate)
  await submitFilterValue(filter.value)

  return await page.click(".count-widget")
}

export async function applyDateRangeFilter(index: number, filter) {
  const sqlFilterOptionSelector = `.sql-filters-container>div:nth-child(${index})`
  const dataSourceInputSelector = ".autocomplete-input-elm"
  const startDateInputSelector = ".date-filter-input .start-date-input"
  const endDateInputSelector = ".date-filter-input .end-date-input"

  await clickAfterVisible(sqlFilterOptionSelector)
  await waitForVisible(dataSourceInputSelector)
  await selectFilterDataSource(filter.dataSource)
  await selectFilterColumn(filter.column)
  await clickAfterVisible(startDateInputSelector)
  await clickAfterVisible(endDateInputSelector)

  return await page.click(".count-widget")
}

export async function removeFilter(index) {
  const clearFilterSelector = `.sql-filters-container>div:nth-child(${index}) .clear`

  return await clickAfterVisible(clearFilterSelector)
}

export async function selectFilterDataSource(dataSource: string) {
  const dataSourceInputSelector = "input.autocomplete-input-elm"
  const filterDataSourceSelector =
    ".autocomplete-dropdown-list > div:nth-child(1)"

  await waitForVisible(dataSourceInputSelector)
  await page.type(dataSourceInputSelector, dataSource)

  return await clickAfterVisible(filterDataSourceSelector)
}

export async function selectFilterColumn(dataSource: string) {
  const filterColumnInputSelector =
    ".react-selectize-search-field-and-selected-values"

  await clickAfterVisible(filterColumnInputSelector)
  await page.keyboard.type(dataSource)

  return await page.keyboard.press("Enter")
}

function getPredicateIndex(predicate) {
  const NUMERICAL_PREDICATES = ["=", "<=", "<", ">", ">=", "!="]
  const STRING_PREDICATES = ["contains", "equals", "not contains", "not equals"]

  if (NUMERICAL_PREDICATES.indexOf(predicate) === -1) {
    return STRING_PREDICATES.indexOf(predicate)
  } else {
    return NUMERICAL_PREDICATES.indexOf(predicate)
  }
}

export async function selectFilterPredicate(predicate: number) {
  const adjustedPredicateIndex = getPredicateIndex(predicate) + 1
  const filterOperatorSelector = ".filter-operator"
  const filterOperatorDropdownSelector = ".filter-operators-dropdown"
  const filterPredicateSelector = `.filter-operators-dropdown .custom-selector-popup > div:nth-child(${adjustedPredicateIndex})`

  await clickAfterVisible(filterOperatorSelector)
  await waitForVisible(filterOperatorDropdownSelector)

  return await page.click(filterPredicateSelector)
}

export async function submitFilterValue(dataSource: string) {
  const filterValueSelector = ".filter-value input"

  await waitForVisible(filterValueSelector)
  await page.click(filterValueSelector)
  await page.keyboard.type(dataSource)

  return await page.keyboard.press("Enter")
}
