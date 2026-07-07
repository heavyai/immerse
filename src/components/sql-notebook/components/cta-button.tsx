// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import "./cta-button.scss"
import classNames from "classnames"

type CTAButtonProps = {
  text?: String
  onClick: () => void
  trailingIcon?: JSX.Element
  className?: string
  disabled?: boolean
}
export const CTAButton = ({
  onClick,
  trailingIcon,
  text,
  className,
  disabled
}: CTAButtonProps) => {
  return (
    <button
      className={classNames("cta-button", className, {
        "cta-button__with-text": Boolean(text)
      })}
      onClick={onClick}
      disabled={disabled}
    >
      {text && <div className="cta-button__text">{text}</div>}
      {trailingIcon && (
        <div className="cta-button__trailing-icon">{trailingIcon}</div>
      )}
    </button>
  )
}
