// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from "react"
import { AnyAction } from "redux"
import { ThunkDispatch } from "redux-thunk"
import { MenuSurfaceAnchor, Menu, MenuItem } from "@rmwc/menu"
import { Icon } from "@rmwc/icon"
import { connect, ConnectedProps } from "react-redux"

import { AppState } from "vega/charts/types"

import { copyCurrentDashboard } from "actions/dashboard-action-creators"
import { showDashboardMigrationModal } from "components/modals/dashboard-migration-modal/actions"

const mapStateToProps = (state: AppState) => {
  const {
    connection: {
      privileges: userPrivileges = {
        createDashboard: false
      }
    } = {},
    dashboard: {
      privileges: dashboardPrivileges = {
        editDashboard: false
      }
    } = {}
  } = state
  return {
    showDuplicateDashboard: userPrivileges.createDashboard,
    showUpgradeCharts: dashboardPrivileges.editDashboard
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<AppState, {}, AnyAction>
) => {
  return {
    actions: {
      duplicateDashboard() {
        dispatch(copyCurrentDashboard())
      },
      showDashboardMigrationModal() {
        dispatch(showDashboardMigrationModal())
      }
    }
  }
}

const connector = connect<
  ReturnType<typeof mapStateToProps>,
  ReturnType<typeof mapDispatchToProps>,
  {},
  AppState
>(mapStateToProps, mapDispatchToProps)

type Props = ConnectedProps<typeof connector>

const DashboardKebab: FC<Props> = ({
  showDuplicateDashboard,
  showUpgradeCharts,
  actions
}) => {
  const [isOpen, setOpen] = useState<boolean>(false)
  return (
    <MenuSurfaceAnchor className="dashboard-kebab-anchor">
      <Menu
        open={isOpen}
        onSelect={(e) => {
          e.stopPropagation()
          setOpen(false)
        }}
        onClose={(e) => {
          e.stopPropagation()
          setOpen(false)
        }}
        hoistToBody
        focusOnOpen={false}
        className="dashboard-kebab-menu"
        anchorCorner="topLeft"
      >
        {showDuplicateDashboard && (
          <MenuItem
            id="dashboard-copy"
            className="compact"
            data-testid="dashboard-duplicate"
            onClick={actions.duplicateDashboard}
          >
            Duplicate dashboard
          </MenuItem>
        )}
        {showUpgradeCharts && (
          <MenuItem
            className="compact"
            onClick={actions.showDashboardMigrationModal}
          >
            Upgrade charts
          </MenuItem>
        )}
      </Menu>
      <div
        className="dashboard-kebab-button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!isOpen)
        }}
        data-testid="dashboard-kebab-menu"
      >
        <Icon icon="more_vert" />
      </div>
    </MenuSurfaceAnchor>
  )
}

export default connector(DashboardKebab)
