// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import BulkActions from "./BulkActions"
import { hideModal, showModal } from "actions/ui-action-creators"
import {
  bulkDelete,
  bulkExport,
  clearAllDashboardSelections
} from "actions/dashboards-action-creator"
import { initializeDashboardBulkSharingModal as bulkShare } from "actions/dashboard-sharing-action-creators"
import { isSharingRestricted } from "components/dashboard/dashboard-helpers"

const mapStateToProps = ({ dashboards, connection }) => ({
  selectedCount: dashboards.selected.size,
  isSharingRestricted: isSharingRestricted(connection)
})

const mapDispatchToProps = {
  bulkDelete,
  bulkExport,
  bulkShare,
  clearAllDashboardSelections,
  hideModal,
  showModal
}

export default connect(mapStateToProps, mapDispatchToProps)(BulkActions)
