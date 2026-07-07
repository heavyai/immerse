// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getDataSourcesList } from "actions/tables-datasources-list-action-creators"
import { postParameterNotification } from "services/external-messenger-api/api/registerForParameterNotifications"

import {
  REMOVE_ALL_PARAMETER_VALUES,
  SET_PARAMETER_VALUE,
  REMOVE_PARAMETER_VALUE,
  SET_PARAMETER_DEFAULT,
  REMOVE_PARAMETER_DEFAULT,
  CLEAR_PARAMETER_VALUES,
  SET_PARAMETER_HIDE,
  RESET_PARAMETER_VALUES_FROM_SNAPSHOT
} from "../constants"

import {
  getParameterSetIdForSelectedTab,
  getParameterDefinitions
} from "../selectors"
import { ParameterTypes } from "components/parameters/parameters-types"
import { getCustomColumnMetadata } from "actions/selector-action-creators"

const handleValueChangeOfParam = (name) => {
  return async (dispatch, getState) => {
    // okay, if we've changed the value of a parameter, we need to check in here.
    // if it's a table param, then we want to re-fetch the data sources list.
    const definitions = getParameterDefinitions(getState())

    if (definitions[name]?.type === ParameterTypes.TABLE) {
      dispatch(getDataSourcesList(setParameterValue))
    }

    // and post our parameter notification
    postParameterNotification()
  }
}

export const removeAllParameterValues = () => ({
  type: REMOVE_ALL_PARAMETER_VALUES
})

export const resetParameterValuesFromSnapshot = (snapshot) => ({
  type: RESET_PARAMETER_VALUES_FROM_SNAPSHOT,
  snapshot
})

export const rawSetParameterValue = ({
  name,
  value,
  columnMetadata,
  parameterSetId
}) => ({
  type: SET_PARAMETER_VALUE,
  payload: { name, value, columnMetadata, parameterSetId }
})

export const setParameterHide = (name, hide, parameterSetId) => ({
  type: SET_PARAMETER_HIDE,
  name,
  hide,
  parameterSetId
})

export const setParameterHideInTab = (name, hide, parameterSetId) => (
  dispatch,
  getState
) =>
  dispatch(
    setParameterHide(
      name,
      hide,
      parameterSetId || getParameterSetIdForSelectedTab(getState())
    )
  )

const getMetadataForParameterValue = (value, name) => async (
  dispatch,
  getState
) => {
  const definitions = getParameterDefinitions(getState())

  return [
    ParameterTypes.CUSTOM_DIMENSION,
    ParameterTypes.CUSTOM_MEASURE,
    ParameterTypes.GLOBAL_DIMENSION,
    ParameterTypes.GLOBAL_MEASURE
  ].includes(definitions[name]?.type)
    ? await getCustomColumnMetadata(value, definitions[name].source, getState())
    : Promise.resolve(undefined)
}

export function setParameterValue({
  name,
  value,
  parameterSetId,
  shouldHandleValueChangeOfParam = true
}) {
  return async (dispatch, getState) => {
    if (!parameterSetId) {
      parameterSetId = getParameterSetIdForSelectedTab(getState())
    }

    const existingParameter = getState().parameters?.[name]?.[parameterSetId]
    const existingValue = existingParameter?.value

    if (existingParameter && existingValue === value) {
      return
    }

    const columnMetadata = await dispatch(
      getMetadataForParameterValue(value, name)
    )

    await dispatch(
      rawSetParameterValue({ name, value, columnMetadata, parameterSetId })
    )
    if (shouldHandleValueChangeOfParam) {
      await dispatch(handleValueChangeOfParam(name))
    }
  }
}

export const removeParameterValue = (name, parameterSetId) => ({
  type: REMOVE_PARAMETER_VALUE,
  payload: { name, parameterSetId }
})

// As opposed to removeParameterValue, this only sets value properties to
// null instead of removing the entire value object from the set.
export const clearParameterValues = (name, parameterSetId) => {
  return async (dispatch) => {
    await dispatch({
      type: CLEAR_PARAMETER_VALUES,
      payload: { name, parameterSetId }
    })
    await dispatch(handleValueChangeOfParam(name))
  }
}

export const setParameterDefault = ({ name, defaultValue, parameterSetId }) => {
  return async (dispatch, getState) => {
    if (!parameterSetId) {
      parameterSetId = getParameterSetIdForSelectedTab(getState())
    }

    const columnMetadata = await dispatch(
      getMetadataForParameterValue(defaultValue, name)
    )

    await dispatch({
      type: SET_PARAMETER_DEFAULT,
      payload: {
        name,
        defaultValue,
        parameterSetId,
        defaultColumnMetadata: columnMetadata
      }
    })
    await dispatch(handleValueChangeOfParam(name))
  }
}

export const removeParameterDefault = (name, parameterSetId) => ({
  type: REMOVE_PARAMETER_DEFAULT,
  payload: { name, parameterSetId }
})
