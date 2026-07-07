// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import cx from "classnames"
import { noop } from "utils/helpers"

import { divider } from "../filter-component-options"
import FilterDropdownMenu from "./filter-dropdown-menu"

export default function FilterDropdownOption({
  selectedOption,
  option,
  classNames,
  onClick,
  testId
}) {
  const optionClasses = cx({
    "operator-item": true,
    selected: option.name === selectedOption,
    "parent-option": option.childOptions,
    [classNames]: classNames
  })

  if (option.name === divider.name) {
    return <div className={"operator-divider"} />
  }

  return (
    <div
      className={optionClasses}
      onClick={option.disabled ? noop : (e) => onClick(option.name, e)}
      data-testid={`${testId || "filter-component-option"}-${option.name}`}
    >
      {option.label}
      {option.childOptions && (
        <FilterDropdownMenu
          options={option.childOptions}
          onClickOption={onClick}
          selectedOption={selectedOption}
          classNames={"filter-operator-selector-submenu"}
        />
      )}
    </div>
  )
}

FilterDropdownOption.propTypes = {
  onClick: PropTypes.func,
  selectedOption: PropTypes.shape({
    name: PropTypes.string,
    disabled: PropTypes.bool
  }),
  option: PropTypes.shape({
    name: PropTypes.string,
    disabled: PropTypes.bool
  }),
  classNames: PropTypes.string
}
