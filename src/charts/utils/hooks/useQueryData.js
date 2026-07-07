// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"

import { updateChart } from "actions/update-chart-action-creator"

import { useConnector } from "./useConnector"
import { useDashboardId } from "./useDashboardId"
import { useChart } from "./useChart"
import { useDashboardRefresh } from "./useDashboardRefresh"

export const useQueryData = (chartId, dataQuery, options = {}) => {
  const dispatch = useDispatch()
  const dashboardId = useDashboardId()
  const chart = useChart(chartId)
  const lastRefresh = useDashboardRefresh()

  const {
    shouldExecute = true,
    shouldUpdate = true,
    shouldRefresh = true
  } = options

  const [data, setData] = useState()

  const { dataSource } = chart

  const connector = useConnector({
    dashboardId,
    chartId,
    tableName: dataSource
  })

  const needsRefresh = shouldRefresh ? lastRefresh : undefined

  useEffect(() => {
    if (!shouldExecute) {
      setData(undefined)
      return
    }
    dataQuery &&
      connector
        .queryAsync(dataQuery, { shouldUpdateData: shouldUpdate })
        .then((_data) => {
          if (shouldUpdate) {
            dispatch(updateChart(chartId, { data: _data }))
          }
          setData(_data)
        })
  }, [
    connector,
    dataQuery,
    chartId,
    dispatch,
    shouldExecute,
    shouldUpdate,
    needsRefresh
  ])

  return data
}
