// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import PropTypes from "prop-types"
import { connect } from "react-redux"
import compose from "recompose/compose"
import setPropTypes from "recompose/setPropTypes"
import DashboardLoading from "./dashboard-loading"

const propTypes = {
  params: PropTypes.object
}

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

export default compose(
  setPropTypes(propTypes),
  connect(mapStateToProps)
)(DashboardLoading)
