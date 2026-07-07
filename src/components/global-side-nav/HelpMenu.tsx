// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { MenuItem } from "@rmwc/menu"

import { DropdownLink } from "components/navigation-bar/navigation-bar-container"

import "./HelpMenu.scss"

const HelpMenu = ({
  toggleIsOpen,
  helpLinks
}: {
  toggleIsOpen: () => void
  helpLinks: DropdownLink[]
}) => (
  <div className="global-side-nav__help__menu">
    {helpLinks.map(
      (link) =>
        (typeof link.condition === "undefined" || link.condition) && (
          <MenuItem
            key={link.id}
            id={link.id}
            data-testid={`${link.id}-dropdown-link`}
            onClick={(e) => {
              link.onClick(e)
              toggleIsOpen()
            }}
          >
            {link.icon && <div className="key-icon">{link.icon}</div>}
            {link.text}
          </MenuItem>
        )
    )}
  </div>
)

export default HelpMenu
