// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"

import DashboardShareModalParent from "components/modals/dashboard-share-modal/dashboard-share-modal-parent"
import DashboardImportModalParent from "components/modals/dashboard-import-modal/dashboard-import-modal-parent"
import CategorySelectionModal from "components/modals/category-selection-modal/category-selection-modal"
import CustomSQLManager from "components/custom-sql-manager/custom-sql-manager"
import CustomSourceManager from "components/custom-source-manager/custom-source-manager"
import DashboardMigrationModal from "components/modals/dashboard-migration-modal"
import ParameterManager from "components/parameter-manager"
import CohortBuilder from "components/cohort-builder/cohort-builder"
import ChartExportModal from "components/modals/chart-export-modal"
import { JoinManagerModal } from "components/join-manager/join-manager-modal"
import * as ModalTypes from "constants/modal-types"
import { jsxPropType } from "constants/prop-types"

CustomModal.propTypes = {
  className: PropTypes.string,
  content: jsxPropType,
  heading: jsxPropType,
  hideModal: PropTypes.func,
  primaryAction: PropTypes.object,
  secondaryAction: PropTypes.object,
  type: PropTypes.oneOf(Object.keys(ModalTypes))
}

export default function CustomModal(props) {
  switch (props.type) {
    case ModalTypes.DASHBOARD_IMPORT:
      return <DashboardImportModalParent {...props} />
    case ModalTypes.DASHBOARD_SHARING:
      return <DashboardShareModalParent {...props} />
    case ModalTypes.DASHBOARD_BULK_SHARING:
      return <DashboardShareModalParent bulk {...props} />
    case ModalTypes.CATEGORY_SELECTION:
      return <CategorySelectionModal />
    case ModalTypes.CUSTOM_SQL_MANAGER:
      return <CustomSQLManager />
    case ModalTypes.CUSTOM_SOURCE_MANAGER:
      return <CustomSourceManager />
    case ModalTypes.COHORT_BUILDER:
      return <CohortBuilder />
    case ModalTypes.CHART_EXPORT:
      return <ChartExportModal chartId={props.content} />
    case ModalTypes.DASHBOARD_MIGRATION:
      return <DashboardMigrationModal />
    case ModalTypes.PARAMETER_MANAGER:
      return <ParameterManager />
    case ModalTypes.JOIN_MANAGER:
      return <JoinManagerModal {...props} />
    default:
      return null
  }
}
