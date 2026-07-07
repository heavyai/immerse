// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { AppState } from "vega/charts/types"
import { Join, JoinCreate, JoinDataSource } from "./join-manager-types"
import { AnyAction } from "redux"
import pushid from "pushid"
import {
  addParameterDefinition,
  addParameterToParameterSet,
  updateParameterDefinition
} from "components/parameters/actions"
import { ParameterTypes } from "components/parameters/parameters-types"
import { ThunkDispatch } from "redux-thunk"
import { linkParameter } from "components/parameters/actions/parameter-link-actions"
import {
  selectDataSource,
  dataSourceUpdated
} from "actions/data-source-action-creators"
import {
  joinDataSourceCreated,
  joinDataSourceUpdated,
  joinUpdated
} from "./join-manager-actions"
import { simpleSetParameterValue } from "components/parameters/actions/simple-action-wrappers"
import { hideModal, showModal } from "actions/ui-action-creators"
import { WARNING } from "constants/modal-types"
import {
  DEFAULT_ERROR_MESSAGE,
  getErrorMessageFromBackendError
} from "utils/error-handling-helpers"
import { toParameterSyntax } from "utils/parameters"
import { CHART_TYPES } from "constants/chart-types"
import { selectTable } from "vega/actions/data-selection-thunks"
import Services from "services/immerse"
import { GEO_JOIN_COMPATIBILITY } from "./constants"

const joinToSQL = (
  join: JoinCreate,
  leftColumnType: string,
  rightColumnType: string
) => {
  // We store left and right database as well, but omitted it from left/right table
  // expressions below due to https://heavyai.atlassian.net/browse/QE-779. We should
  // include db in the left/right table expressions once this bug is fixed

  const quote = (x: string) => `"${x}"`
  const leftTableExpr = quote(join.leftTable)
  const rightTableExpr = quote(join.rightTable)
  const leftKeyExpr = quote(join.leftJoinKey)
  const rightKeyExpr = quote(join.rightJoinKey)

  let joinCondition = ""
  if (join.joinCondition) {
    // Default pass params in order of table order in the UI (left -> right)
    let firstArg = `${leftTableExpr}.${leftKeyExpr}`
    let secondArg = `${rightTableExpr}.${rightKeyExpr}`

    const typeCompatibility = GEO_JOIN_COMPATIBILITY[join.joinCondition]
    // If only the switched version is compatible, switch the parameter order
    if (
      !typeCompatibility[leftColumnType]?.includes(rightColumnType) &&
      typeCompatibility[rightColumnType]?.includes(leftColumnType)
    ) {
      firstArg = `${rightTableExpr}.${rightKeyExpr}`
      secondArg = `${leftTableExpr}.${leftKeyExpr}`
    }
    joinCondition = `${join.joinCondition}(${firstArg}, ${secondArg})`
  } else {
    joinCondition = `(${leftTableExpr}.${leftKeyExpr} = ${rightTableExpr}.${rightKeyExpr})`
  }
  const joinType = join.joinType
  return `${leftTableExpr} ${joinType} JOIN ${rightTableExpr} ON ${joinCondition}`
}

export const joinDataSourceToSQL = (
  joinDataSource: {
    joins: JoinCreate[]
  },
  leftColumnType: string,
  rightColumnType: string
) => {
  if (!joinDataSource) {
    return ""
  }
  const join = joinDataSource.joins[0]
  return joinToSQL(join, leftColumnType, rightColumnType)
}

export function createJoinDataSourceParam(
  joinDataSourceId: string,
  chartId: string,
  layerId: string | undefined,
  leftColumnType: string,
  rightColumnType: string
) {
  return async (
    dispatch: ThunkDispatch<AppState, {}, AnyAction>,
    getState: () => AppState
  ) => {
    // This will already be in state, because the modal will be saving
    // along the way to maintain state
    const joinDataSources = getState().joinDataSources
    const joinDataSource = joinDataSources?.find(
      (jds: JoinDataSource) => jds.id === joinDataSourceId
    )
    if (joinDataSource) {
      const sql = joinDataSourceToSQL(
        joinDataSource,
        leftColumnType,
        rightColumnType
      )

      // Use the join data source id as the param name
      // This allows us to link these two up easily

      // We may have to change this if its too hard to change param name as data source
      const param = {
        name: joinDataSource.id,
        displayName: joinDataSource.name,
        type: ParameterTypes.JOIN,
        defaultValue: sql
      }
      await dispatch(addParameterDefinition(param))
      await addParameterToParameterSet(param)
      await dispatch(linkParameter(param.name, param.defaultValue))
      await dispatch(
        joinDataSourceUpdated(joinDataSource.id, {
          parameter: joinDataSource.id
        })
      )

      if (chartId) {
        // Vega combo chart has its own actions and components
        if (
          [CHART_TYPES.VEGA_COMBO, CHART_TYPES.BOX_PLOT].includes(
            getState().charts[chartId].type
          )
        ) {
          await dispatch(
            selectTable(chartId, layerId, toParameterSyntax(param.name))
          )
        } else {
          await dispatch(
            selectDataSource(
              { chartId },
              toParameterSyntax(param.name),
              layerId
            )
          )
        }
      }
    }
  }
}

export const updateJoinColumnMetadata = (joinDataSourceId) => async (
  dispatch: ThunkDispatch<AppState, {}, AnyAction>
) => {
  const cfManager = Services.get("crossfilter")
  const currentCF = cfManager.getCrossfilter(
    toParameterSyntax(joinDataSourceId)
  )
  await currentCF.getFieldsAsync(true)
  const columnMetadata = currentCF.getColumns()
  await dispatch(
    dataSourceUpdated(toParameterSyntax(joinDataSourceId), columnMetadata)
  )
}

export const updateJoinDataSourceParam = (
  joinDataSourceId: string,
  chartId: string | undefined,
  layerId: string | undefined,
  leftColumnType: string,
  rightColumnType: string
) => async (
  dispatch: ThunkDispatch<AppState, {}, AnyAction>,
  getState: () => AppState
) => {
  const joinDataSources = getState().joinDataSources
  const joinDataSource = joinDataSources?.find(
    (jds: JoinDataSource) => jds.id === joinDataSourceId
  )
  if (joinDataSource) {
    const sql = joinDataSourceToSQL(
      joinDataSource,
      leftColumnType,
      rightColumnType
    )

    if (chartId) {
      await dispatch(
        selectDataSource(
          { chartId },
          toParameterSyntax(joinDataSourceId),
          layerId
        )
      )
    }

    dispatch(simpleSetParameterValue(joinDataSourceId, sql))
  }
}

function showJoinCreateUpdateError(e) {
  return async (dispatch: ThunkDispatch<AppState, {}, AnyAction>) => {
    const backendError = getErrorMessageFromBackendError(e)
    const errorMessage = [
      "An error occurred when creating the join. Please try again.",
      "If the problem persists, see our documentation or contact support to help resolve the issue."
    ]

    dispatch(
      showModal({
        type: WARNING,
        heading: "Unable to create join",
        content:
          backendError !== DEFAULT_ERROR_MESSAGE
            ? [`Reason: ${backendError}`, ...errorMessage]
            : errorMessage,
        primaryAction: {
          action: hideModal,
          text: "Ok"
        }
      })
    )
  }
}

export function createJoinDataSource({
  joins,
  name,
  chartId,
  layerId,
  leftColumnType,
  rightColumnType
}: {
  joins: JoinCreate[]
  name: string
  chartId: string
  layerId?: string
  leftColumnType: string
  rightColumnType: string
}) {
  return async (
    dispatch: ThunkDispatch<AppState, {}, AnyAction>,
    _getState,
    services
  ) => {
    const connector = services.get("DbCon")
    const sql = joinDataSourceToSQL({ joins }, leftColumnType, rightColumnType)
    try {
      await connector.validateQuery(`SELECT * FROM ${sql}`)

      const joinDataSourceId = pushid()
      dispatch(
        joinDataSourceCreated({
          name,
          id: joinDataSourceId,
          joins
        })
      )

      await dispatch(
        createJoinDataSourceParam(
          joinDataSourceId,
          chartId,
          layerId,
          leftColumnType,
          rightColumnType
        )
      )
    } catch (e) {
      dispatch(showJoinCreateUpdateError(e))
    }
  }
}

export function updateJoinDataSource({
  joinDataSourceId,
  joinId,
  joinUpdates,
  chartId,
  layerId,
  name,
  leftColumnType,
  rightColumnType
}: {
  joinDataSourceId: string
  joinId: string
  joinUpdates: JoinCreate
  name?: string
  chartId?: string
  layerId?: string
  leftColumnType: string
  rightColumnType: string
}) {
  return async (
    dispatch: ThunkDispatch<AppState, {}, AnyAction>,
    getState: () => AppState,
    services
  ) => {
    try {
      const joinDataSource = getState().joinDataSources?.find(
        (ds: JoinDataSource) => ds.id === joinDataSourceId
      )
      const join = joinDataSource?.joins?.find((j: Join) => j.id === joinId)

      if (!join) {
        throw new Error("Could not find join to update")
      }

      const updatedJoin = { ...join, ...joinUpdates }

      const sql = joinToSQL(updatedJoin, leftColumnType, rightColumnType)
      const connector = services.get("DbCon")
      await connector.validateQuery(`SELECT * FROM ${sql}`)

      dispatch(joinUpdated(joinDataSourceId, joinId, joinUpdates))

      if (name) {
        dispatch(
          joinDataSourceUpdated(joinDataSourceId, {
            name
          })
        )
        // Keep the display name of the param up to date with the join name
        // This shows up for generated chart titles and other places where param display name is used
        const param = {
          name: joinDataSourceId,
          displayName: name
        }
        dispatch(updateParameterDefinition(param))
      }

      dispatch(
        updateJoinDataSourceParam(
          joinDataSourceId,
          chartId,
          layerId,
          leftColumnType,
          rightColumnType
        )
      )

      // This force updates the fields in crossfilter
      // after a join has been updated in case data source has changed
      const tablesUpdated = Object.keys(joinUpdates).some((update) =>
        ["leftTable", "rightTable"].includes(update)
      )
      if (!chartId && tablesUpdated) {
        dispatch(updateJoinColumnMetadata(joinDataSourceId))
      }
    } catch (e) {
      dispatch(showJoinCreateUpdateError(e))
    }
  }
}
