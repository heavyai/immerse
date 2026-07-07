// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect } from "react"
import { Redirect } from "react-router-dom"
import { useHistory, generatePath, useParams } from "react-router"
import Icon from "components/icon/icon"
import { ROUTE_DATA_MANAGEMENT } from "../../routes/paths"
import ExistingTablePreview from "./existing-table-preview"
import SearchInput from "components/search-input/search-input"
import TablesList from "components/table-picker/tables-list"
import { DataManagerRouteParams } from "./constants"

export type DataManagerProps = {
  updateSearchVal: (newFilterVal: string) => void
  getDataSourcesList: () => void
  tables: {
    list: Record<string, any>[]
    tablePickerState: {
      searchVal: string
    }
  }
  canCreateTable: boolean
  isDemo: boolean
}

const DataManager: FC<DataManagerProps> = ({
  getDataSourcesList,
  updateSearchVal,
  tables: {
    list,
    tablePickerState: { searchVal }
  },
  canCreateTable,
  isDemo
}) => {
  const history = useHistory()
  const params = useParams<DataManagerRouteParams>()
  const { tableName: tableNameParam }: DataManagerRouteParams = params

  useEffect(() => {
    getDataSourcesList()
  }, [getDataSourcesList])

  return isDemo ? (
    <Redirect to={"/"} />
  ) : (
    <div className="table-picker-container">
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
                  list,
                  determineIfSelected: (name: string) =>
                    Boolean(name === tableNameParam),
                  searchVal,
                  canCreateTable,
                  selectPreviewTable: (tableName: string) =>
                    history.push(
                      generatePath(ROUTE_DATA_MANAGEMENT, {
                        ...params,
                        tableName
                      })
                    )
                }}
              />
            </div>
          </div>
          <div className="data-preview-container">
            {tableNameParam ? (
              <ExistingTablePreview tableName={tableNameParam} showComments />
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

export default DataManager
