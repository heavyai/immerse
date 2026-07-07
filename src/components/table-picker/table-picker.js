// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from "react"
import PropTypes from "prop-types"
import Icon from "components/icon/icon"
import SearchInput from "components/search-input/search-input"
import TablePreviewParent from "components/table-preview/table-preview-parent"
import TablesList from "components/table-picker/tables-list"
import { tablesShape } from "constants/prop-types"
import {
  Redirect,
  generatePath,
  useHistory,
  useRouteMatch
} from "react-router-dom"
import { ROUTE_DATA_MANAGEMENT } from "routes/paths"

const TablePicker = ({
  tables: {
    list,
    tablePickerState: {
      searchVal,
      selectedPreviewTable: { index: previewIndex, name } = {}
    }
  },
  updateSearchVal,
  selectPreviewTable,
  resetPreviewTable,
  canCreateTable,
  isDemo,
  getDataSourcesList
}) => {
  const routeMatch = useRouteMatch()
  const selectorRootPath = generatePath(ROUTE_DATA_MANAGEMENT, {
    dbName: routeMatch.params.database
  })
  const history = useHistory()

  const routeToImporter = () => {
    history.push(`${selectorRootPath}/import/create`)
    resetPreviewTable()
  }

  useEffect(() => {
    getDataSourcesList()
  }, [getDataSourcesList])

  return isDemo ? (
    <Redirect to={"/"} />
  ) : (
    <div
      className="table-picker-container"
      data-testid="table-picker-container"
    >
      <div className="table-picker">
        <div className="table-picker-content">
          <div className="table-list-container">
            <div className="table-list-tab">TABLES</div>
            <SearchInput
              {...{
                id: "table-search",
                placeholder: "SEARCH",
                searchVal,
                updateSearchVal
              }}
            />
            <div className="table-list-wrap">
              <TablesList
                {...{
                  gotoTableImporter: routeToImporter,
                  list,
                  determineIfSelected: (_, index) =>
                    Boolean(index === previewIndex),
                  searchVal,
                  selectPreviewTable,
                  resetPreviewTable,
                  canCreateTable
                }}
              />
            </div>
          </div>
          <div className="data-preview-container">
            {name ? (
              <TablePreviewParent
                {...{
                  name
                }}
              />
            ) : (
              <div className="data-preview">
                <div className="preview-icon">
                  <Icon name="chart-table" />
                </div>
                <span>{"Data Preview"}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

TablePicker.propTypes = {
  tables: tablesShape.isRequired,
  updateSearchVal: PropTypes.func.isRequired,
  selectPreviewTable: PropTypes.func.isRequired,
  resetPreviewTable: PropTypes.func.isRequired,
  canCreateTable: PropTypes.bool.isRequired,
  isDemo: PropTypes.bool,
  getDataSourcesList: PropTypes.func
}

export default TablePicker
