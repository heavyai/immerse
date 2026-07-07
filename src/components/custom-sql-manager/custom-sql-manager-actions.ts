// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  BarDimensionName,
  BarMeasureName,
  Expression
} from "vega/constants/data-selection-types"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"
import { importableProcess as process } from "utils/ImmerseSQLPlusPlus/parser-importable"
import { varExtractRegex } from "components/parameters/validation"

export const OPEN_CUSTOM_SQL_MANAGER = "OPEN_CUSTOM_SQL_MANAGER"
export const CLOSE_CUSTOM_SQL_MANAGER = "CLOSE_CUSTOM_SQL_MANAGER"

export enum CustomSQLTypes {
  CUSTOM_SQL_FILTER = "CUSTOM_SQL_FILTER",
  CUSTOM_SQL_DIMENSION = "CUSTOM_SQL_DIMENSION",
  CUSTOM_SQL_MEASURE = "CUSTOM_SQL_MEASURE",
  CUSTOM_SQL_POST_FILTER = "CUSTOM_SQL_POST_FILTER",
  CUSTOM_SQL_EDIT_SHARED = "CUSTOM_SQL_EDIT_SHARED",
  CUSTOM_SQL_EDIT_GLOBAL = "CUSTOM_SQL_EDIT_GLOBAL"
}

export const OLD_SELECTORS_TO_MODAL_TYPE = {
  dimensions: CustomSQLTypes.CUSTOM_SQL_DIMENSION,
  measures: CustomSQLTypes.CUSTOM_SQL_MEASURE,
  postFilters: CustomSQLTypes.CUSTOM_SQL_POST_FILTER
}

export const closeCustomSQLManager = () => ({
  type: CLOSE_CUSTOM_SQL_MANAGER
})

// Actions for opening specific flavors of the Custom SQL Manager
export const openCustomSQLFilterModal = (
  existingFilterData,
  shouldAutoEnable
) => ({
  type: OPEN_CUSTOM_SQL_MANAGER,
  filter: existingFilterData,
  customSQLManagerProps: {
    customSQLType: CustomSQLTypes.CUSTOM_SQL_FILTER,
    activeDataSource: existingFilterData.dataSource,
    shouldAutoEnable,
    shared: getFeatureFlag(
      available_feature_flags.ENABLE_DASHBOARD_SHARED_CUSTOM_SQL
    )
  }
})

export const openCustomSQLSelectorModal = (
  chartId: string,
  layerId: string,
  activeDataSource: string,
  selectorName: BarDimensionName | BarMeasureName,
  selectorIndex: number | null,
  selectorExpression: Expression | null,
  selectorType: CustomSQLTypes,
  isOldSelector?: boolean
) => ({
  type: OPEN_CUSTOM_SQL_MANAGER,
  customSQLManagerProps: {
    chartId,
    layerId,
    activeDataSource,
    selectorName,
    selectorIndex,
    selectorExpression,
    isOldSelector,
    customSQLType: selectorType,
    shared: getFeatureFlag(
      available_feature_flags.ENABLE_DASHBOARD_SHARED_CUSTOM_SQL
    )
  }
})

export const editParameterizedCustomSQLSelector = ({
  customSelectorValue,
  activeDataSource,
  chartId,
  layerId,
  selectorIndex,
  selectorType,
  customSQLType,
  isOldSelector,
  filter
}: {
  customSelectorValue: string
  activeDataSource: string
  chartId: string
  // layerId and selectorIndex only need to be passed if this custom SQL is
  // in use as a selector
  layerId?: number
  selectorIndex?: number
  selectorType: string
  customSQLType: CustomSQLTypes
  isOldSelector: boolean
}) => ({
  type: OPEN_CUSTOM_SQL_MANAGER,
  filter,
  customSQLManagerProps: {
    selectorExpression: {
      name: process(customSelectorValue, { useDisplayName: true }),
      sql: process(customSelectorValue, { trackUsage: false })
    },
    parameterName: customSelectorValue?.match(varExtractRegex)[1] || null,
    customSQLType,
    isOldSelector,
    activeDataSource,
    chartId,
    selectorIndex,
    selectorType,
    layerId
  }
})
