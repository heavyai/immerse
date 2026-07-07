// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import { initializeDashboardSharingModal } from "actions/dashboard-sharing-action-creators"
import ShareLink from "./share-link"

const mapStateToProps = (state) => {
  const {
    dashboard: { id }
  } = state
  return { dashboardId: id }
}

export default connect(mapStateToProps, { initializeDashboardSharingModal })(
  ShareLink
)
