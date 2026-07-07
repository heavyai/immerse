// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import AutocompleteDropdownItem from "components/autocomplete/autocomplete-dropdown-item"

AutocompleteDropdown.propTypes = {
  highlightIndex: PropTypes.number,
  forceIntoViewIndex: PropTypes.number,
  mouseMove: PropTypes.func,
  optionClick: PropTypes.func,
  optionEnter: PropTypes.func,
  optionLeave: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      meta: PropTypes.string || PropTypes.bool,
      value: PropTypes.string.isRequired || PropTypes.bool.isRequired
    })
  ).isRequired,
  renderOption: PropTypes.func,
  selectedOption: PropTypes.shape({
    value: PropTypes.string.isRequired || PropTypes.bool.isRequired
  }),
  showEmptyState: PropTypes.bool
}

export default function AutocompleteDropdown(props) {
  return (
    <div className="autocomplete-dropdown" data-testid="autocomplete-dropdown">
      <div
        className="autocomplete-dropdown-list"
        data-testid="autocomplete-dropdown-list"
        onMouseMove={props.mouseMove}
      >
        {props.options.map((d, i) => (
          <AutocompleteDropdownItem
            datum={d}
            index={i}
            isHighlight={props.highlightIndex === i}
            isSelected={props.selectedOption.value === d.value}
            forceIntoView={props.forceIntoViewIndex === i}
            key={i}
            optionClick={props.optionClick}
            optionEnter={props.optionEnter}
            optionLeave={props.optionLeave}
            renderOption={props.renderOption}
          />
        ))}
        {props.showEmptyState && (
          <div className="autocomplete-empty-state">
            {"No Matching Results"}
          </div>
        )}
      </div>
    </div>
  )
}
