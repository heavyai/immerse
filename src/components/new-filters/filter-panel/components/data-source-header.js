// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"

import { Icon } from "@rmwc/icon"
import { Switch } from "widgets/switch/Switch"
import { Tooltip } from "@rmwc/tooltip"

import CohortDimensionSection from "components/new-filters/filter-panel/components/cohort-dimension-section"
import { useJoinFromParameter } from "components/join-manager/use-join-from-parameter"

const DataSourceHeader = ({
  dataSource,
  onClick,
  dataSourceFilters,
  toggleFiltersForDataSource,
  showDashboardFilterDelete,
  dashboardFilters,
  deleteDashboardFilters,
  cohortDimension,
  selectedFilterSet,
  changeCohortDimension
}) => {
  const dataSourceHasFiltersEnabled = dataSourceFilters.some(
    (filter) => filter.enabled
  )

  const joinDataSource = useJoinFromParameter(dataSource)
  const displayDataSource = joinDataSource?.name ?? dataSource

  return (
    <div className="filter-datasource-header-container" onClick={onClick}>
      <div className="filter-datasource-header">
        <div className="filter-datasource-header-left-align">
          <div>
            <Switch
              disabled={dataSourceFilters.length === 0}
              checked={dataSourceHasFiltersEnabled}
              onClick={(e) => {
                e.stopPropagation()

                // Interacting with the Switch component lags significantly
                // without this setTimeout #whenindoubt
                setTimeout(() => {
                  toggleFiltersForDataSource(!dataSourceHasFiltersEnabled)
                }, 0)
              }}
            />
          </div>
          {dataSource && (
            <Tooltip content={displayDataSource} enterDelay={500}>
              <div className="filter-datasource-header-name">
                {displayDataSource}
              </div>
            </Tooltip>
          )}
        </div>
        <div className="filter-datasource-header-right-align">
          {showDashboardFilterDelete && dashboardFilters.length > 0 && (
            <Tooltip
              content="Delete all dashboard filters in this data source"
              enterDelay={500}
            >
              <Icon
                icon={{ icon: "delete", size: "xsmall" }}
                className="filter-datasource-header-delete"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteDashboardFilters()
                }}
              />
            </Tooltip>
          )}
          <Icon icon="chevron_left" className="expand-right" />
        </div>
      </div>
      {cohortDimension && (
        <div className="filter-datasource-cohort">
          <CohortDimensionSection
            dataSource={dataSource}
            dimension={cohortDimension}
            dataSourceFilters={dataSourceFilters}
            hasDimension={Boolean(cohortDimension)}
            changeCohortDimension={changeCohortDimension}
            selectedFilterSet={selectedFilterSet}
          />
        </div>
      )}
    </div>
  )
}

DataSourceHeader.propTypes = {
  dataSource: PropTypes.string,
  dataSourceFilters: PropTypes.arrayOf(PropTypes.object),
  selectedFilterSet: PropTypes.shape({
    dimensions: PropTypes.object,
    filters: PropTypes.arrayOf(PropTypes.string),
    id: PropTypes.string,
    name: PropTypes.string,
    selected: PropTypes.bool
  }),
  toggleFiltersForDataSource: PropTypes.func,
  onClick: PropTypes.func,
  changeCohortDimension: PropTypes.func,
  cohortDimension: PropTypes.string
}

export default DataSourceHeader
