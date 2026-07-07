// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { Redirect } from "react-router-dom"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
const { ENABLE_CONTROL_PANEL_2 } = available_feature_flags
import SettingsNavList from "./settings-nav-list"
import SettingsContent from "./settings-content"
import { SettingsContext } from "./settings-context"

import "./styles.scss"

const SettingsPage = () => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  return getFeatureFlag(ENABLE_CONTROL_PANEL_2) ? (
    <SettingsContext.Provider
      value={{ hasUnsavedChanges, setHasUnsavedChanges }}
    >
      <div className="settings">
        <SettingsNavList />
        <SettingsContent />
      </div>
    </SettingsContext.Provider>
  ) : (
    <Redirect to={"/"} />
  )
}

export default SettingsPage
