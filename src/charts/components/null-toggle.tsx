// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import Toggle from "react-toggle"

type NullToggleProps = {
  checked: boolean
  onChange: () => void
  label?: string
  id?: string
}

export default function NullToggle({
  checked,
  onChange,
  label = "Null Dimensions",
  id = "null-dimension-toggle"
}: NullToggleProps) {
  return (
    <div className="chart-editor-section">
      <div className="chart-editor-label">{label}</div>
      <Toggle checked={checked} id={id} onChange={onChange} />
    </div>
  )
}
