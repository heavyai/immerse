// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import IconBeta from "components/svg-icons/icon-beta"

import "./styles.scss"

const headerText = "CONTROL PANEL"

const SettingsHeader = () => {
  return (
    <div className="settings-header-wrapper">
      <span className="settings-header-text">{headerText}</span>
      <span className="settings-header-icon">
        <IconBeta />
      </span>
    </div>
  )
}

export default SettingsHeader
