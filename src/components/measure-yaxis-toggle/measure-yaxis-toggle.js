// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { compose, withHandlers } from "recompose"
import React from "react"
import PropTypes from "prop-types"
import cx from "classnames"
import { Y_AXIS_ORIENTATIONS } from "constants/charts"

MeasureYAxisToggle.propTypes = {
  handleLeftAxisClick: PropTypes.func.isRequired,
  handleRightAxisClick: PropTypes.func.isRequired,
  toggleYAxisOrientation: PropTypes.func.isRequired,
  yAxisOrientation: PropTypes.string
}

export function MeasureYAxisToggle({
  handleLeftAxisClick,
  handleRightAxisClick,
  yAxisOrientation
}) {
  return (
    <div className="measure-yaxis-toggle">
      <span
        className="agg-type-wrapper y-axis-toggle y-axis-toggle-left"
        onClick={handleLeftAxisClick}
      >
        <span
          className={cx("radio-button-axis-toggle", "left-axis", {
            checked:
              yAxisOrientation === Y_AXIS_ORIENTATIONS.LEFT || !yAxisOrientation
          })}
        >
          <span className="label">Primary Axis</span>
        </span>
      </span>
      <span
        className={"agg-type-wrapper y-axis-toggle y-axis-toggle-right"}
        onClick={handleRightAxisClick}
      >
        <span
          className={cx("radio-button-axis-toggle", "right-axis", {
            checked: yAxisOrientation === Y_AXIS_ORIENTATIONS.RIGHT
          })}
        >
          <span className="label">Secondary Axis</span>
        </span>
      </span>
    </div>
  )
}

export default compose(
  withHandlers({
    handleLeftAxisClick: (props) => () => {
      props.toggleYAxisOrientation(Y_AXIS_ORIENTATIONS.LEFT)
    },
    handleRightAxisClick: (props) => () => {
      props.toggleYAxisOrientation(Y_AXIS_ORIENTATIONS.RIGHT)
    }
  })
)(MeasureYAxisToggle)
