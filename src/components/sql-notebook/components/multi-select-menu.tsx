// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { ToggleMenu, ToggleMenuOption } from "./toggle-menu"

import { MenuSurface, MenuSurfaceAnchor } from "@rmwc/menu"
import cx from "classnames"
import { IconDoubleChevron } from "components/svg-icons/icon-double-chevron"

import "./multi-select-menu.scss"
import { Icon } from "@rmwc/icon"
import { TooltipIfContent } from "components/tooltip-if-content/tooltip-if-content"

export const MultiSelectDropdown = ({
  options,
  selectedOptions,
  onSelectOption,
  hasSelectedOptions = () => selectedOptions?.length > 0,
  onClear,
  header,
  tooltip,
  multi = true
}: {
  options: ToggleMenuOption[]
  selectedOptions: Array<string>
  onSelectOption: (optionValue: string) => void
  hasSelectedOptions?: () => boolean
  onClear?: () => void
  header?: string
  tooltip?: string | null
  multi: boolean
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const firstSelectedItem = options.find((o) => o.value === selectedOptions[0])
    ?.label

  const handleSelectOption = (option: string) => {
    onSelectOption(option)
    if (!multi) {
      setMenuOpen(false)
    }
  }

  return (
    <div className="toggle-menu-multi-select">
      <MenuSurfaceAnchor>
        <MenuSurface
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          anchorCorner="topStart"
          hoistToBody
          className="multi-select__menu-surface"
        >
          <ToggleMenu
            options={options}
            selectedOptions={selectedOptions}
            onSelectOption={handleSelectOption}
            header={header}
          />
        </MenuSurface>
        <div
          onClick={() => {
            setMenuOpen(true)
          }}
          className={cx("multi-select__menu-anchor", {
            "multi-select__menu-anchor--open": menuOpen,
            "has-selected-options": hasSelectedOptions()
          })}
        >
          <TooltipIfContent content={tooltip} enterDelay={850}>
            <div>
              {selectedOptions.length > 1 ? (
                <span>
                  {firstSelectedItem}
                  <strong>{` +${selectedOptions.length - 1}`}</strong>
                </span>
              ) : (
                firstSelectedItem
              )}
            </div>
          </TooltipIfContent>
          {hasSelectedOptions() && multi && onClear ? (
            <div
              className="clear-option"
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
            >
              <Icon icon={{ icon: "close", size: "xsmall" }} />
            </div>
          ) : (
            <IconDoubleChevron />
          )}
        </div>
      </MenuSurfaceAnchor>
    </div>
  )
}
