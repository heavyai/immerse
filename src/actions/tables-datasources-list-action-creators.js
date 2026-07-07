// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { enhanceTables } from "services/ImmerseCrossFilter/utils"

import {
  START_TABLES_REQUEST,
  ADD_TABLES_SUCCESS,
  TABLES_TRANSACTION_ERROR
} from "constants/action-types"

import { addParameterDefinition } from "components/parameters/actions/parameter-definitions-action-creators"
import {
  getParameterSetForDashboard,
  getParameterDefinitions
} from "components/parameters/selectors"
import { ParameterTypes } from "components/parameters/parameters-types"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"
import {
  buildGlobalExpressionParameterName,
  GlobalExpressionType
} from "components/data-manager/utils/global-custom-sql"

export const startDataManagerRequest = () => ({
  type: START_TABLES_REQUEST
})

export const dataManagerTransactionError = (
  error = { message: "there was an error" }
) => ({
  type: TABLES_TRANSACTION_ERROR,
  error
})

export const addTablesSuccess = (tables, globalExpressions) => ({
  type: ADD_TABLES_SUCCESS,
  tables,
  globalExpressions
})

// The "custom expressions" requirements were split into dashboard level custom
// expressions (handled with custom column parameters on the dashboard level)
// and global expressions (handled via global database object).
// The call `getCustomExpressionsAsync` was created before the split, but is used
// solely for the global expressions, hence being referred to as globalExpressions

// Don't import this function directly other than in parameter-values-action-creators
// otherwise, import this function from tables-get-data-sources-list, which populates setParameterValue for you.
// this is to bust a circular dependency
export const getDataSourcesList = (setParameterValue) => (
  dispatch,
  getState,
  services
) => {
  const DbCon = services.get("DbCon")
  dispatch(startDataManagerRequest())

  return Promise.all([
    DbCon.getTablesAsync(),
    DbCon.getCustomExpressionsAsync()
      .then((ces) =>
        ces.map((ce) => ({
          ...ce,
          expression_json: JSON.parse(ce.expression_json)
        }))
      )
      .catch(() => [])
  ])
    .then(([tables, globalExpressions]) => {
      dispatch(addTablesSuccess(enhanceTables(tables), globalExpressions))

      // TODO: Find another home for this
      if (getFeatureFlag(available_feature_flags.ENABLE_GLOBAL_CUSTOM_SQL)) {
        const { id: parameterSetId } =
          getParameterSetForDashboard(getState()) || {}
        if (!parameterSetId) {
          return
        }
        const existingParameters = getParameterDefinitions(getState())

        globalExpressions
          .filter(({ data_source_type }) => data_source_type === 0)
          .filter(({ expression_json }) =>
            Object.keys(GlobalExpressionType).includes(
              expression_json?.selectorType
            )
          )
          .forEach(({ id, name, expression_json, data_source_name }) => {
            const { value, selectorType, ...col } = expression_json
            const paramName = buildGlobalExpressionParameterName({
              globalExpressionType: selectorType,
              dataSource: data_source_name,
              label: name
            })
            if (!existingParameters[paramName]) {
              dispatch(
                addParameterDefinition({
                  name: paramName,
                  displayName: name,
                  type: ParameterTypes[`GLOBAL_${selectorType}`],
                  source: data_source_name,
                  defaultValue: value,
                  defaultColumnMetadata: col,
                  globalExpressionId: id
                })
              )
            }
            dispatch(
              setParameterValue({
                name,
                value,
                parameterSetId,
                shouldHandleValueChangeOfParam: false
              })
            )
          })
      }
    })
    .catch((error) => {
      dispatch(dataManagerTransactionError(error))
    })
}
