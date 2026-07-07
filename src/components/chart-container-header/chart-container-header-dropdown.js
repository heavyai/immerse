// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect, useCallback } from "react"
import PropTypes from "prop-types"
import { Icon } from "@rmwc/icon"
import { MenuSurfaceAnchor, Menu, MenuItem } from "@rmwc/menu"

const CLOSE_TIMEOUT = 200

export const ChartContainerHeaderDropdown = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [closeTimeout, setCloseTimeout] = useState()

  const delayClose = () => {
    if (!closeTimeout) {
      const timeoutId = setTimeout(() => {
        if (isOpen) {
          setIsOpen(false)
          setCloseTimeout(null)
        }
      }, CLOSE_TIMEOUT)
      setCloseTimeout(timeoutId)
    }
  }

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeout) {
      clearTimeout(closeTimeout)
      setCloseTimeout(null)
    }
  }, [closeTimeout])

  useEffect(() => {
    return clearCloseTimeout
  }, [clearCloseTimeout])

  const toggle = () => setIsOpen((prev) => !prev)

  return (
    <div
      className="chart-button chart-dropdown-button"
      onClick={toggle}
      onMouseEnter={clearCloseTimeout}
      onMouseLeave={delayClose}
    >
      <MenuSurfaceAnchor>
        <Menu
          open={isOpen}
          onClose={() => setIsOpen(false)}
          onMouseLeave={delayClose}
          focusOnOpen={false}
        >
          {items.map((item) => (
            <MenuItem
              key={item.key}
              className="compact"
              onClick={item.onClick}
              title={item.tooltip || item.title}
              disabled={item.disabled}
            >
              {item.icon}
              <div className="list-item-title">{item.title}</div>
            </MenuItem>
          ))}
        </Menu>
        <Icon icon="more_vert" />
      </MenuSurfaceAnchor>
    </div>
  )
}

ChartContainerHeaderDropdown.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      icon: PropTypes.element.isRequired,
      title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
      tooltip: PropTypes.string,
      onClick: PropTypes.func
    })
  ).isRequired
}
