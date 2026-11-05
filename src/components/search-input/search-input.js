// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import Icon from "components/icon/icon"

SearchInput.propTypes = {
  clearSearch: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  searchVal: PropTypes.string.isRequired
}

export function SearchInput({ onSearch, searchVal, clearSearch, placeholder }) {
  return (
    <div className="search-input-comp">
      <Icon name="search" />
      <input
        data-testid={"dashboard-search-bar-field"}
        className="dashboard-search-bar-field"
        onChange={onSearch}
        placeholder={placeholder}
        value={searchVal}
      />
      {searchVal.length > 0 && (
        <button
          className="dashboard-search-bar-clear button icon-btn clear-search"
          onClick={clearSearch}
        >
          <Icon name="x" />
        </button>
      )}
    </div>
  )
}

function useSearchInputProps(incomingProps) {
  let viewProps = incomingProps
  viewProps = (({ updateSearchVal, ...rest }) => ({
    onSearch: (e) => {
      updateSearchVal(e.target.value)
    },
    clearSearch: () => {
      updateSearchVal("")
    },
    ...rest
  }))(viewProps)
  return viewProps
}

function StatefulSearchInput(incomingProps) {
  const viewProps = useSearchInputProps(incomingProps)
  return React.createElement(SearchInput, viewProps)
}

export default StatefulSearchInput
