// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"

export default function FilterAutosuggestDropdown({
  onMouseDown,
  autosuggestResults
}) {
  return (
    <div className={"autosuggest-dropdown"}>
      <ul>
        {autosuggestResults.map((option, i) => (
          <li
            key={i}
            onMouseDown={() => onMouseDown(option.col)}
            className="autosuggest-item"
            data-testid={"autosuggest-item"}
          >
            <span className="autosuggest-item-name">{String(option.col)}</span>
            <span className="autosuggest-item-count">{option.num}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

FilterAutosuggestDropdown.propTypes = {
  onMouseDown: PropTypes.func,
  autosuggestResults: PropTypes.arrayOf(
    PropTypes.shape({
      col: PropTypes.string,
      num: PropTypes.number
    })
  )
}
