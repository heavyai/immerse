// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FormEvent } from "react"

import { Switch } from "widgets/switch/Switch"

export const EnableCustomTheme = ({
  title,
  description,
  enabled,
  onChange
}: {
  title: string
  description: string
  enabled: boolean
  onChange: (checked: boolean) => void
}) => (
  <div className="theming-settings__list__item">
    <div className="theming-settings__list__item__info">
      <p className="theming-settings__list__item__label">{title}</p>
      <p className="theming-settings__list__item__description">{description}</p>
    </div>
    <div className="theming-settings__list__item__input">
      <Switch
        checked={enabled}
        onChange={(e: FormEvent<HTMLInputElement>) =>
          onChange(e.currentTarget.checked)
        }
      />
    </div>
  </div>
)
