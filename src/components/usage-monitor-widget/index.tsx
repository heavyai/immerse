// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import "./styles.scss"
import UsageGauge from "components/settings/gauge/usage-gauge"
import { Icon } from "@rmwc/icon"

const UsageMonitorWidget = () => {
  // TODO Replace hardcoded values
  const showGpuLimitWarning = false
  const showCpuLimitWarning = true
  const gpuLimit = 32
  const cpuLimit = 32
  const gpuValue = 2.5
  const cpuValue = 19.2

  return (
    <div className="usage-monitor-widget">
      {(showGpuLimitWarning || showCpuLimitWarning) && (
        <div className="usage-monitor-widget__warning">
          <Icon icon={{ icon: "info", size: "small" }} /> Free Version Limit
          Approaching
        </div>
      )}
      <div className="usage-monitor-widget__meter-container">
        <UsageGauge
          limit={gpuLimit}
          showWarning={showGpuLimitWarning}
          value={gpuValue}
          label={"GPU"}
        />
      </div>
      <div className="usage-monitor-widget__meter-container">
        <UsageGauge
          limit={cpuLimit}
          showWarning={showCpuLimitWarning}
          value={cpuValue}
          label={"CPU"}
        />
      </div>
    </div>
  )
}

export default UsageMonitorWidget
