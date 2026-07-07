// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import cx from "classnames"
import { measureShape } from "constants/prop-types"

MeasureAggTypeSelector.propTypes = {
  aggTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  measure: measureShape,
  updateAggType: PropTypes.func.isRequired
}

export default function MeasureAggTypeSelector({
  measure,
  updateAggType,
  aggTypes
}) {
  return (
    <div className={"agg-type-group"}>
      {aggTypes.map((type, index) => (
        <span
          className={"agg-type-wrapper"}
          key={index}
          onClick={updateAggType(type)}
        >
          <span
            className={cx("radio-button", {
              checked: measure.aggType === type
            })}
          >
            <span className="label">{type}</span>
          </span>
        </span>
      ))}
    </div>
  )
}
