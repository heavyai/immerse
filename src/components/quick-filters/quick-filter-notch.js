// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import PropTypes from "prop-types"
import cx from "classnames"

import { QuickFilterNotchItem } from "components/quick-filters/quick-filter-notch-item"
import { VisibilityToggle } from "components/quick-filters/visibility-toggle"
import { isQuickFilterVisibleOnDashboard } from "components/quick-filters/quick-filter-utils"

import "./styles.scss"

export const QuickFilterNotch = ({
  enabledFilters,
  editMode,
  toggleQuickFilterVisibility,
  batchToggleQuickFilterVisibility,
  getDistinctColumnValues,
  columnValuesByDataSource,
  updateFilterValue,
  setQuickFilterOption,
  clearDistinctColumnValues,
  toggleQuickFiltersExpanded,
  quickFiltersExpanded,
  overlayNotch,
  toggleFilterByName
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null)

  if (!enabledFilters.length) {
    return null
  }

  const toggleAllVisibilityClass = cx({
    "visibility-toggle-all": true,
    visible: enabledFilters.some(isQuickFilterVisibleOnDashboard)
  })

  // If any filters are visible, toggles all off.
  const toggleDisplayedFilterVisibility = () => {
    batchToggleQuickFilterVisibility(
      enabledFilters.map((f) => f.name),
      !enabledFilters.some(isQuickFilterVisibleOnDashboard)
    )
  }

  const filtersContent = quickFiltersExpanded ? (
    <div className="filters-wrapper">
      {enabledFilters
        .sort((a, b) =>
          a.filter.dataExpression.localeCompare(b.filter.dataExpression)
        )
        .map((filter) => {
          const {
            filter: { dataSource, dataExpression }
          } = filter

          const columnValues =
            (columnValuesByDataSource[dataSource] &&
              columnValuesByDataSource[dataSource][dataExpression]) ||
            {}

          const distinctValues = (columnValues.distinctValues || []).map(
            (data) => data.col
          )

          return (
            <QuickFilterNotchItem
              key={filter.name}
              currentFilter={filter}
              distinctValues={distinctValues}
              isLoadingDistinctValues={columnValues.loading}
              setActiveDropdown={setActiveDropdown}
              activeDropdown={activeDropdown}
              updateFilterValue={updateFilterValue}
              editMode={editMode}
              toggleQuickFilterVisibility={toggleQuickFilterVisibility}
              getDistinctColumnValues={getDistinctColumnValues}
              setQuickFilterOption={setQuickFilterOption}
              clearDistinctColumnValues={clearDistinctColumnValues}
              toggleFilterByName={toggleFilterByName}
            />
          )
        })}
      {editMode && (
        <VisibilityToggle
          classNames={toggleAllVisibilityClass}
          handleToggle={toggleDisplayedFilterVisibility}
        />
      )}
    </div>
  ) : null

  return (
    <div
      className={cx("quick-filter-notch-container", { overlay: overlayNotch })}
    >
      <div className={`notch ${quickFiltersExpanded ? "" : "collapsed"}`}>
        <div className="notch-left" />
        <div className="notch-content">
          {filtersContent}
          <div
            className="notch-handle-click-target"
            onClick={toggleQuickFiltersExpanded}
          >
            <div className="notch-handle" />
          </div>
        </div>
        <div className="notch-right" />
      </div>
    </div>
  )
}

QuickFilterNotch.propTypes = {
  distinctValues: PropTypes.arrayOf(PropTypes.string),
  toggleFilterByName: PropTypes.func,
  editMode: PropTypes.bool,
  enabledFilters: PropTypes.arrayOf(
    PropTypes.shape({
      enabled: PropTypes.bool,
      filter: PropTypes.shape({
        dataExpression: PropTypes.string,
        value: PropTypes.string
      }),
      name: PropTypes.string
    })
  ),
  toggleQuickFilterVisibility: PropTypes.func,
  batchToggleQuickFilterVisibility: PropTypes.func,
  getDistinctColumnValues: PropTypes.func,
  updateFilterValue: PropTypes.func,
  setQuickFilterOption: PropTypes.func,
  clearDistinctColumnValues: PropTypes.func,
  toggleQuickFiltersExpanded: PropTypes.func,
  quickFiltersExpanded: PropTypes.bool,
  overlayNotch: PropTypes.bool
}
