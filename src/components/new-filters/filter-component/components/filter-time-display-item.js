// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import moment from "moment"

export default function FilterTimeDisplayItem({ value }) {
  return (
    <div className="time-display">
      <div className="day">
        <span>{moment.utc(value).format("ddd")}</span>
      </div>
      <div className="date">
        <span>{moment.utc(value).format("MMM DD, YYYY")}</span>
      </div>
      <div className="time">
        <div className="hour-minute">
          <span>{moment.utc(value).format("HH:mm")}</span>
        </div>
        <div className="second">
          <span>{moment.utc(value).format("ss.SSS")}</span>
        </div>
      </div>
    </div>
  )
}

FilterTimeDisplayItem.propTypes = {
  onClick: PropTypes.string,
  value: PropTypes.string
}
