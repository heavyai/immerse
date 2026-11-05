// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import BarLineToggle from "./bar-line-toggle"
import { connect } from "react-redux"
import { setMarkType } from "charts/combo/line-chart2/line2-action-creators"

export function mapStateToProps({ charts }, { chartId, measureIndex }) {
  const chart = charts[chartId]
  const { markTypes } = chart
  const markType =
    markTypes && Array.isArray(markTypes) && markTypes[measureIndex]
      ? markTypes[measureIndex]
      : null
  return {
    markType
  }
}

export function mapDispatchToProps(dispatch) {
  return {
    dispatch
  }
}

export function mergeProps(
  { markType },
  { dispatch },
  { chartId, measureIndex, chooseLineStyle }
) {
  return {
    markType,
    setMarkType: (newMarkType) => {
      dispatch(setMarkType(chartId, measureIndex, newMarkType))

      // make sure dotted lines don't display when switching to bar mark type
      if (newMarkType === "bar") {
        chooseLineStyle("solid")
      }
    }
  }
}

const ConnectedBarLineToggleParent = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(BarLineToggle)

export default ConnectedBarLineToggleParent
