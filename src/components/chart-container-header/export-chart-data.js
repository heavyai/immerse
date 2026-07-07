// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { parse } from "json2csv"
import fileSaver from "file-saver"
import { is } from "ramda"

import { process } from "utils/ImmerseSQLPlusPlus/parser"

import dc from "services/dc"
import { importableStore as store } from "store/importableStore"
import moment from "moment"
import { available_feature_flags } from "components/control-panel/available_feature_flags"
import { getFeatureFlag } from "components/control-panel/featureflags"

export const CHART_EXPORTERS = {}

export function addChartDataExporter(chartType, exporter) {
  CHART_EXPORTERS[chartType] = exporter
}

export function getChartDataExporter(chartType) {
  return CHART_EXPORTERS[chartType] ?? {}
}

export const getICChartData = (chart) => dc.getChart(chart.dcFlag).data()
export const getICChartDataSource = (chart) => chart.dataSource
export const getICChartDimensions = (chart) => chart.dimensions
export const getICChartMeasures = (chart) => chart.measures

/*
  first. call getChartData. This one is straightforward and ported.
  Next. We need to get the aliases and map them. Why? All we're doing is creating column headers
  for the charts.
*/

export default function exportChartData(chartId) {
  // get the data out of the chart instance
  // inside of our dimensional crossfilter object, dc
  const state = store.getState().charts
  const chartMetadata = state[chartId]

  // do the export
  const chartType = chartMetadata.type
  const {
    exportChartData: localExportChartData = exportICChartData
  } = getChartDataExporter(chartType)

  localExportChartData(chartMetadata, doExport)
}

export function exportICChartData(chart, localDoExport) {
  const {
    getChartData = getICChartData,
    getChartDataSource = getICChartDataSource,
    getChartDimensions = getICChartDimensions,
    getChartMeasures = getICChartMeasures
  } = getChartDataExporter(chart.type)

  const data = getChartData(chart)

  const aliases = getAliases(
    getChartDimensions(chart),
    getChartMeasures(chart),
    chart.type
  )
  const { filename, blob } = prepareBlob(
    getChartDataSource(chart),
    aliases,
    data,
    chart.type
  )
  localDoExport(filename, blob)
}

export const exportSeriesMapper = (series, chart) => {
  const colorDomain = chart.color.customDomain
  // when color dimension
  if (colorDomain) {
    const dcChart = dc.getChart(chart.dcFlag)
    const colorDomainValue = dcChart.series().keys()[series.layer]

    return series.values.map((value) => {
      const seriesData = value.data
      return {
        key0: seriesData.key0,
        key1: colorDomainValue,
        col0: seriesData[series.layer]
      }
    })
  } else {
    return series.values.map((value) => {
      const seriesData = value.data
      return {
        key0: seriesData.key0,
        col0: seriesData.val
      }
    })
  }
}

function buildColumnAliasHash(columnGroup, groupType, chartType) {
  return columnGroup.reduce((accumulator, d, i) => {
    const parsedColumn = parseColumn(d, i, groupType, chartType)
    if (typeof parsedColumn !== "undefined") {
      const { columnKey, columnAlias } = parsedColumn
      accumulator[columnKey] = columnAlias
    }
    return accumulator
  }, {})
}

// the column key is the name. UNLESS the name is "color"
// AND it's one of the magic chart types.
// AND THEN line2 has extra logic.
export function defaultGetColumnKey(
  column,
  columnIndex,
  groupType,
  excludeColumn = () => false
) {
  if (column.name && !excludeColumn(column.name)) {
    return column.name
  }

  const columnKeyStem = groupType === "dimension" ? "key" : "col"
  return `${columnKeyStem}${columnIndex}`
}

function getColumnAlias(column) {
  let columnAlias = column.label
  if (column.aggType) {
    columnAlias = `${column.aggType.toUpperCase()} ${column.label}`
  }
  return process(columnAlias, { trackUsage: false, useDisplayName: true })
}

function parseColumn(column, columnIndex, groupType, chartType) {
  // if there's no label, there's nothing to parse
  if (column.label === undefined) {
    return undefined
  }

  const { getColumnKey = defaultGetColumnKey } = getChartDataExporter(chartType)
  const columnKey = getColumnKey(column, columnIndex, groupType)

  // determine the columnAlias
  const columnAlias = getColumnAlias(column)

  return { columnKey, columnAlias }
}

export function getAliases(dimensions, measures, chartType) {
  // get the column name metadata out of the dcChart
  const dimensionsAliases = buildColumnAliasHash(
    dimensions,
    "dimension",
    chartType
  )
  const measuresAliases = buildColumnAliasHash(measures, "measure", chartType)
  return {
    ...dimensionsAliases,
    ...measuresAliases
  }
}

function defaultGetChartBlob({
  dataSource,
  chartType,
  timeStamp,
  outputData,
  fields
}) {
  const filename = `immerse-${dataSource}-${chartType}-${timeStamp}.csv`
  const csvData = parse(outputData, { fields })
  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" })
  return { filename, blob }
}

export function prepareBlob(dataSource, columnAliasesByKey, data, chartType) {
  const timeStamp = new Date(Date.now()).toISOString().replace(/[-:.]/gi, "")
  const dateFormat = getFeatureFlag(
    available_feature_flags.VEGA_COMBO_DATE_EXPORT_FORMAT
  )

  // create the output data
  // using the column aliases displayed on the chart
  // and the actual data values sent to the client
  const outputData = []

  // handle case where input data is a single number
  // this is true for the number chart
  if (typeof data === "number") {
    const rowObject = {}
    const label = columnAliasesByKey.col0
    rowObject[label] = data
    outputData.push(rowObject)
  } else if (typeof data === "string") {
    outputData.push(data)
  } else if (is(Array, data)) {
    // data is something else
    // probably an array of objects
    data.forEach((d) => {
      // using an object data structure for the row's output data
      // ensures that if a column is encoded in multiple dimensions or measures
      // it only appears once in the downloaded data
      const rowObject = {}
      Object.keys(columnAliasesByKey).forEach((key) => {
        let label = ""

        label = columnAliasesByKey[key]
        let val = d[key]
        if (val instanceof Date && !isNaN(val)) {
          // Fall back to ISO8601
          val = val.toISOString()
          if (dateFormat !== "iso8601") {
            // Try and do not fail if format doesn't work, just fall back to ISO8601
            try {
              val = moment(val).format(dateFormat)
            } catch (e) {
              // eslint-disable-next-line no-console
              console.warn(
                "Error formatting date with format ${dateFormat}, defaulting to ISO 8601",
                e
              )
            }
          }
        }
        rowObject[label] = val
      })
      outputData.push(rowObject)
    })
  } else {
    // eslint-disable-next-line no-console
    console.error(
      `chart data should be a Number, String, or Array. chart data passed is an ${typeof data}`
    )
  }

  // a list of fields to use as column headers for the csv file
  let fields = []
  if (is(Object, outputData[0])) {
    fields = Object.keys(outputData[0])
  }

  const { getChartBlob = defaultGetChartBlob } = getChartDataExporter(chartType)

  return getChartBlob({
    dataSource,
    chartType,
    timeStamp,
    outputData,
    fields
  })
}

function doExport(filename, blob) {
  if (fileSaver && typeof fileSaver.saveAs === "function") {
    fileSaver.saveAs(blob, filename)
  }
}
