// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  X_AXIS_DIMENSION_LABEL,
  COLOR_DIMENSION_LABEL
} from "charts/combo/line-chart2/line2-consts"
import {
  Dimension,
  MultiSourceIndex,
  Selector,
  SelectorIndex
} from "constants/prop-types"
import { find, findIndex, is, isEmpty, isNil, take, toPairs } from "ramda"
import { ChartState } from "reducers/charts/charts-reducer-types"

// Given an input seekIndex, returns a function that will robustly match it against an inputIndex
const matchIndex = (seekIndex: MultiSourceIndex) => (
  inputIndex: MultiSourceIndex
): boolean =>
  (typeof inputIndex === "undefined" ? "0" : String(inputIndex)) ===
  String(seekIndex)

// Given a chart object, return whether it is in single-source mode (no accordion)
// or multi-source mode (accordion visible, even if only with one source)
export const isChartMultiSource = (chart: ChartState): boolean =>
  is(Object, chart.multiSources) && Object.keys(chart.multiSources).length > 0

// Given a list of selectors (dimensions or measures), return a new list
// with only the selectors for the specified multiSource, by index,
// or the entire original list if undefined
export const getSelectorsForSource = (
  selectors: Selector[],
  multiSourceIndex?: MultiSourceIndex
) => {
  if (isNil(multiSourceIndex)) {
    return selectors
  } else {
    const matcher = matchIndex(multiSourceIndex)
    return selectors.filter((selector) => matcher(selector.multiSourceIndex))
  }
}

// Invoke a callback with parameters (selector, index) for every selector
// in a list, or for every selector for the specified multiSource
export const forEachSelectorInSource = (
  callback: (selector: Selector, index: SelectorIndex) => void,
  selectors: Selector[],
  multiSourceIndex?: MultiSourceIndex
) => {
  if (isNil(multiSourceIndex)) {
    return selectors.forEach(callback)
  } else {
    const matcher = matchIndex(multiSourceIndex)

    return selectors.forEach(
      (selector, index) =>
        matcher(selector.multiSourceIndex) && callback(selector, index)
    )
  }
}

// The absolute index in the full (all sources) selector list
type TrueSelectorIndex = SelectorIndex

// Given a selector list over all multiSources and an absolute selector index
// understood to be within a single source, return the selector's "true"
// index in the full list accounting for multiSources
export const getTrueSelectorIndex = (
  selectors: Selector[],
  selectorIndexInSource: SelectorIndex,
  multiSourceIndex: MultiSourceIndex
): TrueSelectorIndex => {
  if (isNil(multiSourceIndex)) {
    return selectorIndexInSource
  } else {
    const selectorPairs = toPairs(selectors)
    const matcher = matchIndex(multiSourceIndex)

    const selectorPairsForSource = selectorPairs.filter(([, selector]) =>
      matcher(selector.multiSourceIndex)
    )

    return selectorPairsForSource[selectorIndexInSource][0]
  }
}

// Counterpart to getTrueSelectorIndex - given a true selector index,
// returns the selector's positional index within only its own source
export const getSelectorIndexInSource = (
  selectors: Selector[],
  selectorIndex: TrueSelectorIndex
): SelectorIndex => {
  const selectorsBeforeIndex = take(Number(selectorIndex), selectors)
  const multiSourceIndex = selectors[selectorIndex].multiSourceIndex

  return selectorsBeforeIndex.reduce(
    (count, selector) =>
      selector.multiSourceIndex === multiSourceIndex ? count + 1 : count,
    0
  )
}

// Returns the first true selector index in a source
export const firstSelectorIndexInSource = (
  selectors: Selector[],
  multiSourceIndex?: MultiSourceIndex
): TrueSelectorIndex => {
  if (isNil(multiSourceIndex)) {
    return 0
  } else {
    const matcher = matchIndex(multiSourceIndex)

    return findIndex(
      (selector) => matcher(selector.multiSourceIndex),
      selectors
    )
  }
}

// Base helper to match a given dimension by name
export const dimensionMatchesName = (
  dimension: Dimension,
  dimensionName: string
) => dimension.name === dimensionName

// Returns true if the given dimension is the "X Axis" dimension
export const isXAxisDimension = (dimension: Dimension): boolean =>
  dimensionMatchesName(dimension, X_AXIS_DIMENSION_LABEL)

// Returns the "X Axis" dimension given a multiSourceIndex. If none is provided
// returns the single-source "X Axis" dimension.
export const getXAxisDimension = (
  dimensions: Dimension[],
  multiSourceIndex?: MultiSourceIndex
) => {
  // single source
  if (isNil(multiSourceIndex)) {
    return find((dimension) => isXAxisDimension(dimension), dimensions)
  } else {
    const matcher = matchIndex(multiSourceIndex)

    return find(
      (dimension) =>
        isXAxisDimension(dimension) && matcher(dimension.multiSourceIndex),
      dimensions
    )
  }
}

export const getAllXAxisDimensionsForChart = (
  dimensions: Dimension[]
): Dimension[] => dimensions.filter(isXAxisDimension)

// Gets current x-axis domain for all x-axis dimensions in a given chart
// - based on dimension.currentLowValue, dimension.currentHighValue
export const getCurrentXAxisDomainForChart = (
  dimensions: Dimension[]
): any[] => {
  const xAxisDimensionsForChart = getAllXAxisDimensionsForChart(dimensions)
  const min = Math.min(
    ...xAxisDimensionsForChart.map((dimension) => dimension.currentLowValue)
  )
  const max = Math.max(
    ...xAxisDimensionsForChart.map((dimension) => dimension.currentHighValue)
  )
  return [min, max]
}

// Returns the index of the "X Axis" dimension in the dimensions array given a multiSourceIndex.
// If none is provided returns the single-source "X Axis" dimension index (i.e. 0).
export const getXAxisDimensionIndex = (
  dimensions: Dimension[],
  multiSourceIndex?: MultiSourceIndex
) => {
  // single source
  if (isNil(multiSourceIndex)) {
    return findIndex((dimension) => isXAxisDimension(dimension), dimensions)
  } else {
    const matcher = matchIndex(multiSourceIndex)

    return findIndex(
      (dimension) =>
        isXAxisDimension(dimension) && matcher(dimension.multiSourceIndex),
      dimensions
    )
  }
}

// Returns true if the given dimension is the "Color" dimension
export const isColorDimension = (dimension: Dimension) =>
  dimensionMatchesName(dimension, COLOR_DIMENSION_LABEL)

// Returns the "Color" dimension given a multiSourceIndex. If none is provided
// returns the single-source "Color" dimension.
export const getColorDimension = (
  dimensions: Dimension[],
  multiSourceIndex?: MultiSourceIndex
) => {
  // single source
  if (isNil(multiSourceIndex)) {
    return find((dimension) => isColorDimension(dimension), dimensions)
  } else {
    const matcher = matchIndex(multiSourceIndex)

    return find(
      (dimension) =>
        isColorDimension(dimension) && matcher(dimension.multiSourceIndex),
      dimensions
    )
  }
}

// Returns the index of the "Color" dimension in the dimensions array given a multiSourceIndex.
// If none is provided returns the single-source "Color" dimension index (i.e. 1).
export const getColorDimensionIndex = (
  dimensions: Dimension[],
  multiSourceIndex?: MultiSourceIndex
) => {
  // single source
  if (isNil(multiSourceIndex)) {
    return findIndex((dimension) => isColorDimension(dimension), dimensions)
  } else {
    const matcher = matchIndex(multiSourceIndex)

    return findIndex(
      (dimension) =>
        isColorDimension(dimension) && matcher(dimension.multiSourceIndex),
      dimensions
    )
  }
}

// Returns the dataSource for a given multiSourceIndex. Accepts full chartState
// and will return the old single-string dataSource value if not multi source.
export const getDataSource = (
  chart: ChartState,
  multiSourceIndex: MultiSourceIndex
) =>
  isChartMultiSource(chart)
    ? chart.multiSources[multiSourceIndex].table
    : chart.dataSource

// Return whether the original chart state (prior to mapping in the continer) is multi source
// Basically, checks for one or more data source with a defined 'table'
export const chartStateIsMulti = (chart: ChartState): boolean => {
  const singleDataSource = chart.dataSource
  const multiDataSources = chart.multiSources
  const sources = singleDataSource
    ? { 0: { table: singleDataSource, index: 0 } }
    : multiDataSources
  const result = Object.keys(sources).reduce(
    (agg, key) => (sources[key].table ? { ...agg, [key]: sources[key] } : agg),
    {}
  )

  const keys = Object.keys(result || {})
  return Boolean(keys.length && keys.length > 1)
}

// Returns the actual multiSourceIndex (e.g. the key of the source in chart.multiSources)
// from a positional multiSourceIndex (e.g. the Fold's position within the Accordion component).
// Useful when trying to do multiSource logic from within components that are only index-aware (e.g. colors).
export const convertPositionalIndexMultiSourceIndex = (
  chart: ChartState,
  positionalIndex: MultiSourceIndex
) =>
  isNil(chart.multiSources) || isEmpty(chart.multiSources)
    ? positionalIndex
    : Object.keys(chart.multiSources)[positionalIndex]
