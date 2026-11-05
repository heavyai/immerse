// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getStore } from "./legacy-application-context"
import * as filters from "./ImmerseCrossFilter/utils"

export const getChartFilters = (chartId, table, layerId, useFakeChart) =>
  filters.getChartFilters(
    chartId,
    table,
    layerId,
    useFakeChart,
    getStore().getState()
  )
export const getDashboardFilters = (table, excludeFilters) =>
  filters.getDashboardFilters(table, excludeFilters, getStore().getState())
export const getUnbinnedQuery = (query, crossfilter, dimension, group) =>
  filters.getUnbinnedQuery(
    query,
    crossfilter,
    dimension,
    group,
    getStore().getState()
  )
export const enhanceTables = (tables) =>
  filters.enhanceTables(tables, getStore().getState?.())
export const enhanceColumnMetadata = (columns, table) =>
  filters.enhanceColumnMetadata(columns, table, getStore().getState?.())
