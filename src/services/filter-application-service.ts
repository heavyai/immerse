// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import pushid from "pushid"
import { getTablesForFilter } from "vega/utils/filter"
import { isOldFilter } from "vega/constants/filter-metadata-types"
import { doRedrawAll } from "./legacy-dc-filter-adapter"
import { postFilterNotification } from "services/external-messenger-api/api/registerForFilterNotifications"

type State = { omnifilters: any[] }
type Dispatch = (action: any) => any
type GetState = () => State

export function createFilterApplicationService(
  actions: Record<string, Function>,
  ports: {
    redraw?: typeof doRedrawAll
    notify?: typeof postFilterNotification
    getTables?: typeof getTablesForFilter
    createId?: typeof pushid
  } = {}
) {
  const redrawEffects = ports.redraw || doRedrawAll
  const notifyEffects = ports.notify || postFilterNotification
  const getTables = ports.getTables || getTablesForFilter
  const createId = ports.createId || pushid
  const notify = new Set([
    "clearFilterByName",
    "clearCrossFilters",
    "clearDashboardFilters",
    "setCrossFilter",
    "setDashboardFilter"
  ])
  const named = {
    setChartFilter: 3,
    setChartCohort: 4,
    setCrossFilter: 3,
    setDashboardCohort: 2,
    setDashboardFilter: 1
  }
  const filterPosition = {
    setChartFilter: 0,
    setChartCohort: 1,
    setCrossFilter: 0,
    setDashboardCohort: 1,
    setDashboardFilter: 0,
    updateFilterByName: 1
  }
  function affected(name: string, args: any[], state: State) {
    const [first, layer] = args
    if (name === "clearAllChartFilters") {
      return state.omnifilters.filter((f) => f.chartId === first)
    }
    if (["clearFilterByName", "toggleFilterByName"].includes(name)) {
      return state.omnifilters.filter((f) => f.name === first)
    }
    if (["clearCrossFilters", "toggleCrossfilters"].includes(name)) {
      return state.omnifilters.filter(
        (f) =>
          !isOldFilter(f) &&
          f.appliesTo === "CROSSFILTER" &&
          f.chartId === first &&
          f.layerId === layer
      )
    }
    const chartId = name === "toggleDashboardFilters" ? args[1] : first
    const layerId = name === "toggleDashboardFilters" ? args[2] : layer
    return state.omnifilters.filter(
      (f) =>
        !isOldFilter(f) &&
        f.appliesTo === "GLOBAL" &&
        (!chartId || (f.chartId === chartId && f.layerId === layerId))
    )
  }
  function command(name: string) {
    return (...input: any[]) => async (
      dispatch: Dispatch,
      getState: GetState
    ) => {
      const args = [...input]
      const before = getState()
      const namePosition = named[name]
      if (namePosition !== undefined && !args[namePosition]) {
        args[namePosition] = createId()
      }
      if (name === "setDashboardFilter" && args[4] === undefined) {
        args[4] =
          before.omnifilters.find((f) => f.name === args[1])?.enabled ?? true
      }
      const filterIndex = filterPosition[name]
      const filters =
        filterIndex === undefined
          ? affected(name, args, before)
          : [args[filterIndex]]
      const tables = new Set<string>()
      filters.forEach((item) =>
        getTables(item, { useDataSource: true }).forEach((table) =>
          tables.add(table)
        )
      )
      dispatch(actions[name](...args))
      const redraw = redrawEffects(dispatch, getState, tables)
      if (notify.has(name)) {
        notifyEffects()
      }
      await redraw
    }
  }
  return {
    clearAllChartFilters: command("clearAllChartFilters"),
    clearFilterByName: command("clearFilterByName"),
    clearCrossFilters: command("clearCrossFilters"),
    clearDashboardFilters: command("clearDashboardFilters"),
    setChartFilter: command("setChartFilter"),
    setChartCohort: command("setChartCohort"),
    setCrossFilter: command("setCrossFilter"),
    setDashboardCohort: command("setDashboardCohort"),
    setDashboardFilter: command("setDashboardFilter"),
    toggleFilterByName: command("toggleFilterByName"),
    toggleCrossfilters: command("toggleCrossfilters"),
    toggleDashboardFilters: command("toggleDashboardFilters"),
    updateFilterByName: command("updateFilterByName")
  }
}
