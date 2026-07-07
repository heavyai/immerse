// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from "react"
import { Icon } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"
import cx from "classnames"

import IconDuplicate from "components/svg-icons/icon-duplicate"
import IconExport from "components/svg-icons/icon-export"

type Props = {
  dashboardId: string
  dashboardName: string
  visible: boolean
  copyDashboard: (dashboardId: string) => void
  deleteDashboard: (dashboardId: string) => void
  exportDashboard: (dashboardId: string) => void
}

const handleClick = (fn) => (event) => {
  event.stopPropagation()
  event.preventDefault()
  fn()
}

const handleOpenMenu = (setMenuOpen) =>
  handleClick(() => {
    setMenuOpen(true)
  })

const handleCopyDashboard = (copyDashboard, dashboardId) =>
  handleClick(() => {
    copyDashboard(dashboardId)
  })

const handleDeleteDashboard = (deleteDashboard, dashboardId) =>
  handleClick(() => {
    deleteDashboard(dashboardId)
  })

const handleExportDashboard = (exportDashboard, dashboardId) =>
  handleClick(() => {
    exportDashboard(dashboardId)
  })

const DashboardMenu: FC<Props> = ({
  dashboardId,
  dashboardName,
  visible,
  copyDashboard,
  deleteDashboard,
  exportDashboard
}) => {
  const [menuOpen, setMenuOpen] = useState(false)

  if (!visible && menuOpen) {
    setMenuOpen(false)
  }

  return (
    <div
      data-testid={`dashboard-menu-${dashboardId}`}
      className="dashboard-menu-container"
    >
      <button
        className="button dashboard-action-button dashboard-action-menu-button"
        data-dashboard-name={dashboardName}
        onClick={handleOpenMenu(setMenuOpen)}
      >
        <Icon icon="more_vert" />
      </button>
      <div
        className={cx("dashboard-actions-menu", {
          "dashboard-actions-menu-open": menuOpen
        })}
      >
        <Tooltip content="Delete dashboard" enterDelay={500}>
          <button
            className="button dashboard-action-button dashboard-action-delete-button"
            data-testid={`dashboard-action-delete-button-${dashboardId}`}
            data-dashboard-name={dashboardName}
            onClick={handleDeleteDashboard(deleteDashboard, dashboardId)}
          >
            <Icon icon="delete" />
          </button>
        </Tooltip>
        <Tooltip content="Download dashboard" enterDelay={500}>
          <button
            className="button dashboard-action-button dashboard-action-export-button"
            data-testid={`dashboard-action-export-button-${dashboardId}`}
            onClick={handleExportDashboard(exportDashboard, dashboardId)}
          >
            <IconExport className="icon" />
          </button>
        </Tooltip>
        <Tooltip content="Duplicate dashboard" enterDelay={500}>
          <button
            className="button dashboard-action-button dashboard-action-duplicate-button"
            data-testid={`dashboard-action-copy-button-${dashboardId}`}
            onClick={handleCopyDashboard(copyDashboard, dashboardId)}
          >
            <IconDuplicate className="icon" />
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

export default DashboardMenu
