// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Option definitions and utils for translating filters to
 * dropdown options in filter component and vice-versa
 *
 * For all SIMPLE filterTypes, name must be same as operator
 * Name only needs to be unique to a data type category
 * (we are only searching options that match the data type)
 */
import {
  isNumericType,
  isTimeType,
  TEXT_TYPES,
  BOOL_TYPES
} from "constants/data-types"

import {
  simpleFilter,
  betweenFilter,
  nullFilter,
  notNullFilter,
  notFilter,
  orFilter,
  relativeFilter,
  filterHasChild,
  filterHasChildren,
  isMultiSourceFilter,
  getDataExpressionsForFilter
} from "vega/constants/filter-types"

import { isHardwareDistributed } from "utils/store-utils"

import { process } from "utils/ImmerseSQLPlusPlus/parser"

import {
  FILTER_TYPE_SIMPLE,
  FILTER_TYPE_BETWEEN,
  FILTER_TYPE_ISNULL,
  FILTER_TYPE_ISNOTNULL,
  FILTER_TYPE_OR,
  FILTER_TYPE_AND,
  FILTER_TYPE_NOT,
  FILTER_TYPE_SQL
} from "vega/constants/filter-type-constants"
import { getFullColumnName } from "components/join-manager/utils"

export const noneSelected = {
  name: "NONE",
  label: "Select Operator",
  args: [],
  disabled: true
}

export const divider = {
  name: "divider",
  disabled: true
}

export const greaterThanOrEqual = {
  name: ">=",
  label: "Greater than or equal to",
  args: ["value"],
  filterType: FILTER_TYPE_SIMPLE,
  operator: ">="
}

export const greaterThan = {
  name: ">",
  label: "Greater than",
  args: ["value"],
  filterType: FILTER_TYPE_SIMPLE,
  operator: ">"
}

const lessThan = {
  name: "<",
  label: "Less than",
  args: ["value"],
  filterType: FILTER_TYPE_SIMPLE,
  operator: "<"
}

const lessThanOrEqual = {
  name: "<=",
  label: "Less than or equal to",
  args: ["value"],
  filterType: FILTER_TYPE_SIMPLE,
  operator: "<="
}

export const between = {
  name: FILTER_TYPE_BETWEEN,
  label: "Between",
  args: ["start", "end"],
  filterType: FILTER_TYPE_BETWEEN
}
export const notBetween = negateOption(between, "NOTBETWEEN", "Not between")

export const isNull = {
  name: "ISNULL",
  label: "Is null",
  args: [],
  filterType: FILTER_TYPE_ISNULL
}

export const notNull = {
  name: "ISNOTNULL",
  label: "Not null",
  args: [],
  filterType: FILTER_TYPE_ISNOTNULL
}

export const equal = {
  name: "=",
  label: "Equals",
  args: ["value"],
  filterType: FILTER_TYPE_SIMPLE,
  operator: "="
}

export const notEqual = negateOption(equal, "NOTEQUAL", "Does not equal")

// STRING-SPECIFIC OPTIONS

export const contains = {
  name: "ILIKE",
  label: "Contains",
  args: ["value"],
  filterType: FILTER_TYPE_SIMPLE,
  operator: "ILIKE"
}

const notContains = negateOption(contains, "NOTCONTAINS", "Does not contain")

export const exact = {
  name: "=",
  label: "Exact match",
  args: ["value"],
  filterType: FILTER_TYPE_SIMPLE,
  operator: "=",
  autosuggest: true
}

export const startsWith = {
  name: "ISTARTS_WITH",
  label: "Starts with",
  args: ["value"],
  filterType: FILTER_TYPE_SIMPLE,
  operator: "ISTARTS_WITH"
}

export const endsWith = {
  name: "IENDS_WITH",
  label: "Ends with",
  args: ["value"],
  filterType: FILTER_TYPE_SIMPLE,
  operator: "IENDS_WITH"
}

export const multiSelect = {
  name: "MULTI",
  label: "Custom selection",
  args: [],
  filterType: FILTER_TYPE_OR,
  childfilterType: FILTER_TYPE_SIMPLE,
  operator: "="
}

// COHORT-SPECIFIC OPTIONS

export const cohortInclude = {
  name: "include",
  label: "Includes cohort"
}

export const cohortExclude = {
  name: "exclude",
  label: "Excludes cohort"
}

// ARRAY-SPECIFIC OPTIONS

export const arrayContains = {
  name: "=",
  label: "Contains",
  args: ["value"],
  filterType: FILTER_TYPE_SIMPLE,
  operator: "="
}

export const arrayNotContains = negateOption(
  arrayContains,
  "ARRAYNOTCONTAINS",
  "Does not contain"
)

// TIME-SPECIFIC OPTIONS

const before = {
  name: "<",
  label: "Before",
  args: ["value"],
  filterType: FILTER_TYPE_SIMPLE,
  operator: "<"
}

const after = {
  name: ">",
  label: "After",
  args: ["value"],
  filterType: FILTER_TYPE_SIMPLE,
  operator: ">"
}

// returns an option for last [x] [minutes/months/years], not truncated
const lastXToNowOption = (x, datePart, label) => ({
  name: `LAST${x}${datePart}TONOW`,
  label,
  isChildOption: true,
  isRelative: true,
  start: {
    func: "ADD",
    datePart,
    adjustment: -1 * Math.abs(x),
    value: "NOW"
  },
  end: "NOW",
  args: []
})

const truncatedLastXToNowOption = (x, datePart, label) => ({
  name: `TRUNCLAST${x}${datePart}TONOW`,
  label,
  isChildOption: true,
  isRelative: true,
  start: {
    func: "TRUNC",
    datePart,
    adjustment: -1 * Math.abs(x),
    value: "NOW"
  },
  end: "NOW",
  args: []
})

// returns an option for this month/year/etc.
const thisOption = (datePart, label) => ({
  name: `THIS${datePart}`,
  label,
  isChildOption: true,
  isRelative: true,
  start: {
    func: "TRUNC",
    datePart,
    value: "NOW"
  },
  end: "NOW",
  args: []
})

// returns an option for "last year", etc. (i.e. truncated before now)
const lastXOption = (datePart, label, adjustment = 1) => ({
  name: `LAST${adjustment}${datePart}`,
  label,
  isChildOption: true,
  isRelative: true,
  start: {
    func: "TRUNC",
    datePart,
    value: {
      func: "ADD",
      datePart,
      adjustment: -1 * adjustment,
      value: "NOW"
    }
  },
  end: {
    func: "TRUNC",
    datePart,
    value: "NOW"
  },
  args: []
})

// start value is not truncated
export const LAST10MINUTE = lastXToNowOption(10, "MINUTE", "Last 10 minutes")
const LAST30MINUTE = lastXToNowOption(30, "MINUTE", "Last 30 minutes")
const LAST1HOUR = lastXToNowOption(1, "HOUR", "Last 60 minutes")

// start value is truncated
export const LAST7DAY = truncatedLastXToNowOption(7, "DAY", "Last 7 days")
const LAST30DAY = truncatedLastXToNowOption(30, "DAY", "Last 30 days")
/* eslint-enable no-magic-numbers */

// start truncated, end set to current time
export const THISDAY = thisOption("DAY", "Today")
const THISWEEK = thisOption("WEEK", "This week")
const THISMONTH = thisOption("MONTH", "This month")
const THISQUARTER = thisOption("QUARTER", "This quarter")
const THISYEAR = thisOption("YEAR", "This year")

// both start and end truncated
const LAST1DAY = lastXOption("DAY", "Yesterday")
const LAST1WEEK = lastXOption("WEEK", "Last week")
const LAST1MONTH = lastXOption("MONTH", "Last month")
const LAST1QUARTER = lastXOption("QUARTER", "Last quarter")
export const LAST1YEAR = lastXOption("YEAR", "Last year")

const relativeOptions = [
  LAST10MINUTE,
  LAST30MINUTE,
  LAST1HOUR,
  divider,
  THISDAY,
  LAST1DAY,
  LAST7DAY,
  THISWEEK,
  LAST1WEEK,
  LAST30DAY,
  THISMONTH,
  LAST1MONTH,
  THISQUARTER,
  LAST1QUARTER,
  THISYEAR,
  LAST1YEAR
]

const presets = {
  name: "presets",
  label: "Presets",
  disabled: true,
  childOptions: relativeOptions
}

export const timeOptions = [
  presets,
  ...Array.from(presets.childOptions),
  between,
  before,
  after,
  notBetween
]

export const numericOptions = [
  greaterThanOrEqual,
  greaterThan,
  equal,
  lessThan,
  lessThanOrEqual,
  between,
  isNull,
  divider,
  notEqual,
  notBetween,
  notNull
]

export const numericOptionsNoNull = [
  greaterThanOrEqual,
  greaterThan,
  equal,
  lessThan,
  lessThanOrEqual,
  between,
  divider,
  notEqual,
  notBetween
]

export const boolOptions = [exact]

export const textOptions = [
  exact,
  multiSelect,
  contains,
  startsWith,
  endsWith,
  divider,
  notContains,
  notEqual,
  notNull,
  isNull
]

export const arrayOptions = [arrayContains, arrayNotContains, isNull, notNull]

export const cohortOptions = [cohortInclude, cohortExclude]

export const TYPE_CATEGORIES = {
  NUMERIC: "NUMERIC",
  TIME: "TIME",
  TEXT: "TEXT",
  BOOL: "BOOL"
}

export const options = {
  [TYPE_CATEGORIES.NUMERIC]: numericOptions,
  [TYPE_CATEGORIES.TEXT]: textOptions,
  [TYPE_CATEGORIES.TIME]: timeOptions,
  [TYPE_CATEGORIES.BOOL]: boolOptions,
  [TYPE_CATEGORIES.ARRAY]: arrayOptions
}

function negateOption(option, newName, newLabel) {
  return {
    ...option,
    filterType: FILTER_TYPE_NOT,
    childOptionName: option.name,
    childFilterType: option.filterType,
    childOperator: option.operator,
    name: newName,
    label: newLabel
  }
}

export const notOptionsByChildOptionName = {
  [between.name]: notBetween,
  [contains.name]: notContains,
  [equal.name]: notEqual,
  [arrayContains.name]: arrayNotContains
}

export const typeCategory = (filter) => {
  const { dataType } = getChildlessFilter(filter)
  if (isNumericType(dataType)) {
    return TYPE_CATEGORIES.NUMERIC
  } else if (isTimeType(dataType)) {
    return TYPE_CATEGORIES.TIME
  } else if (TEXT_TYPES[dataType]) {
    return TYPE_CATEGORIES.TEXT
  } else if (BOOL_TYPES[dataType]) {
    return TYPE_CATEGORIES.BOOL
  }

  return null
}

// Returns the option selected by default for a newly-created filter
export const defaultOption = (filter) => {
  const { dataTypeIsArray } = getChildlessFilter(filter)
  if (dataTypeIsArray) {
    return arrayContains.name
  }

  const category = typeCategory(filter)
  switch (category) {
    case TYPE_CATEGORIES.TEXT:
      return exact.name
    case TYPE_CATEGORIES.NUMERIC:
      return greaterThanOrEqual.name
    case TYPE_CATEGORIES.TIME:
      return between.name
    case TYPE_CATEGORIES.BOOL:
      return exact.name
    default:
      return noneSelected.name
  }
}

// This isn't stored on the filter itself, so we need to look it up.
// We get dataSources for dashboard filters but only columns for prefilters.
export const filterIsDictEncoded = (filter, { columns, dataSources }) => {
  const { dataSource, dataExpression } = getChildlessFilter(filter)

  if (
    typeCategory(filter) === TYPE_CATEGORIES.TEXT &&
    (columns || dataSources)
  ) {
    const columnMetadata = columns || dataSources[dataSource]?.columnMetadata
    const matchingColumn = columnMetadata?.find(
      (column) => getFullColumnName(column) === dataExpression
    )
    return matchingColumn?.is_dict
  }

  return false
}

const average = {
  name: "Average",
  aggregateFunction: "AVG",
  label: "Average"
}

export const min = {
  name: "Min",
  aggregateFunction: "MIN",
  label: "Min"
}

const max = {
  name: "Max",
  aggregateFunction: "MAX",
  label: "Max"
}

const sum = {
  name: "Sum",
  aggregateFunction: "SUM",
  label: "Sum"
}

export const unique = {
  name: "# Unique",
  aggregateFunction: "APPROX_COUNT_DISTINCT",
  label: "# Unique",
  dataType: "BIGINT"
}

const stdev = {
  name: "Standard Deviation",
  aggregateFunction: "STDDEV",
  label: "Std dev."
}

const count = {
  name: "Count",
  aggregateFunction: "COUNT",
  label: "Count",
  dataType: "BIGINT"
}

const median = {
  name: "Median",
  aggregateFunction: "APPROX_MEDIAN",
  label: "Median",
  dataType: "BIGINT"
}

export const aggregateOptions = [
  average,
  min,
  max,
  sum,
  unique,
  stdev,
  count,
  median
]

/**
 * Okay. We use this for 1) getting a full list of dropdown options to display,
 * and 2) getting the correct list to search through for info on our currently selected option.
 * For case #1 we need to restrict the list based on column metadata or full dataSources metadata,
 * (where we can lookup if col is dict. encoded) but in the second case it doesn't really matter.
 * @param filter
 * @param metadata (optional) See notes above.
 * @param metadata.dataSources (optional)
 * @param metadata.columns (optional)
 * @param showNoneOption Return a "None selected" option in addition to real options
 */
export const optionsForDataType = (
  filter,
  metadata,
  showNoneOption = false
) => {
  const { dataTypeIsArray, dataExpression } = getChildlessFilter(filter)
  let opts = options[typeCategory(filter)] || []

  if (dataTypeIsArray) {
    opts = arrayOptions
  }

  // Data type for aggregate filters only effects the aggregate options list
  if (
    dataExpression &&
    dataExpression.type === "SimpleAggregateFilterDataExpression"
  ) {
    opts = numericOptions
  }

  // cannot run custom selection queries on non-dict encoded strings
  if (metadata && !filterIsDictEncoded(filter, metadata)) {
    opts = opts.filter((option) => option.name !== multiSelect.name)
  }

  if (showNoneOption && opts.length > 1) {
    return [noneSelected].concat(opts)
  }

  return opts
}

export const getInfoForOption = (optionName, filter) =>
  optionsForDataType(filter, undefined, true).find(
    (op) => op.name === optionName
  )

export const relativeOptionNameFromFilter = ({ start, end }) => {
  // e.g. "last 10 minutes"
  if (start.func === "ADD" && end === "NOW") {
    return `LAST${Math.abs(start.adjustment)}${start.datePart}TONOW`
  }
  // e.g. "this year"
  if (start.func === "TRUNC" && !start.adjustment && end === "NOW") {
    return `THIS${start.datePart}`
  }
  // e.g. "last 7 days"
  if (start.func === "TRUNC" && end === "NOW") {
    return `TRUNCLAST${Math.abs(start.adjustment) || 1}${start.datePart}TONOW`
  }
  // e.g. "last year"
  if (start.func === "TRUNC" && end.func === "TRUNC" && end.value === "NOW") {
    return `LAST${Math.abs(start.adjustment) || 1}${start.datePart}`
  }
  return noneSelected.name
}

// Converts a Filter object to a dropdown option name. Returns null for filters that we have no user-editable interface for.
export const optionNameFromFilter = (filter) => {
  if (!shouldRenderEditableInterface(filter)) {
    return null
  }

  const {
    dataTypeIsArray,
    isRelative,
    filterType,
    operator
  } = getChildlessFilter(filter)

  if (!filterType) {
    return noneSelected.name
  }

  if (dataTypeIsArray) {
    if (filterType === FILTER_TYPE_SIMPLE && operator === "=") {
      return filter.filterType === FILTER_TYPE_NOT
        ? arrayNotContains.name
        : arrayContains.name
    }
  }

  if (isRelative) {
    return relativeOptionNameFromFilter(filter)
  }

  // Specifically look at the outermost filterType
  switch (filter.filterType) {
    case FILTER_TYPE_SIMPLE:
      return operator
    case FILTER_TYPE_NOT:
      // will need to handle negated SIMPLE filters here if we add more
      if (filterType === FILTER_TYPE_SIMPLE && operator === "ILIKE") {
        return notContains.name
      }
      if (filterType === FILTER_TYPE_SIMPLE && operator === "=") {
        return notEqual.name
      }
      return notOptionsByChildOptionName[filterType].name
    case FILTER_TYPE_OR:
      return multiSelect.name
    default:
      return filterType
  }
}

export const optionNameFromCohortFilter = (filterMetaData) =>
  filterMetaData.cohortDimension.negated
    ? cohortExclude.name
    : cohortInclude.name

// Returns dropdown option name for relative filters
export const updatedRelativeFilterFromOption = (optionName, filter) => {
  const { dataSource, dataExpression, dataType, table } = getChildlessFilter(
    filter
  )
  const selectedOptionInfo = getInfoForOption(optionName, filter)

  return relativeFilter(
    table,
    dataSource,
    dataExpression,
    dataType,
    selectedOptionInfo.start,
    selectedOptionInfo.end
  )
}

export const aggregateOptionInfoFromFilter = (filter) => {
  const { dataExpression } = getChildlessFilter(filter)
  const option = aggregateOptions.find(
    (opt) => opt.aggregateFunction === dataExpression.function
  )
  return option
}

export const buildAggregateDataExpression = (aggregateName, dataExpression) => {
  const { aggregateFunction } = aggregateOptions.find(
    (option) => option.name === aggregateName
  )
  return {
    value: dataExpression.value,
    function: aggregateFunction,
    type: "SimpleAggregateFilterDataExpression"
  }
}

export const updatedFilterFromOption = (
  optionName,
  filter,
  updatedValues = {},
  columnMetaData
) => {
  const { value, start, end, aggregate } = updatedValues

  const childlessFilter = getChildlessFilter(filter)
  let { dataType, dataExpression } = childlessFilter
  const {
    table,
    dataSource,
    dataTypeIsArray,
    extract,
    caseSensitive
  } = childlessFilter

  const selectedOptionInfo = getInfoForOption(optionName, filter)

  if (aggregate) {
    dataExpression = buildAggregateDataExpression(aggregate, dataExpression)
    const aggregateOption = aggregateOptions.find(
      (option) => option.name === aggregate
    )
    if (aggregateOption.dataType) {
      dataType = aggregateOption.dataType
    } else {
      dataType = columnMetaData.find(
        (metadata) =>
          getFullColumnName(metadata, "value") === dataExpression.value
      ).type
    }
  }

  if (selectedOptionInfo.isRelative) {
    return updatedRelativeFilterFromOption(optionName, filter)
  }

  switch (selectedOptionInfo.filterType) {
    case FILTER_TYPE_SIMPLE:
      return simpleFilter(
        table,
        dataSource,
        dataExpression,
        dataType,
        selectedOptionInfo.operator,
        value,
        {
          caseSensitive,
          dataTypeIsArray,
          extract
        }
      )
    case FILTER_TYPE_BETWEEN:
      return betweenFilter(
        table,
        dataSource,
        dataExpression,
        dataType,
        start,
        end,
        {
          extract
        }
      )
    case "ISNULL":
      return nullFilter(table, dataSource, dataExpression, dataType, {
        dataTypeIsArray
      })
    case "ISNOTNULL":
      return notNullFilter(table, dataSource, dataExpression, dataType, {
        dataTypeIsArray
      })
    case FILTER_TYPE_NOT:
      return notFilter(
        updatedFilterFromOption(
          selectedOptionInfo.childOptionName,
          {
            table,
            dataSource,
            dataExpression,
            dataType,
            dataTypeIsArray
          },
          { value, start, end }
        )
      )
    default:
      return null
  }
}

// Returns a "custom selection" filter
export const multiSelectFilterFromValues = (filter, values = []) => {
  const { table, dataSource, dataExpression, dataType } = getChildlessFilter(
    filter
  )

  const filters = values.map((value) =>
    simpleFilter(table, dataSource, dataExpression, dataType, "=", value)
  )

  return orFilter(filters)
}

export const shouldShowAutosuggest = (filter, optionName, metadata) => {
  const { dataTypeIsArray } = getChildlessFilter(filter)
  if (dataTypeIsArray) {
    return false
  }
  const dataTypeCategory = typeCategory(filter)
  const selectedOptionInfo = getInfoForOption(optionName, filter)
  return (
    selectedOptionInfo &&
    selectedOptionInfo.autosuggest &&
    ((dataTypeCategory === TYPE_CATEGORIES.TEXT &&
      filterIsDictEncoded(filter, metadata)) ||
      dataTypeCategory === TYPE_CATEGORIES.BOOL)
  )
}

/**
 * Filters that we're currently rendering intelligently in the filter component
 * only have one dataSource/dataExpression. Those properties only exist on childless filters,
 * so just unwrap nested filters until we get to that data.
 */
export function getChildlessFilter(filter, dataSource) {
  // Given our current options, we can assume that the first filter is representative of the entire array.
  const representativeFilter = Array.isArray(filter) ? filter[0] : filter
  if (filterHasChild(representativeFilter)) {
    return getChildlessFilter(representativeFilter.filter)
  }
  if (filterHasChildren(representativeFilter)) {
    return getChildlessFilter(representativeFilter.filters)
  }
  if (isMultiSourceFilter(representativeFilter)) {
    if (dataSource && representativeFilter.filtersByDataSource[dataSource]) {
      return getChildlessFilter(
        representativeFilter.filtersByDataSource[dataSource],
        dataSource
      )
    }
    return getChildlessFilter(
      Object.values(representativeFilter.filtersByDataSource)
    )
  }
  return representativeFilter
}

// Any nested filters that we expect to display in an editable way need to be
// explicitly added here, otherwise we'll default to rendering it as plaintext
function shouldRenderEditableInterface(filter) {
  const { filterType } = filter

  if (!filterHasChild(filter) && !filterHasChildren(filter)) {
    return true
  }

  switch (filterType) {
    case FILTER_TYPE_NOT:
      return (
        filter.filter &&
        (filter.filter.filterType === FILTER_TYPE_SIMPLE ||
          filter.filter.filterType === FILTER_TYPE_BETWEEN)
      )
    case FILTER_TYPE_AND:
      return false
    case FILTER_TYPE_OR:
      return (
        filter.filters &&
        filter.filters.every(
          (f) => f.filterType === FILTER_TYPE_SIMPLE && TEXT_TYPES[f.dataType]
        )
      )
    default:
      return false
  }
}

// Again, we only have a filter component option for rendering one-level deep OR filters--anything
// else should be displayed as SQL, so no need to worry about anything nested deeper than that right now.
export function getOrFilterValues(filter) {
  return filter.filterType === FILTER_TYPE_OR
    ? filter.filters.map((f) => f.value)
    : []
}

export const isCountStarAggregateFilter = (filter) => {
  const { dataExpression } = getChildlessFilter(filter)
  return (
    dataExpression &&
    dataExpression.value === "*" &&
    dataExpression.function === count.aggregateFunction
  )
}

function isRangeFilter(filterMetaData) {
  // heavyai charts set an isRangeFilter boolean; vega combo names it differently.
  // this should be refactored and abstracted. Save it for if/when filters are re-tooled again.
  return (
    filterMetaData.isRangeFilter ||
    Boolean(filterMetaData.name.match(/-range-crossfilter$/))
  )
}

export function buildDisplayName(filterMetaData, isPlainSql, dataSource) {
  // cohorts are a special case. If we have one, then we should use the
  // cohort's dimension. Otherwise, we want the dataExpression.
  // oh! And also note that the dataExpression will be handed in as the chart
  // name if it's a crossfilter.
  const { dataExpression, filterType } = getChildlessFilter(
    filterMetaData.filter,
    dataSource
  )

  let displayName = ""

  if (filterMetaData.cohortDimension) {
    displayName = `Cohort Filter - ${filterMetaData.cohortDimension.name}`
  } else if (filterType === FILTER_TYPE_SQL && !dataExpression && isPlainSql) {
    // need to set default Custom SQL name here because the old Dashboard Filter panel custom sql doesn't have name
    displayName = "Custom SQL"
  } else if (
    dataExpression &&
    dataExpression.type === "SimpleAggregateFilterDataExpression"
  ) {
    displayName = isCountStarAggregateFilter(filterMetaData.filter)
      ? "# Records"
      : dataExpression.value
  } else if (isPlainSql) {
    displayName = Array.from(
      getDataExpressionsForFilter(filterMetaData.filter)
    ).join(", ")
  } else {
    displayName = dataExpression
  }

  if (isRangeFilter(filterMetaData)) {
    displayName += " (range)"
  }

  return process(displayName, { useDisplayName: true })
}

/*
  Nope, we can't trust the dataType on the filter itself, we need to look up the actual column metadata.
  The filter dataType can vary based on which aggregate function is selected--I'm looking at you, timestamps.
*/
export function allowedAggregateOptions(filterMetaData, columnMetaData) {
  const { dataExpression } = getChildlessFilter(filterMetaData.filter)
  const selectedColumn = columnMetaData.find(
    (metadata) => getFullColumnName(metadata) === dataExpression.value
  )
  const { type, is_dict } = selectedColumn ?? {}

  if (isNumericType(type)) {
    if (isHardwareDistributed()) {
      return aggregateOptions.filter((op) => op.name !== "Median")
    }
    return aggregateOptions
  } else if (isTimeType(type)) {
    return [min, max, unique, count]
  } else if (is_dict) {
    return [unique, count]
  }

  return [count]
}

// Creates an empty filter with default aggregate function and operator dropdown values,
// ensuring the default filter we create makes sense for the data type of the selected column
export function defaultAggregateFilter(columnName, columnMetadata) {
  // All data types work with the Count option, so use that as the fallback
  let { aggregateFunction, dataType } = count

  if (isNumericType(columnMetadata.type)) {
    aggregateFunction = average.aggregateFunction
    if (columnMetadata.isCount) {
      aggregateFunction = count.aggregateFunction
    }
    dataType = columnMetadata.type
  } else if (isTimeType(columnMetadata.type)) {
    aggregateFunction = min.aggregateFunction
    dataType = columnMetadata.type
  } else if (columnMetadata.is_dict) {
    aggregateFunction = unique.aggregateFunction
    dataType = unique.dataType
  }

  return {
    filterType: FILTER_TYPE_SIMPLE,
    dataExpression: {
      value: `${columnMetadata.table}.${columnName}`,
      function: aggregateFunction,
      type: "SimpleAggregateFilterDataExpression"
    },
    dataType,
    operator: ">=",
    dataSource: columnMetadata.source
  }
}

export const showParameterValueForOption = (optionName: string | undefined) =>
  optionName === exact.name ||
  optionName === notEqual.name ||
  optionName === equal.name
