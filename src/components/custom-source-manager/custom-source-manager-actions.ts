// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { CHART_TYPES } from "constants/charts"

import { createQueuedConnector } from "services/ConnectorWithQueue"
import { getErrorMessageFromBackendError } from "utils/error-handling-helpers"
import { process } from "utils/ImmerseSQLPlusPlus/parser"

import { selectDataSource } from "actions/data-source-action-creators"
import { selectTable } from "vega/actions/data-selection-thunks"
import { addParameterDefinition } from "components/parameters/actions/parameter-definitions-action-creators"
import { linkParameter } from "components/parameters/actions/parameter-link-actions"
import { addParameterToParameterSet } from "components/parameters/actions/parameter-sets-action-creators"
import { setCustomSqlFilterError } from "components/new-filters/filters-actions"

export const OPEN_CUSTOM_SOURCE_MANAGER = "OPEN_CUSTOM_SOURCE_MANAGER"
export const CLOSE_CUSTOM_SOURCE_MANAGER = "CLOSE_CUSTOM_SOURCE_MANAGER"

export const openCustomSourceManager = ({
  activeDataSource,
  chartId,
  layerId,
  customSource = {}
}) => ({
  type: OPEN_CUSTOM_SOURCE_MANAGER,
  customSourceManagerProps: {
    activeDataSource,
    chartId,
    customSource,
    layerId
  }
})

export const closeCustomSourceManager = () => ({
  type: CLOSE_CUSTOM_SOURCE_MANAGER
})

export const submitCustomSource = (chartId, layerId, customSource) => (
  dispatch,
  getState,
  services
) => {
  customSource.defaultValue = customSource.defaultValue.replace(/;\s*$/, "")
  process(customSource.defaultValue, {
    // First, check for invalid parameters
    onProcessComplete: ({ invalidParameters }) => {
      if (invalidParameters.size) {
        dispatch(
          setCustomSqlFilterError(
            `Unrecognized parameters: ${[...invalidParameters].join(",")}.`
          )
        )
      } else {
        const connector = createQueuedConnector({
          connector: services.get("DbCon"),
          dashboardId: getState().dashboard.id,
          chartId
        })

        connector
          .validateQuery(customSource.defaultValue)
          .then(async () => {
            await dispatch(addParameterDefinition(customSource))
            await dispatch(addParameterToParameterSet(customSource))
            await dispatch(
              linkParameter(customSource.name, customSource.defaultValue)
            )

            if (
              [CHART_TYPES.VEGA_COMBO, CHART_TYPES.BOX_PLOT].includes(
                getState().charts[chartId].type
              )
            ) {
              await dispatch(
                selectTable(chartId, layerId, `\${${customSource.name}}`)
              )
            } else {
              await dispatch(
                selectDataSource(
                  { chartId },
                  `\${${customSource.name}}`,
                  layerId
                )
              )
            }

            await dispatch(closeCustomSourceManager())
          })
          .catch((error) => {
            dispatch(
              setCustomSqlFilterError(getErrorMessageFromBackendError(error))
            )
          })
      }
    },
    trackUsage: false
  })
}
