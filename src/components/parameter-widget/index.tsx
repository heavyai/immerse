// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { Dispatch } from "redux"
import { connect } from "react-redux"
import { debounce } from "lodash"
import { Icon } from "@rmwc/icon"

import { userCanEditDashboard } from "utils/privileges"
import {
  getParameterSetIdForSelectedTab,
  getSelectedTab,
  isParameterDefinedInSet,
  makeGetParameterHide,
  makeGetParameterValue,
  makeIsParameterInUse
} from "components/parameters/selectors"
import { parameterValueRequiresParens } from "components/parameters/utils"

import {
  ParameterDefinition,
  ParameterTypes
} from "components/parameters/parameters-types"
import { simpleSetParameterValue } from "components/parameters/actions/simple-action-wrappers"
import {
  linkParameter,
  unlinkParameter
} from "components/parameters/actions/parameter-link-actions"
import { removeParameterFromPanel } from "components/parameters/actions/parameter-visibility-action-creators"
import { SHOW_PARAMETER_MANAGER_MODAL } from "../parameter-manager/parameter-action-creators"
import { getDistinctColumnValues } from "../../actions/column-values-action-creators"
import {
  addParameterDashboardWidget,
  removeParameterDashboardWidget
} from "actions/parameter-dashboard-widget-action-creators"

import IconLinkOff from "components/svg-icons/icon-link-off"
import SendToDashboardIcon from "components/svg-icons/icon-send-to-dashboard"
import CancelOutlinedIcon from "components/svg-icons/icon-cancel-outlined"

import ParameterWidget from "./ParameterWidget"

import "./parameter-widget.scss"
import { setParameterHideInTab } from "../parameters/actions"

const mapStateToProps = (state) => {
  const selectedTabId = getSelectedTab(state)

  return {
    columnValues: state.columnValues,
    hasEditPrivileges: userCanEditDashboard(state.dashboard.privileges),
    dataSources: state.dashboard.dataSources,
    selectedTabId,
    getParameterValue: makeGetParameterValue(state),
    getParameterHide: makeGetParameterHide(state),
    parameterDefinedInSet: isParameterDefinedInSet(state),
    parameterSetIdForSelectedTab: getParameterSetIdForSelectedTab(state),
    isParameterInUse: makeIsParameterInUse(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  actions: {
    getDistinctColumnValues: debounce((dataSource, column, searchTerm) => {
      dispatch(
        getDistinctColumnValues({
          dataSource,
          column,
          searchTerm,
          excludeNulls: true,
          ignoreAllFilters: true
        })
      )
    }, 150)
  },
  parameterActions: {
    toggleLinked: (name: string, linked: boolean, value: string) => () => {
      dispatch(linked ? unlinkParameter(name, value) : linkParameter(name))
    },
    toggleHide: (name: string, hide: boolean) => () =>
      dispatch(setParameterHideInTab(name, !hide)),
    setValue: (name) => (value: { value: string }) => {
      dispatch(simpleSetParameterValue(name, value))
    },
    openParameterManager: (parameter: ParameterDefinition) => () => {
      dispatch({
        type: SHOW_PARAMETER_MANAGER_MODAL,
        parameterOnOpen: parameter
      })
    },
    resetToDefaultValue: (name: string, resetValue: string) => () => {
      dispatch(simpleSetParameterValue(name, resetValue))
    },
    removeParameterFromPanel: (name: string) => () => {
      dispatch(removeParameterFromPanel(name))
    },
    addParameterDashboardWidget: (name: string) => () => {
      dispatch(addParameterDashboardWidget(name))
    },
    removeParameterDashboardWidget: (name: string) => () => {
      dispatch(removeParameterDashboardWidget(name))
    }
  }
})

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const {
    selectedTabId,
    getParameterValue,
    getParameterHide,
    parameterDefinedInSet,
    isParameterInUse,
    parameterSetIdForSelectedTab
  } = stateProps

  const { parameterActions } = dispatchProps
  const { dashboardWidget = false } = ownProps
  const { name, defaultValue, type } = ownProps.parameter
  const hide = !dashboardWidget && getParameterHide(name)
  const linked = !parameterDefinedInSet(name, parameterSetIdForSelectedTab)

  const value = getParameterValue(name)
  const resetValue =
    // We're wrapping the values of custom sources in parentheses upstream, so we
    // need to do the same to their defaultValues in order for reset functionality
    // to work/display properly
    type === ParameterTypes.TABLE && parameterValueRequiresParens(defaultValue)
      ? `(${defaultValue})`
      : defaultValue
  const showReset = value !== resetValue
  const isInUse =
    isParameterInUse(name, selectedTabId) ||
    // Custom sources are always considered "in use" because otherwise they
    // can't be set as a source to initialize a chart
    type === ParameterTypes.TABLE

  const actions = {
    setValue: parameterActions.setValue(name),
    toggleLinked: parameterActions.toggleLinked(name, linked, value),
    toggleHide: parameterActions.toggleHide(name, hide),
    openParameterManager: parameterActions.openParameterManager(
      ownProps.parameter
    ),
    resetToDefaultValue: parameterActions.resetToDefaultValue(name, resetValue),
    addParameterDashboardWidget: parameterActions.addParameterDashboardWidget(
      name
    ),
    removeParameterFromPanel: parameterActions.removeParameterFromPanel(name),
    removeParameterDashboardWidget: parameterActions.removeParameterDashboardWidget(
      ownProps.widgetId
    )
  }

  const menuOptions = [
    {
      label: linked ? "Make local to this tab" : "Sync across tabs",
      handler: actions.toggleLinked,
      icon: linked ? <IconLinkOff /> : <Icon icon="link" />,
      testId: "param-panel-widget-sync"
    },
    {
      label: "Edit parameter",
      handler: actions.openParameterManager,
      icon: <Icon icon="edit" />,
      testId: "param-panel-widget-edit"
    },
    {
      label: "Reset to default value",
      handler: actions.resetToDefaultValue,
      icon: <Icon icon="replay" />,
      testId: "param-panel-widget-reset-default",
      tooltip:
        value === resetValue
          ? "This parameter is already set to its default value"
          : "",
      disabled: value === resetValue
    },
    {
      label: "Add to dashboard",
      handler: actions.addParameterDashboardWidget,
      icon: <SendToDashboardIcon />,
      testId: "param-panel-widget-add-dashboard-widget"
    },
    {
      label: "Remove from panel",
      handler: actions.removeParameterFromPanel,
      icon: <CancelOutlinedIcon />,
      testId: "param-panel-widget-remove",
      tooltip: isInUse
        ? type === ParameterTypes.TABLE
          ? "Custom sources cannot be removed"
          : "This parameter is currently in use."
        : "",
      disabled: isInUse
    }
  ]

  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    actions: {
      ...dispatchProps.actions,
      ...actions
    },
    menuOptions,
    value,
    linked,
    showReset,
    resetValue,
    isInUse,
    hide,
    showMenu: !ownProps.hideMenu && stateProps.hasEditPrivileges,
    dashboardWidget
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(ParameterWidget)
