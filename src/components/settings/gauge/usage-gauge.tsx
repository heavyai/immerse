// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import cx from "classnames"
import Gauge from "components/settings/gauge/gauge"

import "./styles.scss"

const UsageGauge = ({ limit, value, showWarning, label }) => {
  const gradientId = showWarning ? "gradient-warning" : "gradient-normal"
  return (
    <div className={cx("usage-gauge", { "usage-gauge--warning": showWarning })}>
      <Gauge
        percent={(value / limit) * 100}
        gradientId={gradientId}
        radius={86}
      />
      <div className="center-label">
        <h2 className="value">{value}</h2>
        <h3>{label}</h3>
      </div>
      <span className="upper-label">{limit}</span>
      <span className="lower-label">{0}</span>
    </div>
  )
}

export default UsageGauge
