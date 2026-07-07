// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import cx from "classnames"

import "./button-group.scss"

interface ButtonOption {
  label: string
  value: string
  icon?: FC
  selected?: boolean
}

interface Props {
  buttons: ButtonOption[]
  onButtonClick: Function
  title?: string
  className?: string
  disabled?: boolean
}

const ButtonGroup: FC<Props> = ({
  buttons,
  onButtonClick,
  title,
  className = "",
  disabled = false
}) => {
  const renderedButtons = buttons.map((button) => {
    const buttonClass = cx(
      "button-group-button",
      { selected: button.selected },
      { disabled },
      `value-${button.value}`
    )
    return (
      <div
        key={button.label}
        className={buttonClass}
        onClick={() => (disabled ? null : onButtonClick(button.value))}
      >
        {button.icon && (
          <div className="button-icon">
            <button.icon />
          </div>
        )}
        <div className="button-text">{button.label}</div>
      </div>
    )
  })

  const buttonGroupClassName = cx("chart-settings-button-group", className)
  return (
    <div className={buttonGroupClassName}>
      {title && <div className="button-group-title">{title}</div>}
      <div className="button-group-buttons">{renderedButtons}</div>
    </div>
  )
}

export default ButtonGroup
