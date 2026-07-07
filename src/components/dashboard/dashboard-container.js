// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import compose from "recompose/compose"
import { connect } from "react-redux"
import Dashboard from "./dashboard"
import PropTypes from "prop-types"
import setPropTypes from "recompose/setPropTypes"
import { withRouter } from "react-router-dom"
import { getUserConfigurableUISettings } from "reducers/user-configurable-ui-reducer"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { getParameterDefinitions } from "components/parameters/selectors"
import { PARAMETER_CONTAINER } from "components/dashboard/dashboard-grid-constants"
import { MIN_DASHBOARD_CONFIG_PANEL_WIDTH } from "components/dashboard/consts"

const {
  DEFAULT_FILTER_PANEL_OPEN,
  RESTRICTED_VIEWING
} = available_feature_flags

const propTypes = {
  params: PropTypes.object.isRequired
}

function mapStateToProps(state) {
  const isDashboardLoaded = Boolean(
    !state.dashboards.dashboardLoading &&
      !state.dashboard.loadState.request &&
      !state.dashboard.saveState.request &&
      state.dashboard.id &&
      !state.app.error
  )

  const isDashboardSaved = Boolean(
    state.dashboard.saveState.isSaved && state.dashboard.id
  )

  const {
    chart: { dashboardGridMargin }
  } = getUserConfigurableUISettings(state)

  const showFilterPanelByDefault = getFeatureFlag(DEFAULT_FILTER_PANEL_OPEN)

  return {
    annotationsEditMode: state.annotations && state.annotations.editMode,
    editId: state.chartEditor.editId,
    editing: state.chartEditor.editing,
    charts: state.charts,
    isConnected: state.connection.isConnected,
    isMultiLayeringEnabled: state.connection.isMultiLayeringEnabled,
    isPolyRasterEnabled: state.connection.isPolyRasterEnabled,
    dashboardId: state.dashboard.id,
    dashboardSpec: state.dashboard,
    chartContainers: state.dashboard.chartContainers.map((d) =>
      Object.assign({}, d, { containerType: state.charts[d.id].type })
    ),
    parameterContainers: (state.dashboard.parameterContainers || []).map(
      (widget) => {
        return {
          ...widget,
          containerType: PARAMETER_CONTAINER,
          ...getParameterDefinitions(state)[widget.parameterName]
        }
      }
    ),
    layout: state.dashboard.layout,
    useCSSTransforms: !state.app.isFirefox,
    omnifilters: state.omnifilters,
    dataSources: state.dashboard.dataSources,
    /*
      For automation to determine if a dashboard is loaded with no errors
      TODO: Create helpers and data-automation-* to allow automation to check for modals and error states through modals
    */
    isDashboardLoaded,
    isDashboardSaved,
    showFilterPanelByDefault,
    dashboardGridMargin,
    restrictViewing:
      getFeatureFlag(RESTRICTED_VIEWING) &&
      !state.dashboard.privileges.editDashboard,
    configPanelWidth:
      state.dashboard.configPanelWidth || MIN_DASHBOARD_CONFIG_PANEL_WIDTH
  }
}

export default compose(
  setPropTypes(propTypes),
  connect(mapStateToProps)
)(withRouter(Dashboard))
