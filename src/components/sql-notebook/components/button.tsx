// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import classNames from "classnames"

import "./button.scss"

export enum BUTTON_TYPES {
  SUCCESS = "SUCCESS",
  PRIMARY = "PRIMARY",
  SECONDARY = "SECONDARY",
  DEFAULT = "DEFAULT",
  ERROR = "ERROR"
}

export type ButtonProps = {
  type?: BUTTON_TYPES
  trailingIcon?: JSX.Element
  icon?: JSX.Element
  disabled?: boolean
  label?: string | JSX.Element
  className?: string
  onClick?: () => void
  outlined?: boolean
}

export const Button = ({
  type = BUTTON_TYPES.DEFAULT,
  className,
  icon,
  trailingIcon,
  disabled = false,
  label,
  onClick,
  outlined = false
}: ButtonProps) => {
  return (
    <button
      className={classNames(className, "notebook-button", {
        "button-success": type === BUTTON_TYPES.SUCCESS,
        "button-primary": type === BUTTON_TYPES.PRIMARY,
        "button-secondary": type === BUTTON_TYPES.SECONDARY,
        "button-error": type === BUTTON_TYPES.ERROR,
        "button-outlined": outlined
      })}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && <div className="notebook-button__icon">{icon}</div>}
      {label}
      {trailingIcon && (
        <div className="notebook-button__icon">{trailingIcon}</div>
      )}
    </button>
  )
}

export const ButtonGroup = ({
  className,
  children
}: {
  className?: string
  children: JSX.Element | Array<JSX.Element | undefined | boolean>
}) => {
  return (
    <div className={classNames("notebook-button-group", className)}>
      {children}
    </div>
  )
}
