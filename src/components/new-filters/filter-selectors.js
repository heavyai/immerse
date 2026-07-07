// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createSelector } from "reselect"
import moment from "moment"
import { process } from "utils/ImmerseSQLPlusPlus/parser"

import {
  typeCategory,
  TYPE_CATEGORIES
} from "./filter-component/filter-component-options"

import {
  FILTER_TYPE_BOUNDING_BOX,
  FILTER_TYPE_ST_DISTANCE,
  FILTER_TYPE_DISTANCE,
  FILTER_TYPE_ST_CONTAINS,
  FILTER_TYPE_POLYGON,
  FILTER_TYPE_SQL,
  FILTER_TYPE_EMPTY_COHORT,
  FILTER_TYPE_NOT,
  FILTER_TYPE_SIMPLE,
  FILTER_TYPE_BETWEEN
} from "vega/constants/filter-type-constants"

export const getOmnifilters = (state) => state.omnifilters

export const getFiltersValidation = createSelector(
  [getOmnifilters],
  (omnifilters) =>
    omnifilters.reduce((mapping, filterMetadata) => {
      mapping[filterMetadata.name] = checkFilterForCompleteness(
        filterMetadata.filter
      )
      return mapping
    }, {})
) // this function is too complex. Sorry.

/* eslint complexity: ["error", 40] */
export function checkFilterForCompleteness(filter) {
  // undefined filter? No way that's true.
  if (filter === undefined) {
    return false
  }

  // XXX TODO - these are the various geometry filters that can come out of crossfilter.
  // We can't create/edit them in the filter panel (yet), so for now we're just going to
  // assume that they're valid because they were given to us from elsewhere.
  // as we develop the ability to edit them, we'll need to drop them out of this list and
  // do actual checks on them.
  const assumedValidFilterTypes = new Set([
    FILTER_TYPE_BOUNDING_BOX,
    FILTER_TYPE_ST_DISTANCE,
    FILTER_TYPE_DISTANCE,
    FILTER_TYPE_ST_CONTAINS,
    FILTER_TYPE_POLYGON,
    FILTER_TYPE_SQL,
    FILTER_TYPE_EMPTY_COHORT
  ])

  if (assumedValidFilterTypes.has(filter.filterType)) {
    return true
  }

  // negated filters are a special case. We should instead check its contained filter.
  if (filter.filterType === FILTER_TYPE_NOT) {
    return checkFilterForCompleteness(filter.filter)
  }

  // subfilters? check 'em all.
  if (filter.filters) {
    return filter.filters.reduce((complete, f) => {
      complete = complete && checkFilterForCompleteness(f)
      return complete
    }, true)
  }

  // subfilters by dataSource? check 'em all.
  if (filter.filtersByDataSource) {
    return Object.values(filter.filtersByDataSource).reduce((complete, f) => {
      complete = complete && checkFilterForCompleteness(f)
      return complete
    }, true)
  }

  // no data expression? it's not complete.
  const { dataExpression } = filter
  if (
    dataExpression === undefined ||
    dataExpression === null ||
    dataExpression.length === 0
  ) {
    return false
  }

  // no data expression? it's not complete.
  const { dataSource } = filter
  if (
    dataSource === undefined ||
    dataSource === null ||
    dataSource.length === 0
  ) {
    return false
  }

  // simple filters need a value and an operator
  if (filter.filterType === FILTER_TYPE_SIMPLE) {
    const { value, operator } = filter

    return (
      value !== undefined &&
      value !== null &&
      isFilterValueValid(value, filter) &&
      operator !== undefined &&
      operator !== null &&
      operator.length > 0
    )
  } else if (filter.filterType === FILTER_TYPE_BETWEEN) {
    // between filters need a start and an end
    const { start, end } = filter
    return (
      start !== undefined &&
      start !== null &&
      start.toString().length > 0 &&
      end !== undefined &&
      end !== null &&
      end.toString().length > 0
    )
  }

  // something other than that? We blissfully assume that it's complete.
  return true
}

// given a value and a filter, will tell you if the filter is valid.

export function isFilterValueValid(value, filter) {
  const processedValue =
    typeof value === "string" ? process(value, { trackUsage: false }) : value

  const category = typeCategory(filter)

  if (filter === null) {
    return false
  }

  switch (category) {
    case TYPE_CATEGORIES.NUMERIC:
      if (
        typeof parseFloat(processedValue) !== "number" ||
        isNaN(processedValue) ||
        processedValue === ""
      ) {
        return false
      }
      return true
    case TYPE_CATEGORIES.TEXT:
      return processedValue !== ""
    case TYPE_CATEGORIES.BOOL:
      return (
        typeof processedValue === "boolean" ||
        (typeof processedValue === "string" &&
          (processedValue.toLowerCase() === "true" ||
            processedValue.toLowerCase() === "false"))
      )
    case TYPE_CATEGORIES.TIME:
      // If it's an extract type, just make sure that the inputs are valid numbers
      if (filter.extract) {
        return typeof parseFloat(processedValue) === "number"
      }
      // Normally this validation is handled by time picker modal,
      // but relative filters bypass it (and have totally invalid start/end values)
      return moment(processedValue, moment.ISO_8601).isValid()
    default:
      return true
  }
}

/*
  convenience method. Call it with the state, and it'll return a function that'll give you
  a boolean true/false value to check the validity of a filterMetaData object.
*/

export const makeFilterValidator = createSelector(
  [getFiltersValidation],
  (filtersValidation) => (filterMetaData) =>
    filtersValidation[filterMetaData.name]
)

export const makeGetParameterizedCustomSqlFiltersByValue = createSelector(
  [getOmnifilters],
  (omnifilters) => (value) =>
    omnifilters.filter(
      (f) => (f.sharedCustom || f.globalCustom) && f.filter?.sql === value
    )
)
