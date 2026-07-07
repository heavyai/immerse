// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  DEFAULT_SELECTOR_TYPES,
  filterOptions,
  isNonDictString,
  TEXT_AND_BOOL_TYPES,
  TIME_UNITS,
  isNumericType
} from "constants/data-types"
import { compose, filter, identity, isNil, prop, sortBy } from "ramda"
import {
  updateExtractInterval,
  updateTimeBinInputVal
} from "actions/charts-action-creators"
import { CHARTS } from "constants/charts"
import { connect } from "react-redux"
import { CUSTOM_DIMENSION_VALUE } from "constants/magic-variables"
import { restrictedDimensionTypeKey } from "reducers/charts/remove-selector-reducer"
import DimensionSelectorsPopover from "./dimension-selectors-popover"
import { COLOR_DIMENSION_LABEL } from "charts/combo/line-chart2/line2-consts"
import { setChartSpecificBinFilters } from "vega/actions/filter-action-creators-crossfilter-interop"
import { enhanceColumnMetadata } from "services/ImmerseCrossFilter/utils"
import { ParameterTypes } from "../parameters/parameters-types"
import {
  getParameterizedCustomSqlMetadata,
  parameterDefinitionToOldSelectorMetadata
} from "utils/parameterized-custom-sql-metadata"

const customInput = {
  label: "Custom SQL Dimension",
  value: CUSTOM_DIMENSION_VALUE,
  type: "CUSTOM"
}

const restrictByType = (column, typeRestriction /* "Time" or "Numeric" */) => {
  if (column.type === "CUSTOM") {
    return true
  }
  const type = isNumericType(column.type) ? "Numeric" : "Time"
  return type === typeRestriction
}

const isRestrictedColumn = (typeRestriction) => (column) => {
  if (isNil(typeRestriction)) {
    return true
  }
  return restrictByType(column, typeRestriction)
}

function filterDimensions(
  DIMENSIONS,
  selectorName,
  columns,
  dimensionTypes = DEFAULT_SELECTOR_TYPES,
  typeRestriction
) {
  return compose(
    filterOptions(DIMENSIONS, selectorName),
    filter((column) => !isNonDictString(column)),
    filter((column) => dimensionTypes[column.type]),
    selectorName === COLOR_DIMENSION_LABEL
      ? identity
      : filter(isRestrictedColumn(typeRestriction)),
    sortBy(prop("value"))
  )(columns)
}

const isCustomAndCategorical = (selector) =>
  selector.custom && TEXT_AND_BOOL_TYPES[selector.type]

export const isLineChartAndRangeChartFilterAppliedAndNotExtract = (chart) =>
  chart.rangeChartEnabled &&
  chart.type === "line" &&
  Boolean(chart.filters.length) &&
  !chart.dimensions[0].extract

export function mapStateToProps({ charts, dashboard: { dataSources } }, props) {
  const { selector, chartId, index, isDropdownOpen } = props
  const { isBinnable, isError, loading, custom } = selector
  const restrictedDimensionType = charts[chartId][restrictedDimensionTypeKey] // "Time" or "Numeric" or undefined

  const shouldShowCustomInput =
    !isDropdownOpen &&
    (isCustomAndCategorical(selector) ||
      props.showCustom ||
      (custom && isError))
  const shouldShowBinSettings = Boolean(
    !isDropdownOpen && isBinnable && !props.showCustom && !isError
  )
  const shouldShowCustomBinSettings = Boolean(
    !isDropdownOpen &&
      isBinnable &&
      custom &&
      props.showCustomBinSettings &&
      !isError
  )

  return {
    binBounds: isLineChartAndRangeChartFilterAppliedAndNotExtract(
      charts[chartId]
    )
      ? charts[chartId].rangeFilter[0]
      : [selector.currentLowValue, selector.currentHighValue],
    chartType: charts[chartId].type,
    dimension: selector,
    options: [
      customInput,
      ...getParameterizedCustomSqlMetadata(
        props.dataSource,
        ParameterTypes.CUSTOM_DIMENSION,
        parameterDefinitionToOldSelectorMetadata
      ),
      ...getParameterizedCustomSqlMetadata(
        props.dataSource,
        ParameterTypes.GLOBAL_DIMENSION,
        parameterDefinitionToOldSelectorMetadata
      ),
      ...filterDimensions(
        CHARTS[charts[chartId].type].dimensions,
        selector.name,
        props.dataSource
          ? enhanceColumnMetadata(
              dataSources[props.dataSource].columnMetadata,
              props.dataSource
            )
          : [],
        CHARTS[charts[chartId].type].dimensionTypes,
        restrictedDimensionType
      )
    ],
    timeBinInputVal: charts[chartId].dimensions[index].timeBin,
    showBinSettings: Boolean(
      (shouldShowBinSettings || shouldShowCustomBinSettings) &&
        !TIME_UNITS[selector.type] &&
        !loading
    ),
    showTimeBinSettings: Boolean(
      (shouldShowBinSettings || shouldShowCustomBinSettings) &&
        TIME_UNITS[selector.type] &&
        !loading
    ),
    showCustomInput: Boolean(
      shouldShowCustomInput && !shouldShowCustomBinSettings
    ),
    showDropDown: Boolean(!shouldShowCustomInput || shouldShowCustomBinSettings)
  }
}

export function mapDispatchToProps(dispatch, { chartId, index }) {
  return {
    async updateBinInterval(timeBinInputVal) {
      await dispatch(updateTimeBinInputVal(chartId, index, timeBinInputVal))
      await dispatch(setChartSpecificBinFilters(chartId))
    },
    async updateExtractInterval(timeBinInputVal) {
      await dispatch(updateExtractInterval(chartId, index, timeBinInputVal))
      await dispatch(setChartSpecificBinFilters(chartId))
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DimensionSelectorsPopover)
