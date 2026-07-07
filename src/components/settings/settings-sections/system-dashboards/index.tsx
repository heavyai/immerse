// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import LinkCardGrid from "components/settings/link-card-grid"
import IconGauge from "components/svg-icons/icon-gauge"
import IconArrowTarget from "components/svg-icons/icon-arrow-target"
import IconPeople from "components/svg-icons/icon-people"
import { SYSTEM_DASHBOARD_DESCRIPTIONS } from "constants/text"

const SYSTEM_DASHBOARD_LINKS_META = [
  {
    label: "System Resources",
    url: `/information_schema/system-dashboards/${encodeURIComponent(
      "System Resources"
    )}`,
    icon: <IconGauge />,
    description: SYSTEM_DASHBOARD_DESCRIPTIONS.systemResources
  },
  {
    label: "Request Logs and Monitoring",
    url: `/information_schema/system-dashboards/${encodeURIComponent(
      "Request Logs and Monitoring"
    )}`,
    icon: <IconArrowTarget />,
    description: SYSTEM_DASHBOARD_DESCRIPTIONS.requestLogs
  },
  {
    label: "User Roles and Permissions",
    url: `/information_schema/system-dashboards/${encodeURIComponent(
      "User Roles and Permissions"
    )}`,
    icon: <IconPeople />,
    description: SYSTEM_DASHBOARD_DESCRIPTIONS.rolesPermissions
  }
]

const SystemDashboards = () => (
  <div>
    <header className="settings__content__header">
      <h1>System Dashboards</h1>
      <p>{SYSTEM_DASHBOARD_DESCRIPTIONS.heading}</p>
    </header>
    <LinkCardGrid
      linkMeta={SYSTEM_DASHBOARD_LINKS_META.map((meta) => ({
        ...meta,
        linkText: "View Dashboard"
      }))}
    />
  </div>
)

export default SystemDashboards
