// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { TSourceType } from "@heavyai/connector/dist/browser-connector"
import { SecondaryButton } from "widgets/button/Button"
import {
  toggleImportSettingsModal,
  setFSIRefreshInfo
} from "actions/importer-action-creators"
import { hasGeoColumns } from "components/table-importer/table-importer-helpers"
import TableRefreshScheduleModal from "components/table-refresh-schedule-modal/table-refresh-schedule-modal"

const ImportTablePreviewActionsHeader = ({
  isFsiConnectedSource = false,
  disableActions = false
}: {
  tableName: string
  isFsiConnectedSource: boolean
  disableActions: boolean
}) => {
  const [showRefreshSettings, setShowRefreshSettings] = useState(false)
  const dispatch = useDispatch()

  const {
    settings: { source_type },
    data
  } = useSelector(({ importer }) => importer)

  const showSettingsButton =
    source_type === TSourceType.DELIMITED_FILE ||
    source_type === TSourceType.RASTER_FILE ||
    hasGeoColumns(data)

  return (
    <div className="table-actions-header">
      <div>
        {showSettingsButton && (
          <SecondaryButton
            data-testid={"table-preview-import-settings"}
            onClick={() => dispatch(toggleImportSettingsModal(true))}
            disabled={disableActions}
          >
            Settings...
          </SecondaryButton>
        )}
      </div>

      <div>
        {isFsiConnectedSource && (
          <SecondaryButton
            data-testid={"table-preview-refresh-schedule"}
            onClick={() => setShowRefreshSettings(true)}
            disabled={disableActions}
          >
            Refresh Settings
          </SecondaryButton>
        )}
      </div>
      {showRefreshSettings && (
        <TableRefreshScheduleModal
          open
          onClose={() => setShowRefreshSettings(false)}
          onSave={(newRefreshInfo) => {
            dispatch(setFSIRefreshInfo(newRefreshInfo))
          }}
        />
      )}
    </div>
  )
}

export default ImportTablePreviewActionsHeader
