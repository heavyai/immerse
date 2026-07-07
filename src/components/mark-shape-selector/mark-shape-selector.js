// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import CustomSelector from "components/custom-selector/custom-selector"

import MarkCircleIcon from "components/mark-shape-icons/mark-circle"
import MarkCrossIcon from "components/mark-shape-icons/mark-cross"
import MarkDiamondIcon from "components/mark-shape-icons/mark-diamond"
import MarkHexagonHorizIcon from "components/mark-shape-icons/mark-hexagon-horiz"
import MarkHexagonVertIcon from "components/mark-shape-icons/mark-hexagon-vert"
import MarkSquareIcon from "components/mark-shape-icons/mark-square"
import MarkTriangleDownIcon from "components/mark-shape-icons/mark-triangle-down"
import MarkTriangleLeftIcon from "components/mark-shape-icons/mark-triangle-left"
import MarkTriangleRightIcon from "components/mark-shape-icons/mark-triangle-right"
import MarkTriangleUpIcon from "components/mark-shape-icons/mark-triangle-up"
import MarkWedgeIcon from "components/mark-shape-icons/mark-wedge"
import MarkArrowIcon from "components/mark-shape-icons/mark-arrow"

const orientationMarks = [
  { icon: <MarkWedgeIcon />, label: "wedge", value: "wedge" },
  { icon: <MarkArrowIcon />, label: "arrow", value: "arrow" }
]

const customSelectorOptions = [
  { icon: <MarkCircleIcon />, label: "circle", value: "circle" },
  { icon: <MarkCrossIcon />, label: "cross", value: "cross" },
  { icon: <MarkDiamondIcon />, label: "diamond", value: "diamond" },
  { icon: <MarkSquareIcon />, label: "square", value: "square" },
  { icon: <MarkTriangleUpIcon />, label: "triangle-up", value: "triangle-up" },
  {
    icon: <MarkTriangleDownIcon />,
    label: "triangle-down",
    value: "triangle-down"
  },
  {
    icon: <MarkTriangleLeftIcon />,
    label: "triangle-left",
    value: "triangle-left"
  },
  {
    icon: <MarkTriangleRightIcon />,
    label: "triangle-right",
    value: "triangle-right"
  },
  {
    icon: <MarkHexagonVertIcon />,
    label: "hexagon-vert",
    value: "hexagon-vert"
  },
  {
    icon: <MarkHexagonHorizIcon />,
    label: "hexagon-horiz",
    value: "hexagon-horiz"
  }
]

const renderOption = (option) => (
  <div className="mark-shape-label">
    <div className="mark-shape-icon">{option.icon}</div>
    {option.label}
  </div>
)

const MarkShapeSelector = ({ markShape, onChange, hasOrientation }) => {
  let markTypeOptions = []
  if (hasOrientation) {
    const temp = customSelectorOptions.map((option) => {
      return {
        ...option,
        ...{ inactive: true }
      }
    })
    markTypeOptions = orientationMarks.concat(temp)
  } else {
    markTypeOptions = customSelectorOptions.concat(orientationMarks)
  }

  return (
    <CustomSelector
      className="sort-by-dropdown"
      currentValue={markShape}
      id="mark-shape-selector"
      onChange={onChange}
      options={markTypeOptions}
      renderOption={renderOption}
      hasOrientation={hasOrientation}
    />
  )
}

MarkShapeSelector.propTypes = {
  markShape: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

export default MarkShapeSelector
