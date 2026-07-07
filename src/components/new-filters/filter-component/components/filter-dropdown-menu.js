// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import FilterDropdownOption from "./filter-dropdown-option"

export default function FilterDropdownMenu({
  options,
  testId,
  classNames,
  selectedOption,
  onClickOption
}) {
  return (
    <div className={classNames} data-testid={`${testId}-open`}>
      {options.map((option, i) => (
        <FilterDropdownOption
          key={i}
          option={option}
          onClick={onClickOption}
          selectedOption={selectedOption}
          testId={testId}
        />
      ))}
    </div>
  )
}

FilterDropdownMenu.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      disabled: PropTypes.bool
    })
  ),
  testId: PropTypes.string,
  classNames: PropTypes.string,
  onClickOption: PropTypes.func,
  selectedOption: PropTypes.shape({
    name: PropTypes.string,
    disabled: PropTypes.bool
  })
}
