// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect } from "react"

import { useDispatch } from "react-redux"

import { buildFiltersForColumn } from "./filter-creator-wrappers"
import {
  setChartFilter,
  clearFilterByName
} from "vega/actions/filter-action-creators"
import { andFilter } from "vega/constants/filter-types"

import { useInternalCrossfilterId } from "./useInternalCrossfilterId"

export const useSetChartFilter = ({
  chartId,
  columns, // could be dimensions or measures. Must all have the same data source.
  layerId,
  name = "chartfilter",
  dataSource
}) => {
  const internalID = useInternalCrossfilterId({ chartId, name })

  const dispatch = useDispatch()

  useEffect(() => {
    const uniqueDataSources = new Set(columns.map((c) => c.dataSource))
    if (uniqueDataSources.size !== 1) {
      throw new Error(
        `Cannot useSetChartFilter with multiple data sources. Given ${uniqueDataSources} in chart ${chartId}`
      )
    }
  }, [columns, chartId])

  return useCallback(
    (...args) => {
      const filters = []
      columns.forEach((column) => {
        const filterValue = args.shift()
        const builtFilter = buildFiltersForColumn(
          column,
          filterValue,
          dataSource
        )
        if (builtFilter) {
          filters.push(builtFilter)
        }
      })

      const filter = filters.length === 1 ? filters[0] : andFilter(filters)
      if (filter) {
        dispatch(
          setChartFilter(
            filter,
            chartId,
            layerId,
            internalID,
            true,
            false,
            false
          )
        )
      } else {
        dispatch(clearFilterByName(internalID))
      }
    },
    [columns, dataSource, dispatch, chartId, layerId, internalID]
  )
}
