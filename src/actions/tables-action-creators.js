// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  CONFIRM_TABLES_TRANSACTION_ERROR,
  ADD_TABLES_WITH_META_SUCCESS,
  DROP_TABLE_SUCCESS,
  TRUNC_TABLE_SUCCESS,
  SET_TABLE_PICKER_SEARCH_VAL,
  SELECT_PREVIEW_TABLE,
  RESET_PREVIEW_TABLE
} from "constants/action-types"
import { getDataSourcePreview } from "actions/table-preview-action-creators"
import { TTableType } from "@heavyai/connector/dist/browser-connector"

// moved to a separate file to bust a circular dependency
import {
  startDataManagerRequest,
  dataManagerTransactionError,
  addTablesSuccess
} from "./tables-datasources-list-action-creators"
import { getDataSourcesList } from "./tables-get-datasources-list"
import { dropConnectedTable } from "../components/data-manager/services/data-sources.service"

export {
  startDataManagerRequest,
  dataManagerTransactionError,
  addTablesSuccess,
  getDataSourcesList
}

export const DROP_METHOD_NAME = "DROP"
export const TRUNCATE_METHOD_NAME = "TRUNCATE"

export const setTablePickerSearchVal = (searchVal) => ({
  type: SET_TABLE_PICKER_SEARCH_VAL,
  payload: searchVal
})

export const selectPreviewTable = (name, index) => ({
  type: SELECT_PREVIEW_TABLE,
  name,
  index
})

export const resetPreviewDataSource = () => ({
  type: RESET_PREVIEW_TABLE
})

export const addTablesWithMetaSuccess = (tablesWithMeta) => ({
  type: ADD_TABLES_WITH_META_SUCCESS,
  tablesWithMeta
})

export const confirmAddTablesError = () => ({
  type: CONFIRM_TABLES_TRANSACTION_ERROR
})

export const dropDataSourceSuccess = (tableName) => ({
  type: DROP_TABLE_SUCCESS,
  tableName
})

export const truncTableSuccess = (tableName) => ({
  type: TRUNC_TABLE_SUCCESS,
  tableName
})

export const handleDropDataSourceSuccess = (dataSource, dispatch) => {
  dispatch(dropDataSourceSuccess(dataSource))
  dispatch(resetPreviewDataSource())
}

export const dropDataSource = (
  dataSourceName,
  isView,
  dataSourceDescriptor
) => (dispatch, getState, services) => {
  const method = isView ? "VIEW" : "TABLE"
  dispatch(startDataManagerRequest())
  return dataSourceDescriptor.table_type === TTableType.FOREIGN
    ? dropConnectedTable(dataSourceName)
        .then(() => {
          handleDropDataSourceSuccess(dataSourceName, dispatch)
          return dataSourceName
        })
        .catch((err) => {
          dispatch(dataManagerTransactionError(err))
          throw err
        })
    : new Promise((resolve, reject) => {
        const query = `${DROP_METHOD_NAME} ${method} ${dataSourceName}`
        services.get("DbCon").query(query, {}, (error) => {
          if (error) {
            dispatch(dataManagerTransactionError(error))
            reject(error, query)
          } else {
            handleDropDataSourceSuccess(dataSourceName, dispatch)
            resolve(dataSourceName)
          }
        })
      })
}

export const handleTruncTableSuccess = (tableName, dispatch) => {
  dispatch(truncTableSuccess(tableName))
  dispatch(getDataSourcePreview(tableName))
}

export const truncTable = (tableName) => (dispatch, getState, services) => {
  dispatch(startDataManagerRequest())
  return new Promise((resolve, reject) => {
    const query = `${TRUNCATE_METHOD_NAME} TABLE ${tableName}`
    services.get("DbCon").query(query, {}, (error) => {
      if (error) {
        dispatch(dataManagerTransactionError(error))
        reject(error, query)
      } else {
        handleTruncTableSuccess(tableName, dispatch)
        resolve(tableName)
      }
    })
  })
}

export const getTablesWithMeta = () => (dispatch, getState, services) => {
  dispatch(startDataManagerRequest())
  return services
    .get("DbCon")
    .getTablesWithMetaAsync()
    .then((tablesWithMeta) => {
      dispatch(addTablesWithMetaSuccess(tablesWithMeta))
    })
    .catch((error) => {
      dispatch(dataManagerTransactionError(error))
    })
}
