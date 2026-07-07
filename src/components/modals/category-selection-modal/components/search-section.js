// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { TextField } from "widgets/text-field/TextField"
import { CircularProgress } from "@rmwc/circular-progress"
import "@rmwc/circular-progress/circular-progress.css"
import PropTypes from "prop-types"

const SearchSection = (props) => {
  let trailingIcon = props.filterText.length
    ? {
        icon: "close",
        onClick: () => props.setFilter()
      }
    : null

  if (props.loading) {
    trailingIcon = <CircularProgress size="xsmall" />
  }

  return (
    <div className="csm-search-section">
      <TextField
        className="csm-search-input"
        icon="search"
        trailingIcon={trailingIcon}
        label="Search"
        onChange={(e) => props.setFilter(e.target.value)}
        autoFocus
      />
    </div>
  )
}

SearchSection.propTypes = {
  setFilter: PropTypes.func,
  filterText: PropTypes.string,
  loading: PropTypes.bool
}

export default SearchSection
