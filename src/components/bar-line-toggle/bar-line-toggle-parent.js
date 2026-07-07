// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import BarLineToggle from "./bar-line-toggle"
import compose from "recompose/compose"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import { setMarkType } from "charts/combo/line-chart2/line2-action-creators"
import setPropTypes from "recompose/setPropTypes"

const propTypes = {
  chartId: PropTypes.string,
  measureIndex: PropTypes.string.isRequired,
  chooseLineStyle: PropTypes.func.isRequired
}

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

export default compose(
  setPropTypes(propTypes),
  connect(mapStateToProps, mapDispatchToProps, mergeProps)
)(BarLineToggle)
