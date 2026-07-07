// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect } from "react"
import { connect, useSelector } from "react-redux"
import { bindActionCreators } from "redux"
import cx from "classnames"

import { Icon } from "@rmwc/icon"
import { MultiSelect } from "widgets/multi-select/Multi-select"

import { useColumnOptions } from "hooks/use-column-options"
import {
  makeSelectGroupedOptions,
  sortedDataSourcesSelector
} from "selectors/data-sources"
import DataColumnSelector from "components/data-column-selector/data-column-selector"

import { getDataSourcesList } from "actions/tables-action-creators"

import ParametersDataTable from "./parameters-data-table"
import TableFunctionBrowser from "./table-function-browser"
import "./custom-sql-side-browser.scss"
import { useJoinFromParameter } from "components/join-manager/use-join-from-parameter"
import { getFullColumnName } from "components/join-manager/utils"

const BROWSER_PARAMETERS = "BROWSER_PARAMETERS"
const BROWSER_COLUMNS = "BROWSER_COLUMNS"
const BROWSER_TRANSFORMS = "BROWSER_TRANFORMS"

const CustomSQLSideBrowser = ({
  actions,
  activeDataSource,
  allDataSources,
  isLoadingDataSources,
  disableParameterBrowser,
  onSelectRow,
  showDataSourceTransforms = false
}) => {
  const [isBrowserOpen, setIsBrowserOpen] = useState(true)
  const [currentBrowser, setCurrentBrowser] = useState(BROWSER_COLUMNS)
  const [dataSource, setDataSource] = useState(activeDataSource)
  const columnData = useColumnOptions(dataSource)
  const joinDataSources = useSelector((state) => state.joinDataSources)
  const joinDataSource = useJoinFromParameter(dataSource)

  useEffect(() => {
    setDataSource(activeDataSource)
  }, [activeDataSource])

  useEffect(() => {
    if (disableParameterBrowser && currentBrowser === BROWSER_PARAMETERS) {
      setCurrentBrowser(BROWSER_COLUMNS)
    }
  }, [disableParameterBrowser, currentBrowser])

  useEffect(() => {
    if (
      allDataSources.every((dataSourceGroup) => !dataSourceGroup.length) &&
      !isLoadingDataSources
    ) {
      actions.getDataSourcesList()
    }
  }, [actions, allDataSources, activeDataSource, isLoadingDataSources])

  // This allows displaying the currently selected option before we've fetched the full options list.
  // (And prevents the accompanying jarring selection animation when said fetch returns.)
  const sourceSelectOptions = allDataSources.length
    ? makeSelectGroupedOptions(allDataSources, joinDataSources)
    : dataSource
    ? [dataSource]
    : []

  const displayDataSource = joinDataSource ? joinDataSource.name : dataSource

  return (
    <div className="custom-sql-side-browser">
      <nav className="handles">
        <div
          className="close-handle"
          onClick={() => setIsBrowserOpen(!isBrowserOpen)}
        >
          <Icon
            icon={
              isBrowserOpen ? "keyboard_arrow_right" : "keyboard_arrow_left"
            }
          />
        </div>

        <div
          className={cx("handle", {
            "is-active": currentBrowser === BROWSER_COLUMNS
          })}
          onClick={() => {
            setIsBrowserOpen(true)
            setCurrentBrowser(BROWSER_COLUMNS)
          }}
        >
          <span>Columns</span>
        </div>
        {(disableParameterBrowser && currentBrowser === BROWSER_COLUMNS) || (
          <div
            className={cx("handle", {
              "is-active": currentBrowser === BROWSER_PARAMETERS
            })}
            onClick={() => {
              setIsBrowserOpen(true)
              setCurrentBrowser(BROWSER_PARAMETERS)
            }}
          >
            <span>Parameters</span>
          </div>
        )}
        {showDataSourceTransforms && (
          <div
            className={cx("handle", {
              "is-active": currentBrowser === BROWSER_TRANSFORMS
            })}
            onClick={() => {
              setIsBrowserOpen(true)
              setCurrentBrowser(BROWSER_TRANSFORMS)
            }}
          >
            <span>Transforms</span>
          </div>
        )}
      </nav>
      {isBrowserOpen && (
        <>
          {currentBrowser === BROWSER_COLUMNS && (
            <div className="column-browser">
              <MultiSelect
                blurInputOnSelect
                placeholder="Source"
                options={sourceSelectOptions}
                value={
                  dataSource
                    ? {
                        label: displayDataSource,
                        value: dataSource
                      }
                    : "Source"
                }
                onChange={(option) => setDataSource(option.value)}
              />

              <DataColumnSelector
                data={columnData}
                searchFieldLabel="Search columns"
                onSelectRow={(column) => {
                  const columnVal = getFullColumnName(column, "value")
                  onSelectRow(columnVal, column.is_array)
                }}
                rowIconOptions={{
                  icon: "input",
                  style: {
                    // Material's insert icon points right and there's no left-pointing
                    // option, so flipping it with CSS
                    transform: "scaleX(-1)"
                  },
                  title: "Copy To Custom SQL Section"
                }}
              />
            </div>
          )}
          {currentBrowser === BROWSER_PARAMETERS && (
            <ParametersDataTable {...{ onSelectRow }} />
          )}
          {currentBrowser === BROWSER_TRANSFORMS && (
            <div className="function-browser">
              <TableFunctionBrowser
                sourceSelectOptions={sourceSelectOptions}
                onSelectFunction={onSelectRow}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

const mapStateToProps = (state) => ({
  allDataSources: sortedDataSourcesSelector(
    state.dashboard.dataSources,
    state.tables.list
  ),
  isLoadingDataSources: state.tables.loading
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      getDataSourcesList
    },
    dispatch
  )
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomSQLSideBrowser)
