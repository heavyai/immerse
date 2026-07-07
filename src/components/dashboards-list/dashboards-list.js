// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect, useRef } from "react"
import PropTypes from "prop-types"
import { AutoSizer, List } from "react-virtualized"
import Icon from "components/icon/icon"
import { Checkbox } from "@rmwc/checkbox"

import DashboardRowItem from "components/dashboard-row-item/dashboard-row-item-parent"
import { frontEndViewShape } from "constants/prop-types"
import { filterTypesMap } from "../dashboards/dashboard-manager-filters/FilterTypePickerComponent"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const { SHOW_DASHBOARD_VERSIONS, LANDING_PAGE_PANELS } = available_feature_flags

export function makeSearchFilter(searchVal) {
  return searchVal
    ? (item) => searchFilter(searchVal.toLowerCase(), item)
    : () => true
}

function searchFilter(term, item) {
  const name = item.dashboard_name.toLowerCase() || ""
  const update_time = item.update_time || ""
  const dashboard_owner = item.dashboard_owner || ""
  const table = item.tableName || ""
  return (
    name.includes(term) ||
    (table && table.toLowerCase().includes(term)) ||
    update_time.includes(term) ||
    dashboard_owner.includes(term)
  )
}

export function handleUntitledDashboard(value) {
  return value === "" ? "Untitled" : value
}

function getIcon(col, sortCol, sortOrder) {
  const res = {}
  if (col === sortCol) {
    if (sortOrder === 1) {
      res.name = "arrow1"
      res.className = "asc"
    } else {
      res.name = "arrow1"
      res.className = "desc"
    }
  } else {
    res.name = "sort"
  }

  return <Icon {...res} />
}

DashboardsList.propTypes = ListItems.propTypes = {
  sharingEnabled: PropTypes.bool,
  list: PropTypes.arrayOf(frontEndViewShape).isRequired,
  searchVal: PropTypes.string.isRequired,
  filters: PropTypes.arrayOf(PropTypes.object),
  updateFilteredListCount: PropTypes.func.isRequired,
  selected: PropTypes.object.isRequired,
  toggleDashboard: PropTypes.func.isRequired,
  selectAllDashboardsInList: PropTypes.func.isRequired,
  deselectAllDashboardsInList: PropTypes.func.isRequired,
  filterEnabled: PropTypes.bool.isRequired
}

// this is used in a few lines on the changeSort function.
// Everything defaults to a 1 (A->Z) sort order...except for update_time
// which defaults -1 Z->A. If anything else should be reversed by default, put it here.
//
// This object could be populated with all columns set to 1, but meh.
const defaultSortOrder = {
  update_time: 1
}

export function DashboardsList(props) {
  const [sortCol, setSortCol] = useState("update_time")
  const [sortOrder, setSortOrder] = useState(1)

  const changeSort = (col) => {
    setSortOrder(sortCol === col ? -sortOrder : defaultSortOrder[col] || -1)
    setSortCol(col)
  }

  const [sortedList, setSortedList] = useState(props.list)
  useEffect(() => {
    const listWithParsedSources = props.list.map((row) => ({
      ...row,
      tableName:
        row && row.dashboard_metadata && row.dashboard_metadata.length
          ? JSON.parse(row.dashboard_metadata).table
          : null
    }))

    const filteredList =
      props.filters.length && props.filterEnabled
        ? listWithParsedSources.filter((item) =>
            props.filters.every((val) => {
              const filterKey = Object.keys(val)[0]
              const rowKey = filterTypesMap[filterKey]
              if (
                rowKey === "update_time" &&
                Array.isArray(val[filterKey]) &&
                val[filterKey].length
              ) {
                return (
                  (item[rowKey] > val[filterKey][0] || !val[filterKey][0]) &&
                  (item[rowKey] < val[filterKey][1] || !val[filterKey][1])
                )
              } else if (rowKey === "tableName") {
                const dashboardSources =
                  item[rowKey] && item[rowKey].split(", ")
                return (
                  dashboardSources &&
                  dashboardSources.some(
                    (dashboardSource) => val[filterKey][dashboardSource]
                  )
                )
              } else {
                switch (typeof val[filterKey]) {
                  case "string":
                    return item[rowKey]
                      .toLowerCase()
                      .includes(val[filterKey].toLowerCase())
                  case "object":
                    return val[filterKey][item[rowKey]] === true
                  default:
                    return item[rowKey] === val[filterKey]
                }
              }
            })
          )
        : listWithParsedSources

    setSortedList(
      filteredList
        .filter(makeSearchFilter(props.searchVal))
        .sort(makeListComparator(sortCol, sortOrder))
    )
  }, [
    props.list,
    props.filters,
    props.searchVal,
    sortCol,
    sortOrder,
    props.filterEnabled
  ])

  const [allSelected, setAllSelected] = useState(false)
  useEffect(() => {
    setAllSelected(
      sortedList.length > 0 &&
        props.selected.size >= sortedList.length &&
        sortedList.every(({ dashboard_id }) => props.selected.has(dashboard_id))
    )
  }, [sortedList, props.selected])

  const toggleAllSelected = (evt) => {
    if (evt.currentTarget.checked) {
      props.selectAllDashboardsInList(
        sortedList.map(({ dashboard_id }) => dashboard_id)
      )
      setAllSelected(true)
    } else {
      props.deselectAllDashboardsInList(
        sortedList.map(({ dashboard_id }) => dashboard_id)
      )
      setAllSelected(false)
    }
  }

  return (
    <div className="dashboards-container">
      <div
        className={`dashboards-table-wrapper ${
          getFeatureFlag(LANDING_PAGE_PANELS)
            ? "is-welcome-section-enabled"
            : ""
        }`}
        data-testid="dashboards-list"
      >
        <div className="table-header-row">
          <div
            className="dashboards-checkbox dashboards-list-column-header"
            role="columnheader"
          >
            <Checkbox checked={allSelected} onChange={toggleAllSelected} />
          </div>
          <div
            className="dashboard-name dashboards-list-column-header"
            role="columnheader"
            onClick={() => changeSort("dashboard_name")}
          >
            {getIcon("dashboard_name", sortCol, sortOrder)}
            Name
          </div>
          <div className="dashboards-list-column-header-group">
            <div
              role="columnheader"
              className="dashboards-list-column-header"
              onClick={() => changeSort("tableName")}
            >
              {getIcon("tableName", sortCol, sortOrder)}
              Sources
            </div>
            <div
              role="columnheader"
              className="dashboards-list-column-header"
              onClick={() => changeSort("update_time")}
            >
              {getIcon("update_time", sortCol, sortOrder)}
              Last Modified
            </div>
            <div
              role="columnheader"
              className="dashboards-list-column-header"
              onClick={() => changeSort("dashboard_owner")}
            >
              {getIcon("dashboard_owner", sortCol, sortOrder)}
              Owner
            </div>
            {props.sharingEnabled && (
              <div
                role="columnheader"
                className="dashboards-list-column-header"
                onClick={() => changeSort("is_dash_shared")}
              >
                {getIcon("is_dash_shared", sortCol, sortOrder)}
                Shared
              </div>
            )}
            {getFeatureFlag(SHOW_DASHBOARD_VERSIONS) && (
              <div
                role="columnheader"
                className="dashboards-list-column-header"
              >
                Version
              </div>
            )}
          </div>
        </div>
        <div className="table-header-border" />
        <div id="dashboards-list" className="table-body">
          <ListItems
            {...props}
            sortedList={sortedList}
            sortCol={sortCol}
            sortOrder={sortOrder}
            selected={props.selected}
          />
        </div>
      </div>
    </div>
  )
}

export function makeListComparator(sortCol, sortOrder) {
  return (a, b) => {
    const aVal =
      a[sortCol] && a[sortCol].toLowerCase
        ? a[sortCol].toLowerCase()
        : a[sortCol]
    const bVal =
      b[sortCol] && b[sortCol].toLowerCase
        ? b[sortCol].toLowerCase()
        : b[sortCol]
    if (aVal < bVal) {
      return sortOrder
    } else if (aVal > bVal) {
      return -sortOrder
    } else {
      return 0
    }
  }
}

function ListItems({
  canCreateDashboard,
  sharingEnabled,
  sortedList = [],
  selected,
  toggleDashboard,
  searchVal,
  sortCol,
  sortOrder,
  updateFilteredListCount
}) {
  const domRef = useRef(null)
  useEffect(() => {
    if (domRef.current) {
      domRef.current.scrollToRow(0)
    }
  }, [sortedList, sortCol, sortOrder, searchVal])

  // updates number of filtered dashboard list for dashboard manager filter count component
  useEffect(() => {
    updateFilteredListCount(sortedList.length)
  }, [sortedList.length, updateFilteredListCount])

  const showVersions = getFeatureFlag(SHOW_DASHBOARD_VERSIONS)

  if (sortedList.length > 0) {
    return (
      <AutoSizer>
        {({ width, height }) => (
          <List
            ref={domRef}
            width={width}
            height={height}
            rowCount={sortedList.length}
            rowHeight={48}
            rowRenderer={({ index, key, style }) => (
              <DashboardRowItem
                id={index}
                key={key}
                searchVal={searchVal}
                style={style}
                selected={selected.has(sortedList[index].dashboard_id)}
                toggle={toggleDashboard}
                sharingEnabled={sharingEnabled}
                version={
                  showVersions
                    ? JSON.parse(sortedList[index].dashboard_metadata).version
                    : undefined
                }
                {...sortedList[index]}
              />
            )}
          />
        )}
      </AutoSizer>
    )
  } else if (searchVal) {
    return (
      <div
        data-testid="no-search-results"
        className="no-results"
      >{`No search results for “${searchVal}”`}</div>
    )
  } else {
    return (
      <div className="no-dashboards">
        {canCreateDashboard ? (
          <div className="dashboard-message">
            No dashboard yet
            <span>
              Click &quot;New Dashboard&quot; to create your first dashboard.
            </span>
          </div>
        ) : (
          <div className="dashboard-message">
            There are no dashboards available at this time.
          </div>
        )}
      </div>
    )
  }
}
export default DashboardsList
