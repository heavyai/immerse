// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import UsageMonitorWidget from "components/usage-monitor-widget"
import LogsLauncher from "components/settings/settings-sections/usage/logs-launcher"
import SystemDashboardsLauncher from "components/settings/settings-sections/usage/system-dashboards-launcher"

import "./styles.scss"

const UsageSettings = () => {
  return (
    <div className="settings__content__main system-settings">
      <header className="settings__content__header">
        <h1>Usage & Diagnostics</h1>
        <p>View current GPU and CPU performance.</p>
      </header>
      <div className="system-settings__row">
        <div className="system-settings__block system-settings__block--usage">
          <UsageMonitorWidget />
          <div className="system-settings__logs">
            <h4>View Logs</h4>
            <LogsLauncher />
          </div>
        </div>

        <div className="system-settings__block system-settings__block--system-dashboards">
          <h4>System Dashboards</h4>
          <SystemDashboardsLauncher />
        </div>
      </div>
    </div>
  )
}

export default UsageSettings
