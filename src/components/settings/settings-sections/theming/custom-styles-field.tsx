// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, FormEvent } from "react"
import { TextField } from "widgets/text-field/TextField"
import { Switch } from "widgets/switch/Switch"

interface ICustomStylesField {
  prop: string
  name: string
  description: string
  type: string
  value: string | boolean
  singleLine?: boolean
  onUpdate: (key: string, val: string | boolean) => void
}

export enum FieldType {
  STRING = "STRING",
  BOOLEAN = "BOOLEAN"
}

export const CustomStylesField: FC<ICustomStylesField> = ({
  prop,
  name,
  description,
  type,
  value,
  onUpdate,
  singleLine = false
}) => {
  const [currentValue, setCurrentValue] = useState(value)

  const handleSwitchUpdate = (val: boolean): void => {
    setCurrentValue(val)
    onUpdate(prop, val)
  }

  return (
    <li key={name} className="theming-settings__list__item">
      <div className="theming-settings__list__item__info">
        <p className="theming-settings__list__item__label">{name}</p>
        <p className="theming-settings__list__item__description">
          {description}
        </p>
      </div>

      <div className="theming-settings__list__item__input">
        {type === FieldType.STRING ? (
          <TextField
            label={name}
            value={currentValue as string}
            onChange={(e: FormEvent<HTMLInputElement>) => {
              setCurrentValue(e.target.value)
              onUpdate(prop, e.target.value)
            }}
            textarea={!singleLine}
          />
        ) : (
          <Switch
            checked={currentValue as boolean}
            onChange={(e: FormEvent<HTMLInputElement>) =>
              handleSwitchUpdate(e.currentTarget.checked)
            }
          />
        )}
      </div>
    </li>
  )
}
