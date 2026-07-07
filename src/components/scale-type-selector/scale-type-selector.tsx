// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import CustomSelector from "components/custom-selector/custom-selector"
import { SCALE_TYPES, ScaleType } from "constants/scale-types"

export const ScaleTypeSelector: React.FC = ({
  currentScale = SCALE_TYPES.LINEAR,
  disabled = false,
  onChange
}: {
  currentScale: ScaleType
  disabled: boolean
  onChange: (s: ScaleType) => void
}) => {
  const scaleTypeOptions = [
    {
      label: "Linear",
      value: SCALE_TYPES.LINEAR
    },
    {
      label: "Logarithmic",
      value: SCALE_TYPES.LOG
    }
  ]
  return (
    <CustomSelector
      currentValue={currentScale}
      id="scale-type-selector"
      onChange={onChange}
      options={scaleTypeOptions}
      disabled={disabled}
    />
  )
}
