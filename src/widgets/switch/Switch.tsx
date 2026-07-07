// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from "react"
import { Switch as RMWCSwitch } from "@rmwc/switch"

import "./switch.scss"

/**
 * Switch properties.
 */
export interface ISwitchProps {
  /** Disables the control. */
  disabled?: boolean
  /** Toggle the control on and off. */
  checked?: boolean
  /** When the toggle changes */
  onChange?: any
  className?: string
}

/**
 * Switch
 */
export const Switch = (props: ISwitchProps) => <RMWCSwitch {...props} />

export default Switch
