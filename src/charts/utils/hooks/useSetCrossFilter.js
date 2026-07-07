// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect } from "react"

import { useDispatch } from "react-redux"

import { buildFiltersForColumn } from "./filter-creator-wrappers"
import {
  setCrossFilter,
  clearFilterByName
} from "vega/actions/filter-action-creators"
import { andFilter } from "vega/constants/filter-types"
import { useInternalCrossfilterId } from "./useInternalCrossfilterId"

import { useStaticValue } from "hooks"

export const useSetCrossFilter = ({
  chartId,
  columns: givenColumns, // could be dimensions or measures. Must all have the same data source.
  layerId,
  name = "crossfilter",
  useGeneratedInternalId = true,
  dataSource
}) => {
  const columns = useStaticValue(givenColumns)

  const internalID = useInternalCrossfilterId({
    chartId,
    name,
    useGeneratedInternalId
  })

  const dispatch = useDispatch()

  useEffect(() => {
    const uniqueDataSources = new Set(columns.map((c) => c.table))
    if (uniqueDataSources.size > 1) {
      throw new Error(
        `Cannot useSetCrossFilter with multiple data sources. Given ${uniqueDataSources} in chart ${chartId}`
      )
    }
  }, [columns, chartId])

  return useCallback(
    (...args) => {
      // called w/o columns? Bomb out.
      if (!columns.length) {
        return
      }
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

      const filter = filters.length > 1 ? andFilter(filters) : filters[0]
      if (filter) {
        dispatch(setCrossFilter(filter, chartId, layerId, internalID))
      } else {
        dispatch(clearFilterByName(internalID))
      }
    },
    [columns, dataSource, dispatch, chartId, layerId, internalID]
  )
}
