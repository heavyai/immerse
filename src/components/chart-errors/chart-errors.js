// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { Icon } from "@rmwc/icon"

import "./chart-errors.scss"

const ChartErrors = ({ errorMessage }) => (
  <div className="chart-errors">
    <div>
      <Icon
        className="chart-errors__icon"
        icon={{ icon: "warning", size: "large" }}
      />
    </div>
    <p>Could not render chart</p>
    <p className="chart-errors__message">{errorMessage}</p>
  </div>
)

export default ChartErrors
