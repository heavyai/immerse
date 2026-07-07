// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { CHARTS, CHART_TYPES, namedMeasures } from "constants/charts"
import { findIndex, lensPath, path, prop, propEq, set } from "ramda"
import {
  setChart,
  updateDimensions,
  updateMeasures,
  updatePostFilters
} from "reducers/charts/charts-reducer-helpers"
import { createChartColor } from "reducers/charts/helpers/color-helpers"
import compose from "recompose/compose"
import { mapIdx } from "utils/ramda-helpers"
import { maybeSetActive } from "./helpers/selectors-collection-helpers"
import { updateDimensionNames } from "./helpers/dimension-object-helpers"
import { updateSelectionsIsRequired } from "./helpers/selector-object-helpers"
import { updateMeasureNames } from "./helpers/measure-object-helpers"
import { isRasterPointChart } from "charts/raster-chart/raster-utils"
import {
  getXAxisDimension,
  isXAxisDimension,
  isColorDimension
} from "reducers/charts/helpers/multi-source-helpers"
import { addInitialDataToChart } from "charts/utils/initialize-new-chart"
import { cleanupChartData } from "charts/utils/cleanup-chart-data"

const SORTABLE_CHART_TYPES = ["pie", "row", "bar"]

function defaultSortForChart(type, defaultVal) {
  return type === "scatter" ? "countval" : defaultVal
}

function measureToTable(index, { aggType, value }) {
  return {
    agg_mode: aggType,
    expression: value,
    name: `col${index}`
  }
}

function convertToTable(sortColumn, prevMeasures, offset) {
  const indexOfMeasure = findIndex(propEq("name", sortColumn.col.name))(
    prevMeasures
  )
  if (indexOfMeasure < 0) {
    return null
  }
  return set(
    lensPath(["col"]),
    measureToTable(indexOfMeasure, prevMeasures[indexOfMeasure]),
    set(lensPath(["index"]), indexOfMeasure + offset, sortColumn)
  )
}

function convertGeneric(
  sortColumn,
  prevChartType,
  chartType,
  measures,
  offset
) {
  if (sortColumn.col.name === "countval") {
    return sortColumn
  }
  const chartMeasures = namedMeasures(chartType)
  const index = sortColumn.index - offset
  const measure = chartMeasures[index]
  const sortName = sortColumn.col.name

  if (prevChartType === "table" || sortColumnTableShapeCheck(sortColumn)) {
    const update = measure
      ? measure.name
      : defaultSortForChart(chartType, sortName)
    return set(lensPath(["col", "name"]), update, sortColumn)
  } else {
    const measuresEql = measure && measure.name === sortName
    const update = measuresEql
      ? measure.name
      : defaultSortForChart(chartType, sortName)
    return set(lensPath(["col", "name"]), update, sortColumn)
  }
}

function sortColumnTableShapeCheck({ col: { name } }) {
  return name.includes("col") && name !== "color"
}

function nextChartTypeIsSorted(nextChartType) {
  return SORTABLE_CHART_TYPES.includes(nextChartType)
}

function validateSortColumnBar(sortColumn) {
  const validSortColumnNames = ["val", "key0"]
  const validOrderNames = ["asc", "desc"]
  let colName = path(["col", "name"], sortColumn)
  let orderName = prop("order", sortColumn)

  if (validSortColumnNames.indexOf(colName) === -1) {
    colName = "val"
  }

  if (validOrderNames.indexOf(orderName) === -1) {
    orderName = "desc"
  }

  return {
    ...sortColumn,
    order: orderName,
    col: {
      ...sortColumn.col,
      name: colName
    }
  }
}

export function updateSortColumn(
  nextChartType,
  {
    sortColumn,
    measures: prevMeasures,
    dimensions: prevDimensions,
    type: prevChartType
  }
) {
  // eslint-disable-next-line no-eq-null,eqeqeq
  if (sortColumn == null) {
    if (!nextChartTypeIsSorted(nextChartType)) {
      return sortColumn
    } else {
      return {
        col: { name: defaultSortForChart(nextChartType, "val") },
        index: prevDimensions.length - 1,
        order: "desc"
      }
    }
  }

  // prettier-ignore
  if (sortColumn.col.name && sortColumn.col.name.includes("key")) {
    const index = Number(
      sortColumn.col.name.slice(sortColumn.col.name.length - 1)
    )
    return set(lensPath(["index"]), index, sortColumn)
  } else if (
    nextChartType === "table" &&
    !sortColumnTableShapeCheck(sortColumn)
  ) {
    return convertToTable(sortColumn, prevMeasures, prevDimensions.length - 1)
  } else if (!nextChartTypeIsSorted(nextChartType)) {
    return sortColumn
  } else if (nextChartType === "bar") {
    return validateSortColumnBar(sortColumn)
  } else {
    return convertGeneric(
      sortColumn,
      prevChartType,
      nextChartType,
      prevMeasures,
      prevDimensions.length - 1
    )
  }
}

function disableBinningForRaster(type) {
  return function disableBinningForRasterThunk(dimension) {
    if (
      type === "geoheat" ||
      type === "pointmap" ||
      type === "backendScatter" ||
      type === CHART_TYPES.CONTOUR
    ) {
      return {
        ...dimension,
        isBinned: false,
        isBinnable: false
      }
    } else {
      return dimension
    }
  }
}

function maybeSetShowOther(showOther, chartType) {
  return (selectors) =>
    showOther && chartType === "line2"
      ? selectors.map((selector) =>
          isColorDimension(selector) ? { ...selector, showOther } : selector
        )
      : selectors
}

export function updateDimensionsForChart(chartId, chartType) {
  return (state) =>
    updateDimensions(
      chartId,
      compose(
        mapIdx(disableBinningForRaster(chartType)),
        updateSelectionsIsRequired("dimensions", chartType),
        mapIdx(updateDimensionNames(chartType)),
        maybeSetActive("dimensions", chartType),
        maybeSetShowOther(state[chartId].showOther, chartType)
      )
    )(state)
}

export function updateMeasuresForChart(chartId, chartType) {
  return updateMeasures(
    chartId,
    compose(
      updateSelectionsIsRequired("measures", chartType),
      mapIdx(updateMeasureNames(chartType)),
      maybeSetActive("measures", chartType)
    )
  )
}

export function updatePostFilterForChart(chartId, chartType) {
  if (isRasterPointChart(chartType)) {
    return updatePostFilters(
      chartId,
      compose(
        updateSelectionsIsRequired("postFilters", chartType),
        maybeSetActive("postFilters", chartType)
      )
    )
  } else {
    return (state) => state
  }
}

const chartsWithNullDimensions = new Set([
  "table",
  "vega-combo",
  "bar",
  "row",
  "pie",
  "scatter",
  "heat"
])
function shouldShowNullDimensions(chartType) {
  return chartsWithNullDimensions.has(chartType)
}

const chartsWithoutNullMeasures = new Set(["heat", "row", "scatter", "pie"])
function shouldHideNullMeasures(chartType) {
  return chartsWithoutNullMeasures.has(chartType)
}

export function updateNullDimensionsForChart(chartId, chartType) {
  return (state) => {
    if (
      state[chartId].showNullDimensions === shouldShowNullDimensions(chartType)
    ) {
      return state
    }
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        showNullDimensions: shouldShowNullDimensions(chartType)
      }
    }
  }
}

export function updateNullMeasuresForChart(chartId, chartType) {
  return (state) => {
    if (shouldHideNullMeasures(chartType)) {
      return {
        ...state,
        [chartId]: {
          ...state[chartId],
          showNullMeasures: false
        }
      }
    }
    return state
  }
}

export function updateColor(chartId, nextType) {
  return function updateChartColor(state) {
    const nextColor = createChartColor(state[chartId], nextType)

    return setChart(chartId, "color", nextColor)(state)
  }
}

// If going to anything that is *not* choropleth, but there is a geojoin,
// filter any measures with the geojoin table
export function filterGeojoinMeasures(chartId) {
  return (charts) => {
    const chart = charts[chartId]

    if (chart.geoJoin) {
      charts[chartId] = {
        ...chart,
        measures: chart.measures.filter(
          (measure) => measure.table !== chart.geoJoin.table
        )
      }
    }

    return charts
  }
}

function maybeUpdateFilterString(chartId, nextChartType) {
  if (nextChartType === "line2") {
    return (state) => {
      const chart = state[chartId]
      if (
        chart &&
        chart.filterString &&
        typeof chart.filterString === "string"
      ) {
        return {
          ...state,
          [chartId]: {
            ...chart,
            filterString: {
              0: chart.filterString
            }
          }
        }
      }
      return state
    }
  }
  return (state) => state
}

function setPostFilter(chartId, chartType) {
  if (isRasterPointChart(chartType)) {
    return (state) =>
      setChart(chartId, "postFilters", CHARTS[chartType].postFilters)(state)
  } else {
    return (state) => state
  }
}

function setCapValue(chartId, chartType) {
  if (chartType === "backendChoropleth") {
    // Using different name for BE Choropleth sampling cap value since we introduced sampling later and
    // needed to apply the new defaultCap to existing Choropleth charts
    return (state) =>
      setChart(
        chartId,
        "polyCap",
        CHARTS[chartType].defaultCap || state[chartId].polyCap
      )(state)
  } else {
    return (state) =>
      setChart(
        chartId,
        "cap",
        CHARTS[chartType].defaultCap || state[chartId].cap
      )(state)
  }
}

// If we're switching from an old version of line chart to combo, then
// sometimes the `timeBin` property doesn't exist on the x-axis dimension,
// which causes all sorts of issues when generating combo SQL. So, add
// a timeBin property
function setTimeBinIfEmpty(chartId, nextChartType) {
  return function updateTimeBinIfEmpty(state) {
    const chartState = state[chartId]
    const prevChartType = chartState.type
    if (prevChartType === "line" && nextChartType === "line2") {
      const xAxisDimension = getXAxisDimension(state[chartId].dimensions)
      if (xAxisDimension && typeof xAxisDimension.timeBin === "undefined") {
        const dimensionsWithFixedTimeBin = chartState.dimensions.map((dim) =>
          isXAxisDimension(dim) ? { ...dim, timeBin: "auto" } : dim
        )
        return {
          ...state,
          [chartId]: {
            ...chartState,
            dimensions: dimensionsWithFixedTimeBin
          }
        }
      }
    }
    return state
  }
}

function setInitialChartData(chartId, nextChartType) {
  return function updateInitialChartData(state) {
    const chartState = state[chartId]
    const newChart = addInitialDataToChart(nextChartType, chartState)

    if (chartState === newChart) {
      return state
    } else {
      return { ...state, [chartId]: newChart }
    }
  }
}

function cleanupOldChartData(chartId) {
  return function getCleanedUpChart(state) {
    const chartState = state[chartId]
    const newChart = cleanupChartData(chartState.type, chartState)

    if (chartState === newChart) {
      return state
    } else {
      return { ...state, [chartId]: newChart }
    }
  }
}

export default function reducer(state, { chartId, chartType }) {
  return compose(
    setInitialChartData(chartId, chartType),
    setChart(chartId, "hasError", false),
    setChart(chartId, "dataError", false),
    setChart(chartId, "type", chartType),
    updateColor(chartId, chartType),
    updateDimensionsForChart(chartId, chartType),
    updateMeasuresForChart(chartId, chartType),
    updatePostFilterForChart(chartId, chartType),
    updateNullDimensionsForChart(chartId, chartType),
    updateNullMeasuresForChart(chartId, chartType),
    filterGeojoinMeasures(chartId),
    setChart(chartId, "filters", []),
    maybeUpdateFilterString(chartId, chartType),
    setChart(chartId, "colorDomain", null),
    setCapValue(chartId, chartType),
    setChart(
      chartId,
      "sortColumn",
      updateSortColumn(chartType, state[chartId])
    ),
    setChart(chartId, "isNotDc", CHARTS[chartType].isNotDc),
    setPostFilter(chartId, chartType),
    setTimeBinIfEmpty(chartId, chartType),
    setChart(chartId, "data", undefined),
    setChart(chartId, "opacity", undefined),
    cleanupOldChartData(chartId)
  )(state)
}
