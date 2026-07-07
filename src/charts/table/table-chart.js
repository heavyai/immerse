// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  addColNames,
  createProjectMeasures,
  getColAliases
} from "utils/helpers"
import listeners, {
  sortEventListener,
  alignEventListener
} from "charts/utils/event-listeners"
import { NULLS_LAST, TABLE_SIZE } from "constants/magic-variables"
import addChartEventListeners from "charts/utils/add-chart-event-listeners"
import composeDimensions from "charts/utils/compose-dimensions"
import composeMeasures from "charts/utils/compose-measures"
import createUpdateFunctionForChart from "charts/utils/create-update-function-for-chart"
import dc from "services/dc"
import generalChartUpdate from "charts/utils/general-chart-update"
import { isEmpty } from "utils/selector-helpers"
import { mapBinnedDimensions } from "utils/map-binned-dimensions"
import { merge } from "lodash"
import promisifyChartCreation from "charts/utils/promisify-chart-creation"
import specificChartUpdates from "charts/utils/specific-chart-updates"
import {
  setValueFormatter,
  setDateFormatter
} from "actions/charts-action-creators"
import { getStore } from "services/ImmerseCrossFilter/utils"
import { findJoinDataSourceForParameter } from "components/join-manager/use-join-from-parameter"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { getTablesForDataSource } from "components/join-manager/utils"

const processSelectorParameters = (chartId, selectors) =>
  selectors.map((selector) => ({
    ...selector,
    column: process(selector.column, { useDisplayName: true, chartId }),
    label: process(selector.label, { useDisplayName: true, chartId }),
    value: process(selector.value, { useDisplayName: true, chartId })
  }))

export function createTableChart(crossFilter) {
  return (chartSpec, node, callback) => {
    try {
      const tables = getTablesForDataSource(chartSpec.dataSource)
      const TableChart = dc.heavyaiTable(node, tables)

      TableChart.width(chartSpec.width)
        .height(chartSpec.height)
        .size(TABLE_SIZE)
        .crossfilter(crossFilter)

      let dimensions = composeDimensions(crossFilter, chartSpec)
      let measures = composeMeasures(
        dimensions,
        addColNames(chartSpec.measures),
        "table",
        chartSpec
      )
      if (isEmpty(chartSpec.dimensions)) {
        const projectMeasures = createProjectMeasures(chartSpec.measures)

        // this is the surgical fix
        // basically, if you add a dim, add a # records measure, then change the dim, you
        // can accidentally send off a `SELECT *...` query here.
        // since it only has measures and no dimension yet
        // so if we happened to hit here and get a single "*" projectMeasure, just return
        // the chart as is and do nothing.
        // it would be better to incorpoate this mod over into createProjectMeasures to toss
        // an exception, but I want to confirm that first.
        if (projectMeasures.length === 1 && projectMeasures[0] === "*") {
          return TableChart
        }

        dimensions = crossFilter.dimension(null).projectOn(projectMeasures)
        measures = () => 0
      }

      TableChart.dimension(dimensions).group(measures)
      TableChart.showNullDimensions(
        isEmpty(chartSpec.dimensions) || chartSpec.showNullDimensions
      )

      TableChart.sampling(true)
      TableChart.colAliases(
        getColAliases(chartSpec.dimensions, chartSpec.measures).map((alias) =>
          process(alias, { useDisplayName: true })
        )
      )

      TableChart.nullsOrder(chartSpec.nullsOrder || NULLS_LAST)

      if (chartSpec.sortColumn || chartSpec.columnAlignments) {
        const columns = chartSpec.dimensions
          .concat(chartSpec.measures)
          .filter((d) => d.value)
        if (
          chartSpec.sortColumn &&
          chartSpec.sortColumn.index < columns.length
        ) {
          TableChart.sortColumn(chartSpec.sortColumn)
        }
        if (
          chartSpec.columnAlignments &&
          chartSpec.columnAlignments.length <= columns.length
        ) {
          TableChart.columnAlignments(chartSpec.columnAlignments)
        }
      }
      if (chartSpec.renderTableBorders) {
        TableChart.borders(chartSpec.renderTableBorders)
      }
      if (chartSpec.zebraStriping) {
        TableChart.zebraStriping(chartSpec.zebraStriping)
      }

      if (chartSpec.filters.length && !chartSpec.dimensions.length) {
        // on creation/loading, filters is an array of arrays
        // on duplication, filters is just an array
        const filters = Array.isArray(chartSpec.filters[0])
          ? chartSpec.filters[0]
          : chartSpec.filters
        filters.forEach((filter, index) => {
          if (filter !== null) {
            TableChart.addFilteredColumn(chartSpec.measures[index].value)
          }
        })
      }

      const allBinParams = mapBinnedDimensions(chartSpec.dimensions)
      TableChart.binParams(allBinParams)

      setValueFormatter(TableChart, chartSpec.measures, chartSpec.type)
      setDateFormatter(TableChart, chartSpec.dimensions, chartSpec.type)

      // getFilterCol over in heavyai-charting expects to get a type from the column, and it
      // then expects that type to be in the table. If it's not, it blows up.
      // so here we just process the expr to get an actual column name, and look -that- up in the columns data.
      // if it's there, return the type, if not return undef.
      //
      // NOTE - returning undefined will prevent a filter from being added. For these purposes, if you want
      // to add a filter, you can just return some arbitrary string, such as "UNKNOWN"
      // BUT ALSO NOTE - if you try to apply a filter on a column that's not in the table, it'll blow up later
      // anyway, so I don't recommend it.
      TableChart.setCustomRetrieveFilterColType(({ expr, table, columns }) => {
        const processedExpr = process(expr, { useDisplayName: true })
        let key = `${table}.${processedExpr}`

        const joinDataSources = getStore().getState().joinDataSources
        if (
          findJoinDataSourceForParameter(chartSpec.dataSource, joinDataSources)
        ) {
          // If its a join, processedExpr is already table.column syntax
          key = processedExpr
        }
        return columns[key] ? columns[key].type : undefined
      })

      return callback(null, TableChart)
    } catch (e) {
      return callback(e)
    }
  }
}

export const createTableChartAsync = promisifyChartCreation(createTableChart)

const tableUpdateMethods = {
  dimensions(chart, updates, chartSpec) {
    const allBinParams = mapBinnedDimensions(updates.dimensions)
    chart.binParams(allBinParams)
    chart.expireCache()
    chart.colAliases(
      getColAliases(
        processSelectorParameters(chart.id, updates.dimensions),
        processSelectorParameters(chart.id, chartSpec.measures)
      )
    )
  },
  measures(chart, updates, chartSpec) {
    setValueFormatter(chart, updates.measures, chartSpec.type)
    let measures = composeMeasures(
      chart.dimension(),
      addColNames(updates.measures),
      chartSpec.type,
      chartSpec
    )
    if (isEmpty(chartSpec.dimensions)) {
      chart.dimension().projectOn(createProjectMeasures(updates.measures))
      measures = () => 0
    }

    chart.group(measures)
    chart.colAliases(
      getColAliases(
        processSelectorParameters(chart.id, chartSpec.dimensions),
        processSelectorParameters(chart.id, updates.measures)
      )
    )
    const allBinParams = mapBinnedDimensions(chartSpec.dimensions)
    chart.binParams(allBinParams)
  }
}

const allUpdates = merge({}, specificChartUpdates, tableUpdateMethods)
export const updateTableChart = createUpdateFunctionForChart(
  generalChartUpdate,
  allUpdates
)

export const addTableEventListeners = addChartEventListeners(
  Object.assign({}, listeners, {
    sort: sortEventListener,
    align: alignEventListener
  })
)
