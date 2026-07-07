// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  GET_DATA_SOURCE_PREVIEW_ERROR,
  GET_DATA_SOURCE_PREVIEW_REQUEST,
  GET_DATA_SOURCE_PREVIEW_SUCCESS,
  SET_COLUMN_COMMENT,
  SET_DATA_SOURCE_COMMENT,
  SET_DATA_SOURCE_PRIVS
} from "constants/action-types"
import { getDataSourcePrivileges } from "actions/privileges-thunks"
import { getCustomTableExpressionFields } from "services/ImmerseCrossFilter/utils"
import { findJoinDataSourceForParameter } from "components/join-manager/use-join-from-parameter"
import { getTablesForDataSource } from "components/join-manager/utils"
import { hasParamSyntax } from "utils/parameters"

export const getDataSourcePreviewRequest = () => ({
  type: GET_DATA_SOURCE_PREVIEW_REQUEST
})

export const getDataSourcePreviewError = () => ({
  type: GET_DATA_SOURCE_PREVIEW_ERROR
})

export const getDataSourcePreviewSuccess = (
  name,
  fields,
  tableDetails,
  size,
  sample
) => ({
  type: GET_DATA_SOURCE_PREVIEW_SUCCESS,
  fields,
  tableDetails,
  rowCount: { label: "rows", value: size },
  tableName: name,
  dataSourceDescriptor: tableDetails,
  sampleRows: sample
})

export const setDataSourcePrivs = (dataSourcePrivileges) => ({
  type: SET_DATA_SOURCE_PRIVS,
  dataSourcePrivileges
})

export const getDataSourcePrivs = (dataSource) => async (dispatch) =>
  dispatch(setDataSourcePrivs(await getDataSourcePrivileges(dataSource)))

export const getDataSourcePreview = (
  dataSourceName,
  includeSampleRows = false
) => async (dispatch, getState, services) => {
  // If it has an explicit data source, use that, otherwise its the name of a table
  dispatch(getDataSourcePreviewRequest())
  const DbCon = services.get("DbCon")
  const joinDataSources = getState().joinDataSources
  const joinDataSource = findJoinDataSourceForParameter(
    dataSourceName,
    joinDataSources
  )

  const crossfilter = services
    .get("CrossFilter")
    .crossfilter(DbCon, getTablesForDataSource(dataSourceName), dataSourceName)

  let fields = []
  let tableDetails = {}
  try {
    if (joinDataSource) {
      // Join data source has param syntax too, so check this first
      await crossfilter.getFieldsAsync()
      const tableDescriptors = Object.values(crossfilter.getTableDescriptors())
      fields = tableDescriptors.map((td) => td.columns).flat()
    } else if (hasParamSyntax(dataSourceName)) {
      // Custom SQL data source
      fields = await getCustomTableExpressionFields({
        connector: DbCon,
        table: dataSourceName
      })
    } else {
      // getFieldsAsync returns a whole bunch of stuff including columns
      // In this case we also set tableDetails to capture the rest of the info
      tableDetails = await DbCon.getFieldsAsync(dataSourceName)
      fields = tableDetails?.columns
    }
  } catch (e) {
    dispatch(getDataSourcePreviewError())
  }

  try {
    const [size, sample] = await Promise.all([
      crossfilter.sizeAsync(),
      includeSampleRows
        ? DbCon.queryAsync(`SELECT * FROM ${dataSourceName} LIMIT 10`)
        : []
    ])
    dispatch(
      getDataSourcePreviewSuccess(
        dataSourceName,
        fields,
        tableDetails,
        size,
        sample
      )
    )
  } catch (error) {
    dispatch(getDataSourcePreviewError())
  }
}

export const setColumnComment = (columnName, comment) => ({
  type: SET_COLUMN_COMMENT,
  columnName,
  comment
})

export const setDataSourceComment = (comment) => ({
  type: SET_DATA_SOURCE_COMMENT,
  comment
})
