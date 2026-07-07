// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import cx from "classnames"

import "./chevron-toggle.scss"

interface IChevronToggle {
  isCollapsed: boolean
  onClick: () => void
}

export const ChevronToggle = ({ isCollapsed, onClick }: IChevronToggle) => {
  return (
    <div className="chevron-toggle" onClick={onClick}>
      <div
        className={cx("chevron-toggle__icon", {
          collapsed: isCollapsed
        })}
      />
    </div>
  )
}
