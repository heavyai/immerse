// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import serverUrl from "constants/app-config"
import LauncherLink from "./launcher-link"

const LogsLauncher = () => {
  return (
    <ul className="settings__system__launcher">
      <LauncherLink url={`${serverUrl.url}/logs/info`} label="Info logs" />
      <LauncherLink
        url={`${serverUrl.url}/logs/warning`}
        label="Warning logs"
      />
      <LauncherLink url={`${serverUrl.url}/logs/error`} label="Error logs" />
      <LauncherLink url={`${serverUrl.url}/logs/all`} label="All logs" />
    </ul>
  )
}

export default LogsLauncher
