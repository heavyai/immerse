// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import {
  highlightCharts,
  dehighlightCharts
} from "actions/charts-action-creators"

import "@material/list/dist/mdc.list.css"
import "./chart-filters.css"

import { buildOmnifilterSql } from "vega/constants/filter-types"
import { getDataSourcesForFilter } from "vega/utils/filter"
import { getTablesForDataSource } from "components/join-manager/utils"
import { intersection } from "lodash"

function getDataSources(chart) {
  if (chart.multiSources && Object.values(chart.multiSources).length) {
    return Object.values(chart.multiSources).map((source) => source.table)
  } else if (chart.dataSource) {
    return [chart.dataSource]
  } else {
    return []
  }
}

/*
  This is called upon render and takes a chartId and a functional component
  state setter It pulls various data about crossfilters and maps them to chart
  ids. The whole thing is a mess of conditionals, but it'll all go away once
  we're all vega/omnifilters based and crossfilter/charting has gone away.

  So hold your nose and slog through it.
*/

function getFilters(chartId, charts, omnifilters) {
  const chart = charts[chartId]

  // first we get all the dataSources associated with our chart
  const dataSources = getDataSources(chart)

  // set up our list of personal filters + other filters.
  const myFilters = []
  const otherFilters = []

  Object.values(omnifilters).forEach((filterMetaData) => {
    const filterDataSources = getDataSourcesForFilter(filterMetaData)
    const filterTables = [...filterDataSources]
      .map(getTablesForDataSource)
      .flat()
    const chartTables = dataSources.map(getTablesForDataSource).flat()

    // If these two sets of tables perfectly intersect
    const allTablesIntersect =
      intersection(filterTables, chartTables).length === filterTables.length

    // if the filter's data source is one of our chart's data sources, then it applies.
    if (allTablesIntersect) {
      if (filterMetaData.chartId === chartId) {
        myFilters.push(filterMetaData)
      } else {
        otherFilters.push(filterMetaData)
      }
    }
  })

  return { myFilters, otherFilters }
}

/*
  This component handles the display of chart filters in the popup, which is
  probably created by chart-filters-popup.

  Splits filters into two sections: myFilters (which are filters which were
  created by this chart), and otherFilters (which are filters which apply to
  this chart but were created elsewhere).

  Then use that info to call buildOmnifilterSql on the filterMetaData object to
  display an SQL string.
*/

const ChartFilters = ({
  chartId,
  charts = {},
  omnifilters = [],
  open = false,
  highlightChartsFn = () => {},
  dehighlightChartsFn = () => {}
}) => {
  if (!open) {
    return null
  }

  const { myFilters, otherFilters } = getFilters(chartId, charts, omnifilters)

  if (!myFilters.length && !otherFilters.length) {
    return <div style={{ minWidth: "200px" }}>No filters on this chart</div>
  }

  return (
    <ul className="filters-popup-list">
      {myFilters.length > 0 && (
        <li>
          <span className="filters-popup-category">
            Filters defined by this chart
          </span>
          <ul className="filters-popup-sublist">
            {myFilters.map((filter) => (
              <li key={filter.name}>{buildOmnifilterSql(filter)}</li>
            ))}
          </ul>
        </li>
      )}
      {otherFilters.length > 0 && (
        <li>
          <span className="filters-popup-category">
            Filters applied to this chart
          </span>
          <ul className="filters-popup-sublist">
            {otherFilters.map((filter) => {
              const mouseOverHandler = filter.chartId
                ? () => highlightChartsFn([filter.chartId])
                : undefined

              const mouseOutHandler = filter.chartId
                ? () => dehighlightChartsFn([filter.chartId])
                : undefined

              return (
                <li
                  key={filter.name}
                  onMouseOver={mouseOverHandler}
                  onMouseOut={mouseOutHandler}
                >
                  {buildOmnifilterSql(filter)}
                </li>
              )
            })}
          </ul>
        </li>
      )}
    </ul>
  )
}

ChartFilters.propTypes = {
  chartId: PropTypes.string,
  charts: PropTypes.object,
  omnifilters: PropTypes.array,
  open: PropTypes.bool,
  highlightCharts: PropTypes.func,
  dehighlightCharts: PropTypes.func
}

const mapStateToProps = (state) => ({
  charts: state.charts,
  omnifilters: state.omnifilters.filter((filter) => filter.enabled)
})

export default connect(mapStateToProps, { highlightCharts, dehighlightCharts })(
  ChartFilters
)
