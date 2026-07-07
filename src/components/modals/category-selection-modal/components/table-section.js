// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"

import {
  DataTable,
  DataTableContent,
  DataTableHead,
  DataTableRow,
  DataTableHeadCell,
  DataTableBody,
  DataTableCell
} from "@rmwc/data-table"

import { Checkbox } from "@rmwc/checkbox"

const MAX_INITIAL_ROWS = 100

class TableSection extends React.PureComponent {
  static propTypes = {
    categories: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        label: PropTypes.string,
        num: PropTypes.number
      })
    ),
    selectedCategoryValues: PropTypes.arrayOf(PropTypes.string),
    selectAllCategories: PropTypes.func,
    deselectAllCategories: PropTypes.func,
    toggleCategory: PropTypes.func
  }
  constructor(props) {
    super(props)
    this.state = {
      sortColumn: "count",
      sortDir: -1,
      numRowsToDisplay: MAX_INITIAL_ROWS
    }
    this.tableRef = React.createRef()
  }
  componentDidMount = () => {
    this.tableRef.current.addEventListener("scroll", (e) => {
      const element = e.srcElement
      const scrolledToBottom =
        element.scrollHeight - element.scrollTop === element.clientHeight
      if (scrolledToBottom) {
        this.setState({
          ...this.state,
          numRowsToDisplay: this.state.numRowsToDisplay + MAX_INITIAL_ROWS
        })
      }
    })
  }
  setSort = (sortColumn, sortDir) => {
    this.setState({
      sortColumn,
      sortDir
    })
  }
  render() {
    const { sortColumn, sortDir } = this.state
    const sortBySelected = sortColumn === "selected"
    const sortByName = sortColumn === "name"
    const sortByCount = sortColumn === "count"
    const sortedData = [...this.props.categories]

    if (sortBySelected) {
      sortedData.sort((a, b) => {
        if (sortDir === 1) {
          return (
            this.props.selectedCategoryValues.includes(b.id) -
            this.props.selectedCategoryValues.includes(a.id)
          )
        } else if (sortDir === -1) {
          return (
            this.props.selectedCategoryValues.includes(a.id) -
            this.props.selectedCategoryValues.includes(b.id)
          )
        }
        return 0
      })
    } else if (sortByName) {
      sortedData.sort((a, b) => {
        if (a.label.toLowerCase() < b.label.toLowerCase()) {
          return sortDir === 1 ? -1 : 1
        } else if (a.label.toLowerCase() > b.label.toLowerCase()) {
          return sortDir === 1 ? 1 : -1
        }
        return 0
      })
    } else if (sortByCount) {
      sortedData.sort((a, b) => {
        if (a.num < b.num) {
          return sortDir === 1 ? -1 : 1
        } else if (a.num > b.num) {
          return sortDir === 1 ? 1 : -1
        }
        return 0
      })
    }

    const displayData =
      sortedData.length > this.state.numRowsToDisplay
        ? sortedData.splice(0, this.state.numRowsToDisplay)
        : sortedData

    return (
      <div className="csm-table-section">
        <div className="csm-table-select-all-none">
          Select: <a onClick={this.props.selectAllCategories}>All</a>
          {" | "}
          <a onClick={this.props.deselectAllCategories}>None</a>
        </div>
        <DataTable className="csm-table" stickyRows={1} ref={this.tableRef}>
          <DataTableContent>
            <DataTableHead>
              <DataTableRow>
                <DataTableHeadCell
                  sort={sortBySelected ? sortDir : null}
                  onSortChange={(dir) => {
                    this.setSort("selected", dir)
                  }}
                >
                  Selected
                </DataTableHeadCell>
                <DataTableHeadCell
                  sort={sortByName ? sortDir : null}
                  onSortChange={(dir) => {
                    this.setSort("name", dir)
                  }}
                >
                  Name
                </DataTableHeadCell>
                <DataTableHeadCell
                  sort={sortByCount ? sortDir : null}
                  onSortChange={(dir) => {
                    this.setSort("count", dir)
                  }}
                >
                  Count
                </DataTableHeadCell>
              </DataTableRow>
            </DataTableHead>
            <DataTableBody>
              {displayData.map((category) => (
                <DataTableRow
                  onClick={() =>
                    this.props.toggleCategory(
                      category.id,
                      !this.props.selectedCategoryValues.includes(category.id)
                    )
                  }
                  key={category.id}
                >
                  <DataTableCell className="csm-table-cell-selected">
                    <Checkbox
                      id={`${category.id}-checkbox`}
                      checked={this.props.selectedCategoryValues.includes(
                        category.id
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        this.props.toggleCategory(
                          category.id,
                          e.currentTarget.checked
                        )
                      }}
                    />
                  </DataTableCell>
                  <DataTableCell className="csm-table-cell-category">
                    {category.label}
                  </DataTableCell>
                  <DataTableCell className="csm-table-cell-category">
                    {category.num}
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTableContent>
        </DataTable>
      </div>
    )
  }
}

export default TableSection
