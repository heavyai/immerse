// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef, useState } from "react"
import { Tooltip } from "@rmwc/tooltip"
import cx from "classnames"

import { JoinType } from "./join-manager-types"
import IconJoinLeft from "components/svg-icons/icon-join-left"
import IconJoinInner from "components/svg-icons/icon-join-inner"

const JOIN_PICKER_OPTIONS = [
  {
    value: JoinType.INNER,
    label: "Inner",
    tooltip:
      "Returns only the rows with matching values of both source A and B.",
    icon: <IconJoinInner className="join-icon" />
  },
  {
    value: JoinType.LEFT,
    label: "Left",
    tooltip:
      "Returns all rows from source A, and the matching rows from source B.",
    icon: <IconJoinLeft className="join-icon" />
  }
]

const JoinTypePicker = ({ setJoinType, selectedJoinType, error = false }) => {
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef()

  const handleClickOutside = (e) => {
    if (pickerRef.current && !pickerRef.current.contains(e.target)) {
      setPickerOpen(false)
    }
  }

  useEffect(() => setPickerOpen(false), [selectedJoinType])
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedJoinOption = JOIN_PICKER_OPTIONS.find(
    ({ value }) => value === selectedJoinType
  )

  return (
    <div className={cx("join-type-picker", { error })} ref={pickerRef}>
      {pickerOpen ? (
        JOIN_PICKER_OPTIONS.map((props) => (
          <JoinTypePickerItem
            {...props}
            onClick={() => setJoinType(props.value)}
            key={props.value}
            selected={props.value === selectedJoinType}
            opened
          />
        ))
      ) : (
        <JoinTypePickerItem
          {...selectedJoinOption}
          onClick={() => setPickerOpen(true)}
          selected
        />
      )}
    </div>
  )
}

const JoinTypePickerItem = ({
  value,
  label,
  icon,
  tooltip,
  onClick,
  selected,
  opened
}) => (
  <Tooltip
    className="join-type-picker-tooltip"
    enterDelay={500}
    content={
      <div
        style={{
          width: "260.8px"
        }}
      >
        {tooltip}
      </div>
    }
    showArrow
  >
    <div
      className={cx(
        "join-type-picker-item",
        {
          "join-type-picker-item--selected": selected
        },
        {
          "join-type-picker-item--opened": opened
        }
      )}
      key={value}
      onClick={onClick}
      data-testid="join-type-picker-item"
    >
      <span className="join-type-picker-item__label">{label}</span>
      {icon}
    </div>
  </Tooltip>
)

export default JoinTypePicker
