// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  colorByDimensionActive,
  getColorType,
  isLineAndColorDimension,
  maybeSetMeasureState,
  setChartNextColor,
  mergeSavedColorWithColor,
  updateChart
} from "./charts-reducer-helpers"
import {
  compose,
  dissoc,
  ifElse,
  isNil,
  lensPath,
  lensProp,
  over,
  set,
  view,
  dissocPath
} from "ramda"
import { mapIdx, mergeR } from "utils/ramda-helpers"
import {
  removeSelector,
  clearSelector
} from "./helpers/selectors-collection-helpers"
import { CHARTS } from "constants/charts"
import { maybeUpdateOriginIndex } from "./helpers/selector-object-helpers"
import {
  getSelectorsForSource,
  isChartMultiSource
} from "./helpers/multi-source-helpers"

export function isFiniteSelector(selectorType, chartType) {
  switch (selectorType) {
    case "measures":
      return CHARTS[chartType].maxMeasures !== Infinity
    case "dimensions":
      return (
        CHARTS[chartType].maxDimensions !== Infinity &&
        CHARTS[chartType].maxDimensions !== 0
      )
    default:
      return false
  }
}

export const maybeRemoveColorDomainAndRange = (
  chartId,
  name,
  selectorType,
  isFinalSelector,
  multiSourceIndex,
  isMultiSource
) => (charts) => {
  const newCharts = { ...charts }
  if (
    selectorType === "dimensions" ||
    name === "color" ||
    (selectorType === "measures" && isFinalSelector)
  ) {
    if (isMultiSource) {
      newCharts[chartId] = {
        ...newCharts[chartId],
        colorDomain: null,
        color: {
          ...newCharts[chartId].color,
          [multiSourceIndex]: {
            ...newCharts[chartId].color.multiSourceIndex,
            customDomain: [],
            customRange: [],
            domainIsDirty: false
          }
        }
      }
    } else {
      newCharts[chartId] = {
        ...newCharts[chartId],
        colorDomain: null,
        color: {
          ...newCharts[chartId].color,
          customDomain: [],
          customRange: [],
          domainIsDirty: false
        }
      }
    }
  }
  return newCharts
}

export function maybeRemoveOrClearSelector(
  chartId,
  chartType,
  { index, type, inactive }
) {
  const updateSelectorBy = updateChart(chartId, type)

  return ifElse(
    () => isFiniteSelector(type, chartType) && !inactive,
    updateSelectorBy(clearSelector(index)),
    compose(
      updateSelectorBy(mapIdx(maybeUpdateOriginIndex)),
      updateSelectorBy(removeSelector(index))
    )
  )
}

export const restrictedDimensionTypeKey = "restrictedDimensionType"

const filterSetDimensions = (dimensions = []) =>
  dimensions.filter(({ label, name }) => name === "X Axis" && Boolean(label))

const maybeRemoveDimensionRestriction = (chartId) => (charts) => {
  // If it's not multisource, always unrestrict
  const chart = charts[chartId]
  if (
    !chart.multiSources ||
    filterSetDimensions(chart.dimensions).length === 0
  ) {
    return dissocPath([chartId, restrictedDimensionTypeKey])(charts)
  }

  // If it is multisource AND no x-axis dimensions are set, dissoc
  return charts
}

const maybeResetSortColumn = (selectorType, chart, chartId, selectorIndex) => (
  state
) => {
  const { sortColumn } = chart
  const sortColumnName =
    sortColumn && sortColumn.col && sortColumn.col.name
      ? sortColumn.col.name
      : ""

  const sortedBySelectedDimension =
    selectorType === "dimensions" &&
    sortColumn &&
    sortColumnName.split("key")[1] === String(selectorIndex)
  const sortedByColorMeasure =
    selectorType === "measures" && sortColumnName === "color"

  if (sortedBySelectedDimension || sortedByColorMeasure) {
    // Reset to first dimension for sort column, if removing either of the above
    const firstDimSortColumnName = "key0"
    const firstDimSortColumnLabel = chart.dimensions[0].label

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        sortColumn: {
          ...state[chartId].sortColumn,
          col: {
            ...state[chartId].sortColumn.col,
            name: firstDimSortColumnName
          },
          label: firstDimSortColumnLabel
        }
      }
    }
  } else {
    return state
  }
}

const resetCustomKey = (
  chart,
  chartId,
  selectorType,
  selectorIndex,
  value,
  multiSourceIndex
) => (state) => {
  if (
    (chart.type === "line" ||
      chart.type === "line2" ||
      chart.type === "histogram") &&
    selectorType === "dimensions" &&
    selectorIndex === 1
  ) {
    return over(
      lensProp(chartId),
      over(
        isNil(multiSourceIndex)
          ? lensProp("savedColors")
          : lensPath(["savedColors", multiSourceIndex]),
        dissoc(`custom_${value}`)
      )
    )(state)
  } else if (
    colorByDimensionActive(chart.colorByDimension, chart.dimensions) &&
    getColorType(chart) !== "quantitative" &&
    !isLineAndColorDimension(chart)
  ) {
    const customKeyIndex = parseInt(
      chart.color.customKey.replace("key", ""),
      10
    )
    return over(
      lensProp(chartId),
      compose(
        mergeSavedColorWithColor(multiSourceIndex),
        over(
          isNil(multiSourceIndex)
            ? lensProp("color")
            : lensPath(["color", multiSourceIndex]),
          (color) =>
            mergeR({
              customKey: `key${Math.max(customKeyIndex - 1, 0)}`
            })(color)
        )
      )
    )(state)
  } else {
    return state
  }
}

export default function removeSelectorReducer(
  charts,
  { chartId, selectorType, selectorIndex }
) {
  const chart = charts[chartId]
  const selectors = chart[selectorType]
  const { name, inactive, value, multiSourceIndex } = selectors[selectorIndex]
  const isFinalSelector =
    getSelectorsForSource(selectors, multiSourceIndex).filter(
      (selector) => selector.value
    ).length === 1
  const isMultiSource = isChartMultiSource(chart)

  return compose(
    maybeResetSortColumn(selectorType, chart, chartId, selectorIndex),
    resetCustomKey(
      chart,
      chartId,
      selectorType,
      selectorIndex,
      value,
      multiSourceIndex
    ),
    maybeSetMeasureState(chartId, multiSourceIndex),
    maybeRemoveColorDomainAndRange(
      chartId,
      name,
      selectorType,
      isFinalSelector,
      multiSourceIndex,
      isMultiSource
    ),
    setChartNextColor(chartId, multiSourceIndex),
    maybeRemoveColorByDimension(chartId, selectorType),
    maybeRemoveDimensionRestriction(chartId),
    maybeRemoveOrClearSelector(chartId, chart.type, {
      index: selectorIndex,
      type: selectorType,
      inactive
    })
  )(charts)
}

// TODO: multiSource
// Figure out what use case in UI hits this and if it needs to be fixed
// for multi-source color hash
function maybeRemoveColorByDimension(chartId, selectorType) {
  const colorIsCustomLens = lensPath([chartId, "color", "isCustom"])
  const colorByDimensionLens = lensPath([chartId, "colorByDimension"])
  return (charts) => {
    // Clear color by dimension if any dimension is removed
    if (selectorType === "dimensions" && view(colorByDimensionLens, charts)) {
      return compose(
        set(colorByDimensionLens, null),
        set(colorIsCustomLens, false)
      )(charts)
    } else {
      return charts
    }
  }
}
