// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import LauncherLink from "./launcher-link"

const SystemDashboardsLauncher = () => (
  <ul className="settings__system__launcher">
    <LauncherLink
      label="System Resources"
      url="/information_schema/dashboard/2"
    />
    <LauncherLink
      label="Request Logs and Monitoring"
      url="/information_schema/dashboard/4"
    />
    <LauncherLink
      label="User Roles and Permissions"
      url="/information_schema/dashboard/1"
    />
  </ul>
)

export default SystemDashboardsLauncher
