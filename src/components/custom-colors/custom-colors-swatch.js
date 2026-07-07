// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import Icon from "components/icon/icon"

CustomColorsSwatch.propTypes = {
  colorValue: PropTypes.string.isRequired,
  id: PropTypes.string,
  isDisabled: PropTypes.bool,
  lineStyle: PropTypes.string,
  measureIndex: PropTypes.string,
  onClick: PropTypes.func.isRequired
}

export default function CustomColorsSwatch({
  colorValue,
  id,
  onClick,
  isDisabled,
  measureIndex,
  lineStyle
}) {
  return (
    <div className={"custom-swatch"} data-testid="custom-swatch">
      <div
        className={`color-swatch ${lineStyle ? "line" : ""}`}
        id={`${id}-color${measureIndex ? `-${measureIndex}` : ""}`}
        onClick={onClick}
      >
        <div
          className={"color-item"}
          data-testid="custom-swatch--color-item"
          style={{ color: isDisabled ? "#a7a7a7" : colorValue }}
        >
          <Icon name={`line-${lineStyle}`} />
        </div>
      </div>
    </div>
  )
}
