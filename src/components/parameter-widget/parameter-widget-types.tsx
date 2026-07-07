// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ParameterType } from "components/parameters/parameters-types"
import { ReactElement } from "react"

export type ParameterData = {
  name: string
  value: string
  desc?: string
  type?: ParameterType
  linked: boolean
  resetValue: string
  isInUse: boolean
  source?: string
  column?: string
  min?: string
  max?: string
}

export type CommonInputProps = {
  value: string
  setValue: (value: string) => void
  showReset: boolean
  resetToDefaultValue: () => void
  disabled: boolean
}

export type MenuOption = {
  label: string
  handler: () => void
  icon: ReactElement
  testId: string
  disabled?: boolean
  tooltip?: string
}
