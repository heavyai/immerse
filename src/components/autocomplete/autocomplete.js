// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import AutocompleteDropdown from "components/autocomplete/autocomplete-dropdown"
import AutocompleteInput from "components/autocomplete/autocomplete-input"
import cx from "classnames"
import Popover from "components/popover/popover"

const Autocomplete = (props) => (
  <div
    className={cx(`autocomplete popout-style ${props.className}`, {
      open: props.isOpen
    })}
    data-testid={props.testid}
  >
    <Popover
      isOpened
      onClose={props.onClickOutside}
      onKeyDown={props.onKeyDown}
    >
      <div className="autocomplete-inner-wrapper">
        <AutocompleteInput
          inputOnBlur={props.inputOnBlur}
          inputOnChange={props.inputOnChange}
          inputOnClear={props.inputOnClear}
          inputOnClick={props.inputOnClick}
          inputOnFocus={props.inputOnFocus}
          inputState={props.inputState}
          inputValue={props.inputValue}
          placeholder={props.placeholder}
          resetInputState={props.resetInputState}
        />
        {props.isOpen &&
          (props.matchingOptions.length || props.showEmptyState) && (
            <AutocompleteDropdown
              mouseMove={props.mouseMove}
              highlightIndex={props.highlightIndex}
              forceIntoViewIndex={props.forceIntoViewIndex}
              optionClick={props.optionClick}
              optionEnter={props.optionEnter}
              optionLeave={props.optionLeave}
              options={props.matchingOptions}
              renderOption={props.renderOption}
              selectedOption={props.selectedOption}
              showEmptyState={props.showEmptyState}
            />
          )}
      </div>
    </Popover>
  </div>
)

Autocomplete.propTypes = {
  className: PropTypes.string,
  highlightIndex: PropTypes.number,
  inputOnBlur: PropTypes.func.isRequired,
  inputOnChange: PropTypes.func.isRequired,
  inputOnClear: PropTypes.func.isRequired,
  inputOnClick: PropTypes.func.isRequired,
  inputOnFocus: PropTypes.func.isRequired,
  inputState: PropTypes.string,
  inputValue: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  matchingOptions: PropTypes.arrayOf(
    PropTypes.shape({
      meta: PropTypes.string || PropTypes.bool,
      value: PropTypes.string.isRequired || PropTypes.bool.isRequired
    })
  ).isRequired,
  onClickOutside: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  optionClick: PropTypes.func.isRequired,
  optionEnter: PropTypes.func.isRequired,
  optionLeave: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  renderOption: PropTypes.func,
  resetInputState: PropTypes.func,
  selectedOption: PropTypes.shape({
    value: PropTypes.string.isRequired || PropTypes.bool.isRequired
  }),
  showEmptyState: PropTypes.bool,
  testid: PropTypes.string.isRequired
}

export default Autocomplete
