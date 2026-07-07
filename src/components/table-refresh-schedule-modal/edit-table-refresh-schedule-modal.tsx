// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { TTableRefreshInfo } from "@heavyai/connector/dist/browser-connector"
import { DANGER as DANGER_MODAL_TYPE } from "constants/modal-types"
import {
  getDataSourcePreview,
  getDataSourcePreviewRequest
} from "actions/table-preview-action-creators"
import { showModal } from "actions/ui-action-creators"
import { updateConnectedTableRefreshSchedule } from "components/data-manager/services/data-sources.service"
import TableRefreshScheduleModal from "./table-refresh-schedule-modal"

// Modal for editing FSI refresh schedule on an existing table
const EditTableRefreshScheduleModal = ({
  tableName,
  onClose
}: {
  tableName: string
  onClose: () => void
}) => {
  const dispatch = useDispatch()

  const refreshInfo = useSelector<{
    tablePreview: {
      tableDetails?: {
        refresh_info: TTableRefreshInfo
      }
    }
  }>(({ tablePreview }) => tablePreview.tableDetails?.refresh_info)

  const submitRefreshSchedule = async (newRefreshInfo: TTableRefreshInfo) => {
    try {
      const resp = await updateConnectedTableRefreshSchedule(
        tableName,
        newRefreshInfo
      )

      if (resp.ok) {
        dispatch(getDataSourcePreviewRequest())
        dispatch(getDataSourcePreview(tableName))
      } else {
        const responseText = await resp.text()

        dispatch(
          showModal({
            type: DANGER_MODAL_TYPE,
            heading: "Error",
            content: responseText
          })
        )
      }
    } catch (error) {
      dispatch(
        showModal({
          type: DANGER_MODAL_TYPE,
          heading: "Error",
          content: error
        })
      )
    }
  }

  return (
    <TableRefreshScheduleModal
      open
      onClose={onClose}
      onSave={submitRefreshSchedule}
      refreshInfo={refreshInfo}
    />
  )
}

export default EditTableRefreshScheduleModal
