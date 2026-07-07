// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { compose, withHandlers } from "recompose"
import React from "react"
import PropTypes from "prop-types"
import cx from "classnames"

const BarLineToggle = ({ handleLeftClick, handleRightClick, markType }) => (
  <div className="bar-line-toggle" data-testid="bar-line-toggle">
    <span className="wrapper toggle toggle-left" onClick={handleLeftClick}>
      <span
        data-testid="line-toggle-button"
        className={cx("radio-button", "line", {
          checked: markType === "line" || !markType
        })}
      >
        <span className="label">Line</span>
      </span>
    </span>
    <span className={"wrapper toggle toggle-right"} onClick={handleRightClick}>
      <span
        data-testid="bar-toggle-button"
        className={cx("radio-button", "bar", { checked: markType === "bar" })}
      >
        <span className="label">Bar</span>
      </span>
    </span>
  </div>
)

BarLineToggle.propTypes = {
  handleLeftClick: PropTypes.func.isRequired,
  handleRightClick: PropTypes.func.isRequired,
  markType: PropTypes.string,
  setMarkType: PropTypes.func.isRequired
}

export default compose(
  withHandlers({
    handleLeftClick: (props) => () => {
      props.setMarkType("line")
    },
    handleRightClick: (props) => () => {
      props.setMarkType("bar")
    }
  })
)(BarLineToggle)
