// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import cx from "classnames"
import pure from "recompose/pure"
import SearchTermHighlight from "components/search-term-highlight/search-term-highlight"
import { tableShape } from "constants/prop-types"
import { ParameterTypes } from "components/parameters/parameters-types"
import IconJoinLeft from "components/svg-icons/icon-join-left"

const tableInSearch = (searchVal) => ({ name }) =>
  searchVal === "" || name.toLowerCase().includes(searchVal.toLowerCase())

const sortByName = (a, b) => {
  const nameA = a.name.toUpperCase()
  const nameB = b.name.toUpperCase()
  if (nameA < nameB) {
    return -1
  } else if (nameA > nameB) {
    return 1
  }
  return 0
}

TablesList.propTypes = {
  gotoTableImporter: PropTypes.func,
  id: PropTypes.string,
  list: PropTypes.arrayOf(tableShape).isRequired,
  determineIfSelected: PropTypes.func.isRequired,
  searchVal: PropTypes.string.isRequired,
  selectPreviewTable: PropTypes.func.isRequired,
  canCreateTable: PropTypes.bool.isRequired
}

export function TablesList({
  list,
  searchVal,
  gotoTableImporter,
  determineIfSelected = () => false,
  selectPreviewTable = () => {
    /* do nothing */
  },
  canCreateTable
}) {
  const displayList = list.filter(tableInSearch(searchVal)).sort(sortByName)

  if (displayList.length) {
    return (
      <div className="table-list" id="table-list" data-testid="table-list">
        {displayList.map(({ name, dataSource, type }, index) => (
          <div
            className={cx("table-row", {
              selected: determineIfSelected(name, index)
            })}
            id={`table-list-${index}`}
            data-testid={`table-row-${name}`}
            key={name}
            onClick={(e) => {
              e.preventDefault()
              selectPreviewTable(dataSource || name, index)
            }}
          >
            <SearchTermHighlight name={name} term={searchVal} />
            {type === ParameterTypes.JOIN && (
              <div className="table-type-icon">
                <IconJoinLeft />
              </div>
            )}
          </div>
        ))}
      </div>
    )
  } else if (searchVal.length) {
    return <div className="no-results">{`No results for “${searchVal}”`}</div>
  } else if (canCreateTable && gotoTableImporter) {
    return (
      <div className="import-table-cta" onClick={gotoTableImporter}>
        <span>{"+"}</span>
        <span>{"Import Table"}</span>
      </div>
    )
  } else {
    return <div className="no-results">No Tables</div>
  }
}

export default pure(TablesList)
