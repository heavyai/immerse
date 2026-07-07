// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import { importDashboard } from "actions/dashboard-action-creators"
import DashboardImportModal from "./dashboard-import-modal"

const mapDispatchToProps = (dispatch) => ({
  importDashboard(title, metadata, state) {
    dispatch(importDashboard(title, metadata, state))
  }
})

export default connect(null, mapDispatchToProps)(DashboardImportModal)
