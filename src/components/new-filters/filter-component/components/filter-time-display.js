// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import moment from "moment"

import FilterTimeDisplayItem from "./filter-time-display-item"
import { noneSelected } from "../filter-component-options"

export default function FilterTimeDisplay({
  selectedOption,
  start,
  end,
  value,
  onClick
}) {
  if (selectedOption.name === noneSelected.name || selectedOption.isRelative) {
    return null
  }

  let timeInputs = <div className="time-empty">Select time...</div>

  const isValidTime = (time) => time && moment(time, moment.ISO_8601).isValid()

  if (selectedOption.args.includes("value")) {
    if (isValidTime(value)) {
      timeInputs = <FilterTimeDisplayItem value={value} />
    }
  } else if (isValidTime(start) && isValidTime(end)) {
    timeInputs = (
      <React.Fragment>
        <FilterTimeDisplayItem value={start} />
        <div className="hyphen">-</div>
        <FilterTimeDisplayItem value={end} />
      </React.Fragment>
    )
  }

  return (
    <div className={"time-fields"} onClick={onClick}>
      {timeInputs}
    </div>
  )
}

FilterTimeDisplay.propTypes = {
  start: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  end: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  value: PropTypes.string,
  onClick: PropTypes.func,
  selectedOption: PropTypes.shape({
    name: PropTypes.string,
    isRelative: PropTypes.bool
  })
}
