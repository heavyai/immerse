// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import Icon from "../icon/icon"
import cx from "classnames"

interface TitleProps {
  valid: boolean
  value: string
}

const DashboardTitle: FC<TitleProps> = ({ valid, value }) =>
  valid ? (
    <div
      className={cx("placeholder", {
        hasValue: value.length
      })}
    >
      <span className="placeholder-text">
        <Icon className="icon edit-icon" name="pencil" />
        <span id="dashboard-title">{value || "Untitled Dashboard"}</span>
      </span>
    </div>
  ) : (
    <div className="title-error">{"Dashboard Title Required"}</div>
  )

export default DashboardTitle
