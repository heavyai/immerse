// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import cx from "classnames"
import { Icon } from "@rmwc/icon"

import "./toggle-menu.scss"

export type ToggleMenuOption = { label: string; value: string }

export const ToggleMenu = ({
  options,
  selectedOptions,
  onSelectOption,
  header
}: {
  options: ToggleMenuOption[]
  selectedOptions: Array<string>
  onSelectOption: (optionValue: string) => void
  header?: string
}) => {
  return (
    <div className="toggle-menu">
      {header && <h6>{header}</h6>}
      <ul>
        {options.map((option) => {
          const isSelectedOption = selectedOptions.includes(option.value)
          return (
            <li
              key={option.value}
              className={cx("toggle-menu__option", {
                "toggle-menu__option--selected": isSelectedOption
              })}
              onClick={() => onSelectOption(option.value)}
            >
              <Icon
                icon="check"
                className={cx("toggle-menu__selected-icon", {
                  "toggle-menu__selected-icon--selected": isSelectedOption
                })}
              />
              <span>{option.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
