// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import PropTypes from "prop-types"
import { dashboardSharingUserShape } from "constants/prop-types"
import { ascend, filter, prop, sortWith, groupWith, eqProps } from "ramda"
import { SimpleDialog } from "widgets/dialog/Dialog"
import cx from "classnames"

import AddUserOrRoleForm from "./add-user-or-role-form"
import UserRoleListItem from "./user-role-list-item"
import ShareLinkForm from "./share-link-form"

DashboardShareModal.propTypes = {
  bulk: PropTypes.bool,
  addDashboardSharedUser: PropTypes.func,
  removeDashboardSharedUser: PropTypes.func,
  closeDashboardShareModal: PropTypes.func,
  updateDashboardSharedUsersList: PropTypes.func,
  updateDashboardAutosuggestValue: PropTypes.func,
  updateDashboardShareSuggestions: PropTypes.func,
  shareDashboard: PropTypes.func,
  dashboardId: PropTypes.number,
  dashboardOwner: PropTypes.string,
  allUsersAndRoles: PropTypes.arrayOf(dashboardSharingUserShape),
  sharedUsersList: PropTypes.arrayOf(dashboardSharingUserShape),
  suggestions: PropTypes.arrayOf(dashboardSharingUserShape),
  autosuggestValue: PropTypes.string,
  bulkShare: PropTypes.func,
  bulkUnshare: PropTypes.func
}

function DashboardShareModal({
  bulk,
  addDashboardSharedUser,
  removeDashboardSharedUser,
  closeDashboardShareModal,
  updateDashboardSharedUsersList,
  updateDashboardAutosuggestValue,
  updateDashboardShareSuggestions,
  shareDashboard,
  dashboardId,
  dashboardOwner,
  allUsersAndRoles,
  sharedUsersList,
  suggestions,
  autosuggestValue,
  bulkShare,
  bulkUnshare
}) {
  const [mode, setMode] = useState("share")

  const handleCloseCancel = () => {
    closeDashboardShareModal()
    updateDashboardSharedUsersList([])
  }

  const handleCloseConfirm = () => {
    if (bulk) {
      if (mode === "share") {
        bulkShare(sharedUsersList)
      } else {
        bulkUnshare(sharedUsersList)
      }
    } else {
      closeDashboardShareModal()
      shareDashboard(dashboardId, sharedUsersList)
      updateDashboardSharedUsersList(sharedUsersList)
    }
  }

  const renderSharedUsersList = (grantees) => {
    const sharedUsers =
      grantees && filter(({ id }) => id !== dashboardOwner, grantees)

    if (sharedUsers && sharedUsers.length) {
      const sortedSharedUsers = sortWith(
        [ascend(prop("type")), ascend(prop("id"))],
        sharedUsers
      )

      const groupedSharedUsers = groupWith(eqProps("type"), sortedSharedUsers)

      return groupedSharedUsers.map((group) => (
        <div key={`group${group[0].type}`}>
          <label className="dashboard-share-modal--user-role-heading">
            {group[0].type === "ROLE" ? "Roles" : "Users"}
          </label>
          {group.map((user) => (
            <UserRoleListItem
              key={user.id}
              user={user}
              removeUser={removeDashboardSharedUser}
            />
          ))}
        </div>
      ))
    } else {
      return (
        <div className="dashboard-share-modal--user-role-list-item none-selected">
          <label>{"No users or roles selected"}</label>
        </div>
      )
    }
  }

  const title = bulk ? "Share/Unshare Dashboards" : "Dashboard Sharing"

  return (
    <SimpleDialog
      open
      title={title}
      primaryLabel="Apply"
      primaryAction={handleCloseConfirm}
      secondaryLabel="Cancel"
      secondaryAction={handleCloseCancel}
      onCloseFromHeader={handleCloseCancel}
    >
      <div className="custom-modal-dashboard-sharing-body">
        <div>
          {bulk && (
            <div className="dashboard-share-modal--tabs">
              <div
                className={cx(
                  "dashboard-share-modal--tab-item",
                  mode === "share" && "selected"
                )}
                onClick={() => setMode("share")}
              >
                Share
              </div>
              <div
                className={cx(
                  "dashboard-share-modal--tab-item",
                  mode === "unshare" && "selected"
                )}
                onClick={() => setMode("unshare")}
              >
                Unshare
              </div>
            </div>
          )}
          <AddUserOrRoleForm
            autosuggestValue={autosuggestValue}
            suggestions={suggestions}
            allUsersAndRoles={allUsersAndRoles}
            sharedUsersList={sharedUsersList}
            addDashboardSharedUser={addDashboardSharedUser}
            updateDashboardAutosuggestValue={updateDashboardAutosuggestValue}
            updateDashboardShareSuggestions={updateDashboardShareSuggestions}
          />
          <div className="dashboard-share-modal--users-roles-label">
            <label>{mode === "share" ? "Share" : "Unshare"} with</label>
          </div>
          <div className="dashboard-share-modal--users-roles-list">
            {renderSharedUsersList(sharedUsersList)}
          </div>
        </div>
        {!bulk && <ShareLinkForm formattedLink={window.location.href} />}
      </div>
    </SimpleDialog>
  )
}

export default DashboardShareModal
