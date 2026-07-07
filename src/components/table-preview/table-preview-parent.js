// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { connect } from "react-redux"
import { push } from "connected-react-router"
import {
  getDataSourcePreview,
  getDataSourcePrivs
} from "actions/table-preview-action-creators"
import TablePreview from "components/table-preview/table-preview"
import {
  trackS3Import,
  trackSourceImport
} from "actions/importer-action-creators"
import { dropDataSource, truncTable } from "actions/tables-action-creators"
import { values } from "ramda"
import {
  hideModal,
  showDangerModal,
  hideDangerModal
} from "actions/ui-action-creators"
import { numberWithCommas } from "utils/helpers"

export const mapStateToProps = (
  {
    tablePreview: {
      loading,
      error,
      fields,
      rowCount,
      dataSourcePrivileges = {},
      dataSourceDescriptor = {},
      sampleRows = []
    } = {},
    importer
  },
  {
    dropDataSourceEnabled = true,
    truncTableEnabled = true,
    insertEnabled = true,
    showTableActions = true
  }
) => {
  const viewSql = dataSourceDescriptor.view_sql
  const isView = Boolean(viewSql)

  return {
    loading,
    error,
    fields: values(fields),
    rowCount,
    rowsRejected: importer.status.rows_rejected || 0,
    importStartTime: importer.startTime,
    importEndTime: importer.endTime,
    numberWithCommas,
    dropDataSourceEnabled:
      dropDataSourceEnabled && dataSourcePrivileges.drop && !loading,
    truncTableEnabled:
      truncTableEnabled && dataSourcePrivileges.truncate && !isView && !loading,
    appendTableEnabled:
      insertEnabled && dataSourcePrivileges.insert && !isView && !loading,
    viewSql,
    isView,
    showTableActions,
    sampleRows
  }
}

export const primaryAction = (
  dispatch,
  dataSourceName,
  isView,
  action
) => () => {
  dispatch(hideModal())
  dispatch(action(dataSourceName, isView))
}

export const mapDispatchToProps = (dispatch) => ({
  requestTablePreview(name) {
    dispatch(getDataSourcePreview(name))
    dispatch(getDataSourcePrivs(name))
  },
  trackS3Import(columnCount, rowCount) {
    dispatch(trackS3Import(columnCount, rowCount))
  },
  trackSourceImport(columnCount, rowCount) {
    dispatch(trackSourceImport(columnCount, rowCount))
  },
  dropDataSource: (dataSourceName, isView) => (e) => {
    const tableOrView = isView ? "View" : "Table"
    const labelText = `Delete ${tableOrView}`
    e.preventDefault()
    dispatch(
      showDangerModal({
        title: labelText,
        className: "delete-table-or-view-confirm-modal",
        message: (
          <span>
            Deleting <b>{dataSourceName}</b> is a permanent action and cannot be
            undone.
          </span>
        ),
        primaryAction: {
          action: primaryAction(
            dispatch,
            dataSourceName,
            isView,
            dropDataSource
          ),
          text: labelText
        },
        secondaryAction: {
          action: () => dispatch(hideDangerModal()),
          text: "Cancel"
        }
      })
    )
  },
  truncTable: (tableName) => (e) => {
    e.preventDefault()
    dispatch(
      showDangerModal({
        title: "Delete Table Rows",
        message: (
          <span>
            Deleting all rows in <b>{tableName}</b> is a permanent action and
            cannot be undone.
          </span>
        ),
        primaryAction: {
          action: primaryAction(dispatch, tableName, false, truncTable),
          text: "Delete Table Rows"
        },
        secondaryAction: {
          action: () => dispatch(hideDangerModal()),
          text: "Cancel"
        }
      })
    )
  },
  goToAppendData: (appendTableName) => (e) => {
    e.preventDefault()
    dispatch(
      push({
        pathname: "importer",
        state: {
          isAppendFlow: true,
          appendTableName
        }
      })
    )
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(TablePreview)
