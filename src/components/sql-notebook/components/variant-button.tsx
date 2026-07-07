// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { MenuSurface, MenuSurfaceAnchor } from "@rmwc/menu"
import { Icon } from "@rmwc/icon"
import cx from "classnames"
import { Button, BUTTON_TYPES, ButtonProps } from "./button"
import { ToggleMenu, ToggleMenuOption } from "./toggle-menu"

import "./variant-button.scss"

export const VariantButton = ({
  options,
  disabled,
  onSelectOption,
  selectedOption,
  menuHeader,
  primaryButtonProps = {},
  buttonType = BUTTON_TYPES.SECONDARY
}: {
  options: ToggleMenuOption[]
  disabled: boolean
  onSelectOption: (option: string) => void
  selectedOption: string
  primaryButtonProps?: ButtonProps
  buttonType?: BUTTON_TYPES
  menuHeader?: string
}) => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="variant-button">
      <Button
        {...primaryButtonProps}
        type={buttonType}
        disabled={disabled}
        className={cx(
          "variant-button__primary-button",
          primaryButtonProps.className
        )}
      />
      <MenuSurfaceAnchor>
        <MenuSurface
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          anchorCorner="topStart"
        >
          <ToggleMenu
            options={options}
            selectedOptions={[selectedOption]}
            onSelectOption={(option) => {
              onSelectOption(option)
              setMenuOpen(false)
            }}
            header={menuHeader}
          />
        </MenuSurface>
        <Button
          type={buttonType}
          onClick={() => {
            setMenuOpen(true)
          }}
          className={cx("variant-button__menu-anchor", {
            "variant-button__menu-anchor--open": menuOpen
          })}
          icon={<Icon icon="expand_more" />}
          disabled={disabled}
        />
      </MenuSurfaceAnchor>
    </div>
  )
}
