// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import { dashboardSharingUserShape } from "constants/prop-types"
import IconRemove from "components/svg-icons/icon-remove"

UserRoleListItem.propTypes = {
  user: dashboardSharingUserShape,
  removeUser: PropTypes.func
}

function UserRoleListItem({ user, removeUser }) {
  const handleClick = (e) => {
    e.preventDefault()
    removeUser(user)
  }

  return (
    <div className="dashboard-share-modal--user-role-list-item">
      <label>{user.id}</label>
      <button className="button remove-user" onClick={handleClick}>
        <IconRemove />
      </button>
    </div>
  )
}

export default UserRoleListItem
