// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, MouseEventHandler } from "react"
import { IconButton } from "widgets/icon-button/Icon-button"
import { Tooltip } from "@rmwc/tooltip"
import cx from "classnames"

import { DANGER } from "constants/modal-types"
import "./styles.scss"
import { isUserExportDisabled } from "utils/user"
import { useUserRoles } from "hooks"

type ModalAction = {
  action(): void
  text: string
  closeModal?: boolean
}

type Props = {
  selectedCount: number
  bulkDelete(): void
  bulkExport(): void
  bulkShare(): void
  clearAllDashboardSelections(): void
  hideModal(): void
  showModal(opts: {
    type?: string
    className?: string
    heading: string
    content: string
    closeOnAction?: boolean
    primaryAction?: ModalAction
    secondaryAction?: ModalAction
  }): void
  isSharingRestricted: boolean
}

const BulkActions: FC<Props> = ({
  bulkDelete,
  bulkExport,
  bulkShare,
  clearAllDashboardSelections,
  hideModal,
  selectedCount,
  showModal,
  isSharingRestricted
}) => {
  const onExport: MouseEventHandler = (evt) => {
    evt.preventDefault()
    showModal({
      heading: selectedCount > 1 ? "Export Dashboards" : "Export Dashboard",
      content:
        selectedCount > 1
          ? `Export ${selectedCount} dashboards as individual json files.`
          : "Export dashboard as an individual json file.",
      hideCloseIcon: true,
      primaryAction: {
        action: bulkExport,
        text: "Export"
      },
      secondaryAction: {
        action: hideModal,
        text: "Cancel"
      }
    })
  }

  const onShare: MouseEventHandler = (evt) => {
    evt.preventDefault()
    bulkShare()
  }

  const onDelete: MouseEventHandler = (evt) => {
    evt.preventDefault()

    const numDashboardsText =
      selectedCount > 1 ? `these ${selectedCount} dashboards` : "this dashboard"
    showModal({
      type: DANGER,
      heading: selectedCount > 1 ? "Delete Dashboards" : "Delete Dashboard",
      content: `Deleting dashboards is a destructive action and cannot be reversed. Are you sure you want to delete ${numDashboardsText}?`,
      hideCloseIcon: true,
      primaryAction: {
        action: bulkDelete,
        text: "Yes, delete"
      },
      secondaryAction: {
        action: hideModal,
        text: "No, Cancel"
      }
    })
  }

  const clearAll: MouseEventHandler = (evt) => {
    evt.preventDefault()
    clearAllDashboardSelections()
  }

  const roles = useUserRoles()
  const canExport = !isUserExportDisabled(roles)

  return (
    <div
      className={cx(
        "dashboard-bulk-actions",
        selectedCount === 0 && "disabled"
      )}
    >
      Bulk actions:
      {canExport && (
        <Tooltip content="Export selected" enterDelay={500}>
          <IconButton
            icon="get_app"
            data-testid="bulk-actions-export"
            disabled={selectedCount === 0}
            onClick={onExport}
          />
        </Tooltip>
      )}
      {!isSharingRestricted && (
        <Tooltip content="Share selected" enterDelay={500}>
          <IconButton
            icon="share"
            data-testid="bulk-actions-share"
            disabled={selectedCount === 0}
            onClick={onShare}
          />
        </Tooltip>
      )}
      <Tooltip content="Delete selected" enterDelay={500}>
        <IconButton
          icon="delete"
          data-testid="bulk-actions-delete"
          disabled={selectedCount === 0}
          onClick={onDelete}
        />
      </Tooltip>
      {selectedCount > 0 && (
        <span>
          {selectedCount} selected (
          <a href="#" onClick={clearAll}>
            clear all
          </a>
          )
        </span>
      )}
    </div>
  )
}

export default BulkActions
