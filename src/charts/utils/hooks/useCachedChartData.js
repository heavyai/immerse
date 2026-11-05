// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react"
import { useStore } from "react-redux"
import { getQueryRuntime } from "services/query-runtime"

const useRuntimeSnapshot = (renderData) => {
  const store = useStore()
  const runtime = getQueryRuntime(store.services)
  const getSnapshot = renderData
    ? runtime.getRenderSnapshot
    : runtime.getSnapshot
  const [snapshot, setSnapshot] = useState(getSnapshot)
  useEffect(() => {
    const update = () => setSnapshot(getSnapshot())
    const unsubscribe = runtime.subscribe(update)
    update()
    return unsubscribe
  }, [runtime, getSnapshot])
  return snapshot
}

export const useChartQuerySnapshot = () => useRuntimeSnapshot(false)

export const useCachedChartData = ({ chartId, token } = {}) => {
  const snapshot = useChartQuerySnapshot()
  return snapshot[String(chartId)]?.[token]
}

export const useRenderSnapshot = () => useRuntimeSnapshot(true)
export const useVegaChartData = (chartId) =>
  useRenderSnapshot()[String(chartId)]
