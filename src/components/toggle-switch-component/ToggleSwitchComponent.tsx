// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { Switch } from "widgets/switch/Switch"
import "./styles.scss"

type Props = {
  configurationEnabled: boolean
  disabled?: boolean
  disabledReason?: string
  onToggleConfigurationEnabled: () => void
  label: string
  "data-testid": string
}

const ToggleSwitchComponent: FC<Props> = ({
  configurationEnabled,
  disabled,
  disabledReason,
  onToggleConfigurationEnabled,
  label,
  "data-testid": dataTestId = "toggle-switch-component"
}) => (
  <div
    className="toggle-switch"
    data-testid={dataTestId}
    title={disabledReason}
  >
    <div className="chart-editor-label">{label}</div>
    <Switch
      checked={configurationEnabled}
      disabled={disabled}
      onChange={onToggleConfigurationEnabled}
    />
  </div>
)

export default ToggleSwitchComponent
