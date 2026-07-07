// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  ADD_TABLES_REF_ERROR,
  ADD_TABLES_REF_REQUEST,
  ADD_TABLES_REF_SUCCESS
} from "constants/action-types"

export const addTablesRequest = () => ({
  type: ADD_TABLES_REF_REQUEST
})

export const addTablesError = (error) => ({
  type: ADD_TABLES_REF_ERROR,
  error
})

export const addTablesSuccess = (tablesReference) => ({
  type: ADD_TABLES_REF_SUCCESS,
  tablesReference
})

export const getTables = () => (dispatch, getState, services) => {
  dispatch(addTablesRequest())
  return services
    .get("DbCon")
    .getTablesAsync()
    .then((tables) => {
      dispatch(addTablesSuccess(tables))
    })
    .catch((error) => {
      dispatch(addTablesError(error))
    })
}
