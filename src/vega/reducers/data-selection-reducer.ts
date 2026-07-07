// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { produce } from "immer"
import * as dataSelectionConstants from "vega/constants/data-selection-action-types"
import {
  getLayerIndex,
  createVegaComboDataSelection,
  createMarkSettings
} from "vega/utils/data-selection"
import { VegaMarkTypes } from "vega/constants/data-selection-types"
import { CHART_TYPES } from "constants/chart-types"

// Default sort column is the first dimension
const DEFAULT_SORT_COLUMN = "dimension0"

const getSortColumnSelectorIndex = (chart, selectorType) => {
  const { vegaSortColumn } = chart
  const sortColumnName = vegaSortColumn?.col?.name || ""
  return vegaSortColumn && sortColumnName.split(selectorType)[1]
}

const updateSortColumn = (
  selectorType,
  chart,
  dimensions,
  selectorIndex,
  selectorName
) => {
  const { vegaSortColumn } = chart
  const sortColumnName =
    vegaSortColumn && vegaSortColumn.col && vegaSortColumn.col.name
      ? vegaSortColumn.col.name
      : ""

  const sortedByRemovedSelector =
    `${selectorType}${selectorIndex}` === sortColumnName ||
    (sortColumnName === "measureColor" && selectorName === "color")

  if (dimensions.xAxis.length && sortedByRemovedSelector) {
    // Reset to first dimension for sort column, if removing sort column selector
    return {
      ...vegaSortColumn,
      col: {
        ...vegaSortColumn.col,
        name: DEFAULT_SORT_COLUMN
      }
    }
  } else {
    return vegaSortColumn
  }
}

// TODO: abstract the top level chart reducer portion out
export default {
  [dataSelectionConstants.ADD_DATA_SELECTION](state, { chartId }) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections: [
          ...state[chartId].dataSelections,
          createVegaComboDataSelection()
        ]
      }
    }
  },

  [dataSelectionConstants.REMOVE_DATA_SELECTION](state, { chartId, layerId }) {
    const dataSelections = [...state[chartId].dataSelections]
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const { [layerId]: _, ...collapsedLegendLayers } = state[
      chartId
    ].collapsedLegendLayers

    dataSelections.splice(dataSelectionIndex, 1)
    if (state[chartId].data) {
      const data = Object.fromEntries(
        Object.entries(state[chartId].data).map(([dataKey, chartData]) => {
          const newChartData = [...chartData]
          newChartData.splice(dataSelectionIndex, 1)
          return [dataKey, newChartData]
        })
      )

      return {
        ...state,
        [chartId]: {
          ...state[chartId],
          dataSelections,
          data,
          collapsedLegendLayers
        }
      }
    } else {
      return {
        ...state,
        [chartId]: {
          ...state[chartId],
          dataSelections,
          collapsedLegendLayers
        }
      }
    }
  },

  [dataSelectionConstants.SET_SELECTED_DATA_SELECTION](
    state,
    { chartId, layerId }
  ) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        selectedLayerId: layerId
      }
    }
  },

  [dataSelectionConstants.SET_TABLE](state, { chartId, layerId, name }) {
    const dataSelections = [...state[chartId].dataSelections]
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]

    if (dataSelection.table && name === dataSelection.table.name) {
      return state
    }

    // Reset the data selection to an initial state if the table is changing
    dataSelections[dataSelectionIndex] = {
      ...createVegaComboDataSelection(),
      layerId: dataSelection.layerId,
      table: {
        name
      }
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [dataSelectionConstants.SET_DIMENSION](
    state,
    { chartId, layerId, dimensionName, dimensionIndex, expression }
  ) {
    const dataSelections = Array.from(state[chartId].dataSelections)
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]

    const dimensions = {
      ...dataSelection.dimensions
    }

    if (dimensionIndex === null) {
      dimensions[dimensionName] = expression
    } else {
      dimensions[dimensionName] = Array.from(dimensions[dimensionName])
      dimensions[dimensionName][dimensionIndex] = expression
    }

    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      dimensions
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [dataSelectionConstants.CLEAR_TABLE](state, { chartId, layerId }) {
    const dataSelections = [...state[chartId].dataSelections]
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    // Reset the data selection to an initial state
    dataSelections[dataSelectionIndex] = {
      ...createVegaComboDataSelection(),
      layerId: dataSelections[dataSelectionIndex].layerId
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [dataSelectionConstants.CLEAR_DIMENSION](
    state,
    { chartId, layerId, dimensionName, dimensionIndex }
  ) {
    const dataSelections = Array.from(state[chartId].dataSelections)
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]

    const dimensions = {
      ...dataSelection.dimensions
    }

    if (dimensionIndex === null) {
      dimensions[dimensionName] = null
    } else {
      dimensions[dimensionName] = Array.from(dimensions[dimensionName])
      dimensions[dimensionName].splice(dimensionIndex, 1)
    }

    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      dimensions
    }

    // If we're clearing a color dimension, we want to reset
    // state.chart.layersLegendPinned (set it to false)
    const layersLegendPinned =
      dimensionName === "color" ? false : state[chartId].layersLegendPinned

    const sortColumn = updateSortColumn(
      "dimension",
      state[chartId],
      dimensions,
      dimensionIndex,
      dimensionName
    )

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections,
        vegaSortColumn: sortColumn,
        layersLegendPinned
      }
    }
  },

  [dataSelectionConstants.CLEAR_CUSTOM_DIMENSIONS_BY_VALUE](
    state,
    { chartId, value }
  ) {
    const newDataSelections = [...state[chartId].dataSelections]
    const { vegaSortColumn } = state[chartId]
    let { layersLegendPinned } = state[chartId]
    const sortColumn = { ...vegaSortColumn }
    const removedDimensionIndices: number[] = []

    state[chartId].dataSelections.forEach((ds, i) => {
      const newDimensionsByName = { ...ds.dimensions }
      Object.keys(newDimensionsByName).forEach((dimensionName) => {
        if (Array.isArray(newDimensionsByName[dimensionName])) {
          newDimensionsByName[dimensionName] = newDimensionsByName[
            dimensionName
          ].filter((di) => {
            const remove =
              (di.sharedCustom || di.globalCustom) && di.sql === value

            if (remove) {
              removedDimensionIndices.push(i)
            }
            return !remove
          })
        } else if (
          (newDimensionsByName[dimensionName]?.sharedCustom ||
            newDimensionsByName[dimensionName]?.globalCustom) &&
          newDimensionsByName[dimensionName].sql === value
        ) {
          if (dimensionName === "color") {
            layersLegendPinned = false
          }
          delete newDimensionsByName[dimensionName]
        }
      })
      newDataSelections[i] = {
        ...newDataSelections[i],
        dimensions: newDimensionsByName
      }
    })

    const sortDimensionIndex = getSortColumnSelectorIndex(
      state[chartId],
      "dimension"
    )

    if (
      removedDimensionIndices.includes(sortDimensionIndex) &&
      newDataSelections.xAxis.length
    ) {
      sortColumn.col = {
        ...vegaSortColumn.col,
        name: DEFAULT_SORT_COLUMN
      }
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections: newDataSelections,
        vegaSortColumn: sortColumn,
        layersLegendPinned
      }
    }
  },

  [dataSelectionConstants.CLEAR_CUSTOM_MEASURES_BY_VALUE](
    state,
    { chartId, value }
  ) {
    const newDataSelections = [...state[chartId].dataSelections]
    const removedMeasureIndices: number[] = []
    const { vegaSortColumn } = state[chartId]
    const sortColumn = { ...vegaSortColumn }

    state[chartId].dataSelections.forEach((ds, i) => {
      const newMeasuresByName = { ...ds.measures }
      Object.keys(newMeasuresByName).forEach((measureName) => {
        if (Array.isArray(newMeasuresByName[measureName])) {
          newMeasuresByName[measureName] = newMeasuresByName[
            measureName
          ].filter((di) => {
            const remove =
              (di.sharedCustom || di.globalCustom) && di.sql === value

            if (remove) {
              removedMeasureIndices.push(i)
            }
            return !remove
          })
        } else if (
          (newMeasuresByName[measureName]?.sharedCustom ||
            newMeasuresByName[measureName]?.globalCustom) &&
          newMeasuresByName[measureName].sql === value
        ) {
          delete newMeasuresByName[measureName]

          if (
            measureName === "color" &&
            vegaSortColumn?.col?.name === "measureColor"
          ) {
            sortColumn.col = {
              ...vegaSortColumn.col,
              name: DEFAULT_SORT_COLUMN
            }
          }
        }
      })

      newDataSelections[i] = {
        ...newDataSelections[i],
        measures: newMeasuresByName
      }
    })

    const sortMeasureIndex = getSortColumnSelectorIndex(
      state[chartId],
      "measure"
    )

    if (
      removedMeasureIndices.includes(sortMeasureIndex) &&
      newDataSelections.xAxis.length
    ) {
      sortColumn.col = {
        ...vegaSortColumn.col,
        name: DEFAULT_SORT_COLUMN
      }
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections: newDataSelections,
        sortColumn
      }
    }
  },

  [dataSelectionConstants.SET_MEASURE](
    state,
    { chartId, layerId, measureName, measureIndex, expression, markColor }
  ) {
    const chart = state[chartId]
    const dataSelections = Array.from(chart.dataSelections)
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = chart.dataSelections[dataSelectionIndex]

    const measures = {
      ...dataSelection.measures
    }
    const markType =
      chart.type === CHART_TYPES.BOX_PLOT
        ? VegaMarkTypes.BOX
        : VegaMarkTypes.BAR

    if (measureIndex === null) {
      measures[measureName] = {
        ...expression,
        // This is a new measure. Give it our default mark settings
        markSettings: createMarkSettings(markType)
      }
    } else {
      measures[measureName] = Array.from(measures[measureName])
      measures[measureName][measureIndex] = {
        ...expression,
        linkedTimeLagId:
          dataSelections[dataSelectionIndex]?.measures[measureName]?.[
            measureIndex
          ]?.linkedTimeLagId,
        markSettings:
          // Persist existing mark settings or create new ones
          dataSelections[dataSelectionIndex]?.measures[measureName]?.[
            measureIndex
          ]?.markSettings || createMarkSettings(markType, markColor)
      }
      if (measures[measureName][measureIndex].linkedTimeLagId) {
        const linkedTimeLagMeasureIndex = measures[measureName].findIndex(
          ({ id }) => id === measures[measureName][measureIndex].linkedTimeLagId
        )
        if (linkedTimeLagMeasureIndex > -1) {
          delete expression.markSettings
          measures[measureName][linkedTimeLagMeasureIndex] = {
            ...measures[measureName][linkedTimeLagMeasureIndex],
            measure: {
              ...expression
            }
          }
        }
      }
    }

    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      measures
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [dataSelectionConstants.CLEAR_MEASURE](
    state,
    { chartId, layerId, measureName, measureIndex }
  ) {
    const dataSelections = Array.from(state[chartId].dataSelections)
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]

    const measures = {
      ...dataSelection.measures
    }

    if (measureIndex === null) {
      measures[measureName] = null
    } else {
      measures[measureName] = Array.from(measures[measureName])
      const [removedMeasure] = measures[measureName].splice(measureIndex, 1)
      if (removedMeasure.linkedTimeLagId) {
        const linkedTimeLagMeasureIndex = measures[measureName].findIndex(
          ({ id }) => id === removedMeasure.linkedTimeLagId
        )
        if (linkedTimeLagMeasureIndex > -1) {
          measures[measureName].splice(linkedTimeLagMeasureIndex, 1)
        }
      }
    }

    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      measures,
      measureTopNOptions: undefined
    }

    const sortColumn = updateSortColumn(
      "measure",
      state[chartId],
      dataSelection.dimensions,
      measureIndex,
      measureName
    )

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections,
        vegaSortColumn: sortColumn
      }
    }
  },

  [dataSelectionConstants.SET_BASE_DIMENSION_SORT_OPTIONS](
    state,
    { chartId, vegaSortColumn }
  ) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        vegaSortColumn
      }
    }
  },

  [dataSelectionConstants.UPDATE_BASE_DIMENSION_SORT_COLUMN](
    state,
    { chartId, columnName }
  ) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        vegaSortColumn: {
          ...state[chartId].vegaSortColumn,
          col: {
            ...state[chartId].vegaSortColumn.col,
            name: columnName
          }
        }
      }
    }
  },

  [dataSelectionConstants.UPDATE_BASE_DIMENSION_SORT_ORDER](
    state,
    { chartId, order }
  ) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        vegaSortColumn: {
          ...state[chartId].vegaSortColumn,
          order
        }
      }
    }
  },

  [dataSelectionConstants.SET_NUMBER_OF_GROUPS](
    state,
    { chartId, numberOfGroups }
  ) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        numberOfGroups
      }
    }
  },
  [dataSelectionConstants.SET_VIOLIN_DISTRIBUTION_PRECISION]: produce(
    (state, { chartId, violinDistributionPrecision }) => {
      state[chartId].violinDistributionPrecision = violinDistributionPrecision
    }
  ),

  [dataSelectionConstants.SET_NULL_DIMENSIONS_ENABLED](
    state,
    { chartId, enabled }
  ) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        showNullDimensions: enabled
      }
    }
  },

  [dataSelectionConstants.SET_CONNECT_NULLS_ACROSS_GAPS](
    state,
    { chartId, enabled }
  ) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        connectNullsAcrossGaps: enabled
      }
    }
  },

  [dataSelectionConstants.SET_RANGE_CHART_ENABLED](
    state,
    { chartId, enabled }
  ) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        rangeChartEnabled: enabled
      }
    }
  },

  [dataSelectionConstants.SET_LEGEND_ENABLED](state, { chartId, enabled }) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        legendEnabled: enabled
      }
    }
  },

  [dataSelectionConstants.SET_GRID_ENABLED](state, { chartId, enabled }) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        gridEnabled: enabled
      }
    }
  },

  [dataSelectionConstants.SET_BAR_VALUES_ENABLED](state, { chartId, enabled }) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        barValuesEnabled: enabled
      }
    }
  },

  [dataSelectionConstants.SET_BOX_PLOT_CENTER_LINE_TYPE]: produce(
    (state, { chartId, lineType }) => {
      state[chartId].centerLineType = lineType
    }
  ),

  [dataSelectionConstants.SET_OUTLIERS_ENABLED]: produce(
    (state, { chartId, enabled }) => {
      state[chartId].outliersEnabled = enabled
    }
  )
}
