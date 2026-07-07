// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { Menu, MenuItem, MenuSurfaceAnchor } from "@rmwc/menu"
import { Icon } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"
import { MenuOption } from "./parameter-widget-types"

type Props = {
  menuOptions: MenuOption[]
  menuOpen: boolean
  closeMenu: () => void
  showMenu: () => void
  toggleMenu: () => void
}

const ParameterWidgetMenu = ({
  menuOptions,
  menuOpen,
  closeMenu,
  showMenu,
  toggleMenu
}: Props) => {
  return (
    <MenuSurfaceAnchor>
      <Menu
        open={menuOpen}
        onSelect={closeMenu}
        onClose={closeMenu}
        hoistToBody
        className="parameter-widget__menu"
        anchorCorner={"topRight"}
      >
        {menuOptions.map(
          ({ label, handler, testId, icon, tooltip, disabled }, i: number) => {
            const menuItem = (
              <MenuItem
                className="extra-compact"
                onClick={
                  disabled
                    ? (e) => {
                        e.stopPropagation()
                      }
                    : handler
                }
                data-testid={testId}
                key={i}
                disabled={disabled}
              >
                <div>{icon}</div>
                {label}
              </MenuItem>
            )

            if (tooltip) {
              return (
                <Tooltip
                  key={`${testId}-${i}`}
                  content={tooltip}
                  enterDelay={500}
                >
                  <div>{menuItem}</div>
                </Tooltip>
              )
            }
            return menuItem
          }
        )}
      </Menu>
      {showMenu && <Icon icon="more_vert" onClick={toggleMenu} />}
    </MenuSurfaceAnchor>
  )
}

export default ParameterWidgetMenu
