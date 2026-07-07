// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import Icon from "components/icon/icon"

export default function ShareLink({
  dashboardId,
  initializeDashboardSharingModal
}) {
  const handleClick = (e) => {
    e.preventDefault()
    initializeDashboardSharingModal(dashboardId)
  }

  return (
    <div
      id="dashboard-share"
      data-testid="dashboard-share"
      className="dashboard-action"
      onClick={handleClick}
    >
      <Icon name="share" className="icon" />
      <div className="icon-label">{"Share"}</div>
    </div>
  )
}

ShareLink.propTypes = {
  dashboardId: PropTypes.number,
  initializeDashboardSharingModal: PropTypes.func
}
