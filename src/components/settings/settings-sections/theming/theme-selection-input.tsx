// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { MultiSelect } from "widgets/multi-select/Multi-select"
import { capitalizeFirstLetter } from "utils/time-helpers"

export const ThemeSelectionInput = ({
  title,
  description,
  uiTheme,
  availableThemes,
  onChange
}: {
  title: string
  description: string
  uiTheme: string
  availableThemes: string[]
  onChange: (theme: string) => void
}) => (
  <div className="theming-settings__list__item">
    <div className="theming-settings__list__item__info">
      <p className="theming-settings__list__item__label">{title}</p>
      <p className="theming-settings__list__item__description">{description}</p>
    </div>
    <div className="theming-settings__list__item__input">
      <MultiSelect
        placeholder="UI Theme"
        value={{
          label: `${capitalizeFirstLetter(uiTheme)}`,
          value: uiTheme
        }}
        options={availableThemes.map((name) => ({
          label: `${capitalizeFirstLetter(name)}`,
          value: name
        }))}
        onChange={(option) => onChange(option.value)}
        className="theming-settings__list__item__input--ui-theme"
      />
    </div>
  </div>
)
