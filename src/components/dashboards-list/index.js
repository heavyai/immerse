// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"

import DashboardsList from "./dashboards-list"
import {
  toggleDashboard,
  selectAllDashboardsInList,
  deselectAllDashboardsInList
} from "actions/dashboards-action-creator"

const mapDispatchToProps = {
  toggleDashboard,
  selectAllDashboardsInList,
  deselectAllDashboardsInList
}

export default connect(null, mapDispatchToProps)(DashboardsList)
