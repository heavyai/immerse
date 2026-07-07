// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/*
  okay, the chartAdapterDimensionMap exists as an interop to go from chartId ->
  crossfilter dimension object. Both the stacked bar chart and combo chart have
  "fake" dcCharts which use their own custom adapters instead of actually using
  mapd-charting. And they create crossfilter dimension objects and manage them
  internally.

  So in order to get the filters out of crossfilter for a particular chart, we
  need to store this mapping somewhere externally. And, well, here it is.
*/

const chartAdapterDimensionMap = {}

// gets the mapping from chartId -> is internal crossfilter dimension
export function setChartAdapterDimensionMapping(chartId, dimension) {
  chartAdapterDimensionMap[chartId] = dimension
  return dimension
}

// given a chartId, returns its internal dimension
export function getChartAdapterDimensionMapping(chartId) {
  return chartAdapterDimensionMap[chartId]
}

export function removeChartAdapterDimensionMapping(chartId) {
  delete chartAdapterDimensionMap[chartId]
}

// get all of the mappings from chartId -> internal dimension.
export function getAllChartAdapterDimensionMappings() {
  return chartAdapterDimensionMap
}

const dcAdapterRegistry = {}

export function registerDCAdapter(chartId, dcAdapter) {
  dcAdapterRegistry[chartId] = dcAdapter
  return dcAdapter
}

export function dcAdapterForChartId(chartId) {
  return dcAdapterRegistry[chartId]
}

export function deregisterDCAdapter(chartId) {
  delete dcAdapterRegistry[chartId]
}
