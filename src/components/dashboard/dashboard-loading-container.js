// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import DashboardLoading from "./dashboard-loading"

const mapStateToProps = ({
  dashboard: {
    loadState: { complete },
    selectedTabId,
    tabs
  }
}) => ({
  loadComplete: complete,
  selectedTabId,
  tabs
})

const ConnectedDashboardLoadingContainer = connect(mapStateToProps)(
  DashboardLoading
)

export default ConnectedDashboardLoadingContainer
