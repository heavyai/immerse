// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"

import {
  getDataSourcePreview,
  getDataSourcePrivs
} from "actions/table-preview-action-creators"
import ExistingTablePreview from "./existing-table-preview"
import { TTableType } from "@heavyai/connector/dist/browser-connector"

export const mapStateToProps = (
  {
    tablePreview: {
      loading,
      error,
      fields,
      tableDetails,
      rowCount,
      dataSourcePrivileges = {},
      dataSourceDescriptor = {},
      sampleRows = []
    } = {},
    importer
  },
  ownProps
) => {
  const viewSql = dataSourceDescriptor.view_sql
  const isView = Boolean(viewSql)
  const isFsiConnectedSource = tableDetails?.table_type === TTableType.FOREIGN

  // Join sources, or any source that isn't backed by heavydb for that matter,
  // do not support comments and will not return a row_desc
  const showComments = ownProps.showComments && tableDetails?.row_desc

  return {
    loading,
    error,
    fields: Object.values(fields),
    rowCount,
    rowsRejected: importer.status.rows_rejected || 0,
    importStartTime: importer.startTime,
    importEndTime: importer.endTime,
    dataSourcePrivileges,
    sampleRows,
    isView,
    isFsiConnectedSource,
    refreshInfo: isFsiConnectedSource && tableDetails.refresh_info,
    tableComment: tableDetails?.comment,
    columnComments: tableDetails?.row_desc?.map((col) => col.comment),
    showComments
  }
}

export const mapDispatchToProps = (dispatch) => ({
  requestTablePreview(name) {
    dispatch(getDataSourcePreview(name))
    dispatch(getDataSourcePrivs(name))
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExistingTablePreview)
