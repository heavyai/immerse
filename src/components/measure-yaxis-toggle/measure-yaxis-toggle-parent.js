// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import MeasureYAxisToggle from "./measure-yaxis-toggle"
import { Y_AXIS_ORIENTATIONS } from "constants/charts"

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

const ConnectedMeasureYaxisToggleParent = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(MeasureYAxisToggle)

export default ConnectedMeasureYaxisToggleParent
