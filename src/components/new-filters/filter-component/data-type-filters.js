// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getTypeCategory } from "components/data-column-selector/utils"
import { DATA_TYPE_CATEGORY } from "components/data-column-selector/constants"

// Returns true if the filter component supports given data type
export const isSupportedTypeForFilterComponent = (type, isArray) => {
  const typeCategory = getTypeCategory(type)
  return (
    !(isArray && typeCategory === DATA_TYPE_CATEGORY.DATE_TIME) &&
    !(isArray && type === "DECIMAL") &&
    typeCategory !== DATA_TYPE_CATEGORY.GEO
  )
}

export const isSupportedTypeForDashboardFilter = (type) => {
  const ALLOWED_FILTER_TYPE_CATEGORIES = [
    DATA_TYPE_CATEGORY.NUMBER,
    DATA_TYPE_CATEGORY.ENUM,
    DATA_TYPE_CATEGORY.DATE_TIME,
    DATA_TYPE_CATEGORY.COHORT,
    DATA_TYPE_CATEGORY.CUSTOM
  ]

  return ALLOWED_FILTER_TYPE_CATEGORIES.includes(getTypeCategory(type))
}

export const isSupportedTypeForCohortFilter = (type) => {
  return getTypeCategory(type) === DATA_TYPE_CATEGORY.COHORT
}

export const isSupportedTypeForPrefilter = (type) => {
  const ALLOWED_PREFILTER_TYPE_CATEGORIES = [
    DATA_TYPE_CATEGORY.NUMBER,
    DATA_TYPE_CATEGORY.ENUM,
    DATA_TYPE_CATEGORY.DATE_TIME,
    DATA_TYPE_CATEGORY.CUSTOM
  ]

  return ALLOWED_PREFILTER_TYPE_CATEGORIES.includes(getTypeCategory(type))
}

export const isSupportedTypeForAggregateFilter = (type) => {
  const ALLOWED_AGGREGATE_TYPE_CATEGORIES = [
    DATA_TYPE_CATEGORY.NUMBER,
    DATA_TYPE_CATEGORY.ENUM,
    DATA_TYPE_CATEGORY.DATE_TIME
  ]

  return ALLOWED_AGGREGATE_TYPE_CATEGORIES.includes(getTypeCategory(type))
}
