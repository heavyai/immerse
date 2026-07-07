// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import compose from "recompose/compose"
import { connect } from "react-redux"
import MeasureYAxisToggle from "./measure-yaxis-toggle"
import PropTypes from "prop-types"
import setPropTypes from "recompose/setPropTypes"
import { Y_AXIS_ORIENTATIONS } from "constants/charts"

const propTypes = {
  chartId: PropTypes.string.isRequired,
  measureIndex: PropTypes.string.isRequired,
  toggleYAxisOrientation: PropTypes.func
}

export function mapStateToProps({ charts }, { chartId, measureIndex }) {
  const measure = charts[chartId].measures[measureIndex]
  return {
    chartType: charts[chartId].type,
    yAxisOrientation:
      (measure && measure.yAxisOrientation) || Y_AXIS_ORIENTATIONS.LEFT
  }
}

export function mapDispatchToProps(dispatch) {
  return {
    dispatch
  }
}

export function mergeProps(
  { chartType, yAxisOrientation },
  _,
  { measureIndex, toggleYAxisOrientation }
) {
  return {
    chartType,
    yAxisOrientation,
    toggleYAxisOrientation: (orientation) => {
      toggleYAxisOrientation(measureIndex, orientation)
    }
  }
}

export default compose(
  setPropTypes(propTypes),
  connect(mapStateToProps, mapDispatchToProps, mergeProps)
)(MeasureYAxisToggle)
