// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { SecondaryButton } from "widgets/button/Button"
import { useDispatch, useSelector } from "react-redux"
import { push } from "connected-react-router"
import { generatePath } from "react-router"
import { ROUTE_DATA_MANAGEMENT } from "routes/paths"
import { dropDataSource, truncTable } from "actions/tables-action-creators"
import { hideDangerModal, showDangerModal } from "actions/ui-action-creators"

import { refreshConnectedTable } from "../services/data-sources.service"

import { generateImportAppendPath } from "../utils/generate-import-path"
import EditTableRefreshScheduleModal from "../../table-refresh-schedule-modal/edit-table-refresh-schedule-modal"

const ExistingTableActionsHeader = ({
  loading,
  isView,
  dataSourcePrivileges,
  tableName,
  isFsiConnectedSource = false
}: {
  loading: boolean
  isView: boolean
  dataSourcePrivileges: {
    truncate: boolean
    drop: boolean
    insert: boolean
  }
  tableName: string
  isFsiConnectedSource: boolean
}) => {
  const dataSourceDescriptor = useSelector<{
    tablePreview: {
      dataSourceDescriptor: {
        table_type: number
      }
    }
  }>(({ tablePreview: { dataSourceDescriptor: dsd } = {} }) => dsd)

  const [showRefreshSettings, setShowRefreshSettings] = useState(false)
  const { dbName } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()
  const appendPath = generateImportAppendPath({ dbName, tableName })

  const dropTable = () => {
    dispatch(hideDangerModal())
    dispatch(dropDataSource(tableName, isView, dataSourceDescriptor))
    dispatch(
      push({ pathname: generatePath(ROUTE_DATA_MANAGEMENT, { dbName }) })
    )
  }

  const cancelAction = {
    action: () => dispatch(hideDangerModal()),
    text: "Cancel"
  }

  const onClickDropTable = () => {
    const tableOrView = isView ? "View" : "Table"
    const labelText = `Delete ${tableOrView}`

    dispatch(
      showDangerModal({
        title: labelText,
        className: "delete-table-or-view-confirm-modal",
        message: (
          <span>
            Deleting <b>{tableName}</b> is a permanent action and cannot be
            undone.
          </span>
        ),
        primaryAction: {
          action: dropTable,
          text: `Delete ${tableOrView.toLowerCase()}`
        },
        secondaryAction: cancelAction
      })
    )
  }

  const deleteAllRows = () => {
    dispatch(hideDangerModal())
    dispatch(truncTable(tableName))
    dispatch(
      push({
        pathname: generatePath(ROUTE_DATA_MANAGEMENT, { dbName, tableName })
      })
    )
  }

  const onClickDeleteAllRows = () => {
    dispatch(
      showDangerModal({
        title: "Delete All Rows",
        message: (
          <span>
            Deleting all rows in <b>{tableName}</b> is a permanent action and
            cannot be undone.
          </span>
        ),
        primaryAction: {
          action: deleteAllRows,
          text: "Delete All Rows"
        },
        secondaryAction: {
          action: () => dispatch(hideDangerModal()),
          text: "Cancel"
        },
        className: "trunc-table-confirm-modal"
      })
    )
  }

  return (
    <div className="table-actions-header">
      {isFsiConnectedSource && (
        <div>
          <SecondaryButton
            data-testid={"table-preview-refresh-connected-source"}
            onClick={() => refreshConnectedTable(tableName)}
          >
            Refresh Data Now
          </SecondaryButton>
          <SecondaryButton
            data-testid={"table-preview-schedule-refresh-connected-source"}
            onClick={() => setShowRefreshSettings(true)}
          >
            Refresh Settings
          </SecondaryButton>
        </div>
      )}
      <div>
        {!loading && dataSourcePrivileges.drop && (
          <SecondaryButton
            data-testid={"table-preview-delete-table"}
            onClick={onClickDropTable}
          >
            Delete {isView ? "View" : "Table"}
          </SecondaryButton>
        )}
        {!loading && dataSourcePrivileges.truncate && !isFsiConnectedSource && (
          <SecondaryButton
            data-testid={"table-preview-delete-all-rows"}
            onClick={onClickDeleteAllRows}
          >
            Delete All Rows
          </SecondaryButton>
        )}
        {!loading && dataSourcePrivileges.insert && !isFsiConnectedSource && (
          <SecondaryButton
            data-testid={"table-preview-append-data"}
            onClick={() => history.push(appendPath)}
          >
            Append Data
          </SecondaryButton>
        )}
      </div>
      {showRefreshSettings && (
        <EditTableRefreshScheduleModal
          onClose={() => setShowRefreshSettings(false)}
          tableName={tableName}
        />
      )}
    </div>
  )
}

export default ExistingTableActionsHeader
