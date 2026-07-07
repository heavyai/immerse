// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const SELECT_DATA_SOURCE_REQUEST = "SELECT_DATA_SOURCE_REQUEST"
export const SELECT_DATA_SOURCE = "SELECT_DATA_SOURCE"
export const SELECT_GEO_JOIN_DATA_SOURCE_REQUEST =
  "SELECT_GEO_JOIN_DATA_SOURCE_REQUEST"
export const SELECT_GEO_JOIN_DATA_SOURCE = "SELECT_GEO_JOIN_DATA_SOURCE"
export const CLEAR_GEO_JOIN_DATA_SOURCE_REQUEST =
  "CLEAR_GEO_JOIN_DATA_SOURCE_REQUEST"
export const DATA_SOURCE_UPDATED = "DATA_SOURCE_UPDATED"

export function selectDataSource(chartId, dataSource, multiSourceIndex) {
  return {
    type: SELECT_DATA_SOURCE_REQUEST,
    chartId,
    dataSource,
    multiSourceIndex
  }
}

export function dataSourceUpdated(dataSource, columnMetadata) {
  return {
    type: DATA_SOURCE_UPDATED,
    dataSource,
    columnMetadata
  }
}

export function setSource(
  chartId,
  dataSource,
  columnMetaData,
  multiSourceIndex
) {
  return {
    type: SELECT_DATA_SOURCE,
    chartId,
    dataSource,
    columnMetaData,
    multiSourceIndex
  }
}

export function selectJoinDataSource(chartId, dataSource) {
  return {
    type: SELECT_GEO_JOIN_DATA_SOURCE_REQUEST,
    chartId,
    dataSource
  }
}

export function clearJoinDataSource(chartId) {
  return {
    type: CLEAR_GEO_JOIN_DATA_SOURCE_REQUEST,
    chartId
  }
}
