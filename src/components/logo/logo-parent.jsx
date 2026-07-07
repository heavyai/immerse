// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { connect } from "react-redux"
import Logo from "components/logo/logo"
import * as NavBarActions from "actions/nav-bar-action-creators"
import { hideModal, showModal } from "actions/ui-action-creators"
import { inDashboard } from "utils/routerPath"
import { openUrlInWindow } from "utils/navigation"
import { WARNING } from "constants/modal-types"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

function mapStateToProps(state) {
  return {
    hasCustomHomeRoute: Boolean(
      state.connection.isDemo ||
        state.connection.user.customStyles?.logoClickURL
    ),
    unsavedDashboard: Boolean(
      inDashboard(state.router.location.pathname) &&
        !state.dashboard.saveState.isSaved
    ),
    canEditDashboard: Boolean(
      state.connection.isSuperuser ||
        (!state.connection.isDemo && state.dashboard.privileges.editDashboard)
    )
  }
}

function mapDispatchToProps(dispatch) {
  return {
    navigateHome(e) {
      if (e && e.metaKey) {
        openUrlInWindow(`/`, e.shiftKey)
      } else {
        dispatch(NavBarActions.handleHomeClick())
      }
    },
    navigateToHomeOverride() {
      dispatch(NavBarActions.routeToHomeOverride())
    },
    discardUnsavedDashboardChanges(nextAction) {
      if (getFeatureFlag(available_feature_flags.WARN_UNSAVED_DASHBOARD)) {
        dispatch(
          showModal({
            type: WARNING,
            heading: "Discard Unsaved Changes",
            content:
              "This dashboard contains unsaved changes. Are you sure you want to discard your changes?",
            primaryAction: {
              action: () => nextAction(),
              text: "Yes, Discard Changes"
            },
            secondaryAction: {
              action: hideModal,
              text: "No, Cancel"
            }
          })
        )
      } else {
        nextAction()
      }
    }
  }
}

export function mergeProps(stateProps, dispatchProps, ownProps) {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    handleHomeClick() {
      const clickAction = stateProps.hasCustomHomeRoute
        ? dispatchProps.navigateToHomeOverride
        : dispatchProps.navigateHome
      if (stateProps.unsavedDashboard && stateProps.canEditDashboard) {
        return dispatchProps.discardUnsavedDashboardChanges(clickAction)
      }
      return clickAction()
    }
  }
}

const LogoParent = ({ handleHomeClick }) => (
  <div className="main-nav-logo" onClick={handleHomeClick}>
    <Logo />
  </div>
)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(LogoParent)
