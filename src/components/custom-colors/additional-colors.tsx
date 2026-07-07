// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import "./additional-colors.scss"

const AdditionalColorsSwatch = ({ hex }: { hex: string }) => (
  <div className="additional-colors__swatch" style={{ background: hex }} />
)

export const AdditionalColors = ({ colors }: { colors: string[] }) => {
  return (
    <div className="additional-colors__container">
      <div className="chart-editor-label">Additional Colors</div>
      <div className="additional-colors__swatch-wrapper">
        {colors.map((c: string, i: number) => (
          <AdditionalColorsSwatch key={i} hex={c} />
        ))}
      </div>
    </div>
  )
}
