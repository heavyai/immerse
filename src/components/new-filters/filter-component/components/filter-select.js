// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from "react"
import PropTypes from "prop-types"
import FilterDropdownMenu from "./filter-dropdown-menu"

export default function FilterSelect({
  selectedOption,
  onMenuSelect,
  testId,
  options,
  menuIsOpen,
  openMenu,
  closeMenu,
  menuIsDisabled
}) {
  const containerRef = React.useRef()

  const handleClickOut = (e) => {
    const node = containerRef
    if (
      menuIsOpen &&
      !(node && node.current && node.current.contains(e.target))
    ) {
      closeMenu()
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOut)

    return () => {
      document.removeEventListener("mousedown", handleClickOut)
    }
  })

  const onClickOption = (optionName, e) => {
    e.stopPropagation()
    onMenuSelect(optionName)
    closeMenu()
  }

  const onClickMenu = () => {
    if (menuIsOpen) {
      closeMenu()
    } else {
      openMenu()
    }
  }

  const dropdownMenuClass = () => {
    if (menuIsDisabled) {
      return "spacer"
    } else if (menuIsOpen) {
      return "arrow opened"
    } else {
      return "arrow closed"
    }
  }

  return (
    <div
      className="operator"
      data-testid={testId || "filter-component-dropdown-menu"}
      onClick={onClickMenu}
      ref={containerRef}
    >
      <div className={"operator-label"}>{selectedOption.label}</div>
      <div className={dropdownMenuClass()} />
      {menuIsOpen && (
        <FilterDropdownMenu
          selectedOption={selectedOption}
          // submenu options need to live in our list of valid options, but render them separately
          options={options.filter((option) => !option.isChildOption)}
          testId={testId}
          classNames={"operator-menu"}
          onClickOption={onClickOption}
        />
      )}
    </div>
  )
}

FilterSelect.propTypes = {
  label: PropTypes.string,
  testId: PropTypes.string,
  onMenuSelect: PropTypes.func,
  openMenu: PropTypes.func,
  closeMenu: PropTypes.func,
  selectedOption: PropTypes.shape({
    name: PropTypes.string,
    disabled: PropTypes.bool
  }),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      isChildOption: PropTypes.bool
    })
  ),
  menuIsOpen: PropTypes.bool,
  menuIsDisabled: PropTypes.bool
}

FilterSelect.defaultProps = {
  options: [],
  selectedOption: {}
}
