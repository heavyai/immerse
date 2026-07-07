// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useRef } from "react"
import PropTypes from "prop-types"
import cx from "classnames"

const AutocompleteDropdownItem = ({
  datum,
  index,
  isHighlight,
  isSelected,
  forceIntoView = false,
  optionClick,
  optionEnter,
  optionLeave,
  renderOption
}) => {
  const itemRef = useRef()

  if (forceIntoView) {
    const itemEl = itemRef.current ?? {}
    const top =
      itemEl.offsetTop -
      (itemEl.offsetParent ? itemEl.offsetParent.scrollTop : 0)
    const { height } = itemEl.getBoundingClientRect?.() ?? {}
    const parentHeight = itemEl.offsetParent
      ? itemEl.offsetParent.getBoundingClientRect?.()?.height
      : 0
    if (top < 0 || top > parentHeight - height) {
      itemEl.scrollIntoView(false)
    }
  }

  const onClick = () => {
    optionClick(datum)
  }

  const onMouseEnter = () => {
    optionEnter(index)
  }

  const onMouseLeave = () => {
    optionLeave(index)
  }

  return (
    <div
      className={cx("autocomplete-dropdown-item", {
        highlight: isHighlight,
        selected: isSelected
      })}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      ref={itemRef}
      data-testid="autocomplete-dropdown-item"
    >
      {renderOption ? (
        renderOption(datum)
      ) : (
        <div className="autocomplete-dropdown-item-content">
          <div className="value">{datum.label}</div>
          {datum.meta && <div className="meta">{datum.meta}</div>}
        </div>
      )}
    </div>
  )
}

AutocompleteDropdownItem.propTypes = {
  datum: PropTypes.shape({
    meta: PropTypes.string || PropTypes.bool,
    value: PropTypes.string.isRequired || PropTypes.bool.isRequired
  }).isRequired,
  index: PropTypes.number.isRequired,
  isHighlight: PropTypes.bool,
  isSelected: PropTypes.bool,
  forceIntoView: PropTypes.bool,
  optionClick: PropTypes.func,
  optionEnter: PropTypes.func,
  optionLeave: PropTypes.func,
  renderOption: PropTypes.func
}

export default AutocompleteDropdownItem
