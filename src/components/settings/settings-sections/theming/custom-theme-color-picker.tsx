// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import ColorPicker from "components/ui-config-panel/ColorPaletteSection/ColorPicker"

export const CustomThemeColorPicker = ({
  title,
  description,
  color,
  onChange
}: {
  title: string
  description: string
  color: string
  onChange: (color: any) => void
}) => (
  <div className="theming-settings__list__item">
    <div className="theming-settings__list__item__info">
      <p className="theming-settings__list__item__label">{title}</p>
      <p className="theming-settings__list__item__description">{description}</p>
    </div>
    <div className="theming-settings__color-picker">
      <ColorPicker
        canDeleteColor={false}
        color={color}
        onChange={onChange}
        hideDeleteColor
      />
    </div>
  </div>
)
