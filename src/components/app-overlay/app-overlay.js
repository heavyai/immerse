// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { identity } from "ramda"
import {
  SimpleDialog,
  SimpleDangerDialog,
  SimpleInfoDialog,
  SimpleWarningDialog
} from "widgets/dialog/Dialog"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

import { resetAppError } from "actions/app-action-creators"
import { resetDCErrorState } from "actions/charts-action-creators"
import {
  confirmDeleteDashboardError,
  confirmGetDashboardsError,
  confirmLoadDashboardDataAccessError
} from "actions/dashboards-action-creator"
import {
  confirmLoadDashboardError,
  confirmSaveDashboardError,
  confirmCopyDashboardError
} from "actions/dashboard-action-creators"
import { resetSpecificDCState } from "actions/dc-action-creators"
import resetAppState from "actions/reset-app-state-action-creator"
import { SQLEditorPrivilegeErrorConfirm } from "actions/sql-editor-action-creators"
import { confirmAddTablesError } from "actions/tables-action-creators"
import { hideModal } from "actions/ui-action-creators"
import { navigateToDashboardsList } from "actions/nav-bar-action-creators"
import * as allErrorMsgs from "constants/error-messages"
import {
  DANGER as DANGER_MODAL_TYPE,
  WARNING as WARNING_MODAL_TYPE,
  INFO as INFO_MODAL_TYPE,
  CUSTOM_MODAL_TYPES_SET
} from "constants/modal-types"
import { jsxPropType } from "constants/prop-types"
import { noop } from "utils/helpers"
import CustomModal from "./custom-modal"
import LoadingWidget from "./loading-widget"
import { BACKEND_ERROR_SESSION_NOT_VALID } from "../../utils/error-handling-helpers"
import { RefreshPromptModal } from "../modals/refresh-prompt-modal"

export function getLoadingMessage(state) {
  if (state.tables.loading) {
    return "Loading"
  } else if (state.dashboards.loading && !state.dashboards.hideLoadingOverlay) {
    return "Loading Dashboards"
  } else if (state.dashboards.dashboardLoading) {
    return "Loading Dashboard"
  } else if (state.importer.loading) {
    return "Loading Data Preview"
  } else if (state.connection.loading) {
    return "Connecting"
  } else if (state.settings.users.loading) {
    return "Loading Users"
  } else if (state.settings.roles.loading) {
    return "Loading Roles"
  } else {
    return ""
  }
}

const {
  RENDER_ERROR_HANDLING_REMOVE_HARD_RESET,
  CHART_LEVEL_ERRORS
} = available_feature_flags

export function getErrorMessageAndAction(state, dispatch) {
  /* eslint complexity: ["error", 25] */ // this function is too complex. Sorry.
  if (state.tables.error) {
    return {
      heading: allErrorMsgs.GET_TABLES_ERROR_HEADING,
      content: state.tables.error,
      primaryAction: {
        action: () => dispatch(confirmAddTablesError())
      }
    }
  } else if (state.dashboards.error) {
    return {
      heading: allErrorMsgs.GET_DASHBOARDS_ERROR_HEADING,
      content: state.dashboards.error,
      primaryAction: {
        action: () => dispatch(confirmGetDashboardsError())
      }
    }
  } else if (state.dashboard.loadState.error) {
    return {
      heading: allErrorMsgs.LOAD_DASHBOARD_ERROR_HEADING,
      content: state.dashboard.loadState.error,
      primaryAction: {
        action: () => {
          dispatch(confirmLoadDashboardError())
          dispatch(navigateToDashboardsList())
        }
      }
    }
  } else if (state.dashboard.loadState.dataAccessError) {
    return {
      heading: allErrorMsgs.LOAD_DASHBOARD_DATA_ACCESS_ERROR_HEADING,
      content: allErrorMsgs.LOAD_DASHBOARD_DATA_ACCESS_ERROR_CONTENT,
      primaryAction: {
        text: "Return",
        action: () => {
          dispatch(confirmLoadDashboardDataAccessError())
          dispatch(resetAppState())
          dispatch(navigateToDashboardsList())
        }
      }
    }
    // all of these chart-ish errors should now be handled at the chart level.
  } else if (
    !getFeatureFlag(CHART_LEVEL_ERRORS) &&
    state.dc.initialRender.error
  ) {
    const error = state.app.error.message || state.dc.initialRender.error || ""
    return {
      heading: allErrorMsgs.INTIAL_RENDER_ERROR_HEADING,
      content: `${error}`,
      primaryAction: {
        action: () => {
          dispatch(resetSpecificDCState("initialRender"))

          if (!getFeatureFlag(RENDER_ERROR_HANDLING_REMOVE_HARD_RESET)) {
            dispatch(resetAppState())
            dispatch(navigateToDashboardsList())
          }
        }
      }
    }
  } else if (!getFeatureFlag(CHART_LEVEL_ERRORS) && state.dc.renderAll.error) {
    const error = state.app.error.message || state.dc.renderAll.error || ""
    return {
      heading: allErrorMsgs.RENDER_ALL_ERROR_HEADING,
      content: `${error}`,
      primaryAction: {
        action: () => {
          dispatch(resetSpecificDCState("renderAll"))
        }
      }
    }
  } else if (!getFeatureFlag(CHART_LEVEL_ERRORS) && state.dc.redrawAll.error) {
    const error = state.app.error.message || state.dc.redrawAll.error || ""
    return {
      heading: allErrorMsgs.REDRAW_ALL_ERROR_HEADING,
      content: `${error}`,
      primaryAction: {
        action: () => {
          dispatch(resetSpecificDCState("redrawAll"))

          if (!getFeatureFlag(RENDER_ERROR_HANDLING_REMOVE_HARD_RESET)) {
            dispatch(resetAppState())
            dispatch(navigateToDashboardsList())
          }
        }
      }
    }
  } else if (state.dashboard.saveState.error) {
    return {
      heading: allErrorMsgs.SAVE_DASHBOARD_ERROR_HEADING,
      content:
        state.dashboard.saveState.error ||
        allErrorMsgs.SAVE_DASHBOARD_ERROR_CONTENT,
      primaryAction: {
        action: () => dispatch(confirmSaveDashboardError())
      }
    }
  } else if (state.dashboard.copyState.error) {
    return {
      heading: allErrorMsgs.COPY_DASHBOARD_ERROR_HEADING,
      content:
        state.dashboard.copyState.errorMessage ||
        allErrorMsgs.COPY_DASHBOARD_ERROR_CONTENT,
      primaryAction: {
        action: () => dispatch(confirmCopyDashboardError())
      }
    }
  } else if (state.dashboards.delete.error) {
    return {
      heading: allErrorMsgs.DELETE_DASHBOARD_ERROR_HEADING,
      content: `${allErrorMsgs.DELETE_DASHBOARD_ERROR_CONTENT} ${state.dashboards.delete.id}`,
      primaryAction: {
        action: () => dispatch(confirmDeleteDashboardError())
      }
    }
  } else if (state.app.error) {
    return {
      heading: state.app.error.heading,
      content: state.app.error.message,
      primaryAction: {
        action: () => {
          dispatch(resetDCErrorState())
          dispatch(resetAppError())
        }
      }
    }
  } else if (state.sqlEditor.sqlEditorPrivilegeError) {
    return {
      heading: allErrorMsgs.SQL_EDITOR_PRIVILEGE_ERROR_HEADING,
      content: allErrorMsgs.SQL_EDITOR_PRIVILEGE_ERROR_CONTENT,
      primaryAction: {
        action: () => {
          dispatch(SQLEditorPrivilegeErrorConfirm())
          dispatch(navigateToDashboardsList())
          // This might not be necessary, but it does ensure that we're back at square one
          dispatch(resetAppState())
        }
      }
    }
  } else {
    return {
      heading: "",
      content: "",
      primaryAction: {
        action: noop
      }
    }
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    handleHideModal: () => {
      dispatch(hideModal())
    }
  }
}

// FYI, because of the way getErrorMessageAndAction is written and
// our use of `identity` rather than `mapStateToProps`, `stateProps`
// is actually the entire redux state.
function mergeProps(stateProps, dispatchProps, ownProps) {
  const errorMessageAndAction = getErrorMessageAndAction(
    stateProps,
    dispatchProps.dispatch
  )

  // Session Timed Out heading override.
  if (
    (errorMessageAndAction.content || "").includes(
      BACKEND_ERROR_SESSION_NOT_VALID
    )
  ) {
    errorMessageAndAction.heading =
      allErrorMsgs.CONNECTION_TIMEOUT_ERROR_HEADING
    errorMessageAndAction.content =
      "This session has timed out; please log in again to continue using the product."
  }

  const loadingMessage = getLoadingMessage(stateProps)
  const hasErrorMessage =
    errorMessageAndAction.heading || errorMessageAndAction.content
  const hasModalOpenFlag = stateProps.ui.modal && stateProps.ui.modal.open
  const shouldShowRefreshModal = stateProps.ui.refreshModal

  const onLoggedOut =
    stateProps.router &&
    stateProps.router.location &&
    stateProps.router.location.pathname === "/logged-out"

  return {
    modal: stateProps.ui.modal,
    loadingMsg: loadingMessage,
    errorMsg: errorMessageAndAction,
    shouldShowLoading: loadingMessage && !hasErrorMessage && !hasModalOpenFlag,
    shouldShowError: hasErrorMessage,
    shouldShowModal: hasModalOpenFlag,
    onLoggedOut,
    shouldShowRefreshModal,
    ...dispatchProps,
    ...ownProps
  }
}

export class AppOverlay extends React.PureComponent {
  hideErrorModal() {
    // Seems unique to error modals.
    // This is required for the ESC button or clicking on the overlay to correctly close the modal.
    this.props.errorMsg.primaryAction.action()

    this.props.handleHideModal()
  }

  renderErrorModal() {
    return (
      <SimpleWarningDialog
        open
        hideCloseIcon
        title={this.props.errorMsg.heading}
        message={this.props.errorMsg.content}
        primaryAction={this.props.errorMsg.primaryAction.action}
        primaryLabel={this.props.errorMsg.primaryAction.text}
        onClose={this.hideErrorModal.bind(this)}
      />
    )
  }

  renderModal() {
    const shouldShowCustomModal = CUSTOM_MODAL_TYPES_SET.has(
      this.props.modal.type
    )

    if (shouldShowCustomModal) {
      return (
        <CustomModal
          className={this.props.modal.className}
          content={this.props.modal.content}
          heading={this.props.modal.heading}
          hideModal={this.props.handleHideModal}
          primaryAction={this.props.modal.primaryAction}
          secondaryAction={this.props.modal.secondaryAction || null}
          type={this.props.modal.type}
        />
      )
    }

    const dialogFooterProps = {}
    if (this.props.modal.loading) {
      dialogFooterProps.footer = this.props.modal.loading
      dialogFooterProps.preventOutsideDismiss = true
      dialogFooterProps.hideCloseIcon = true
    } else {
      dialogFooterProps.primaryAction =
        this.props.modal.primaryAction && this.props.modal.primaryAction.action
      dialogFooterProps.primaryLabel =
        this.props.modal.primaryAction && this.props.modal.primaryAction.text
      dialogFooterProps.secondaryAction =
        this.props.modal.secondaryAction &&
        this.props.modal.secondaryAction.action
      dialogFooterProps.secondaryLabel =
        this.props.modal.secondaryAction &&
        this.props.modal.secondaryAction.text
    }

    const onClose = this.props.modal.closeOnAction
      ? this.props.handleHideModal
      : () => {}

    const hideCloseIcon =
      this.props.modal.hideCloseIcon || !this.props.modal.closeOnAction

    const SimpleDialogComponent =
      {
        [DANGER_MODAL_TYPE]: SimpleDangerDialog,
        [WARNING_MODAL_TYPE]: SimpleWarningDialog,
        [INFO_MODAL_TYPE]: SimpleInfoDialog
        // If no type is passed in, use the generic dialog that has no icon
        // (for example, the About Immerse modal)
      }[this.props.modal.type] || SimpleDialog

    return (
      <SimpleDialogComponent
        open
        hideCloseIcon={hideCloseIcon}
        className={this.props.modal.className}
        title={this.props.modal.title || this.props.modal.heading}
        message={this.props.modal.message || this.props.modal.content}
        footer={this.props.modal.footer}
        onClose={onClose}
        onCloseFromHeader={this.props.handleHideModal}
        data-testid="simple-dialog"
        {...dialogFooterProps}
      />
    )
  }

  render() {
    let appOverlay = null

    if (
      // This app-overlay lives above the routing layer, but we still want to make
      // sure that it never shows an overlay for the /logged-out route alone. The
      // sole purpose of the /logged-out route is to show a static info modal itself,
      // and it shouldn't get effected by any leftover error states coming in here.
      !this.props.onLoggedOut &&
      (this.props.shouldShowLoading ||
        this.props.shouldShowError ||
        this.props.shouldShowModal ||
        this.props.shouldShowRefreshModal)
    ) {
      appOverlay = (
        <div className="app-overlay" data-testid="app-overlay">
          {this.props.shouldShowLoading && (
            <LoadingWidget message={this.props.loadingMsg} />
          )}
          {this.props.shouldShowRefreshModal && <RefreshPromptModal />}
          {this.props.shouldShowError && this.renderErrorModal()}
          {this.props.shouldShowModal && this.renderModal()}
        </div>
      )
    }

    return appOverlay
  }
}

AppOverlay.propTypes = {
  errorMsg: PropTypes.shape({
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    heading: PropTypes.string,
    primaryAction: PropTypes.object
  }),
  loadingMsg: PropTypes.string,
  modal: PropTypes.shape({
    content: jsxPropType,
    heading: jsxPropType,
    primaryAction: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
  }),
  shouldRenderOverlay: PropTypes.bool,
  handleHideModal: PropTypes.func
}

export default connect(identity, mapDispatchToProps, mergeProps)(AppOverlay)
