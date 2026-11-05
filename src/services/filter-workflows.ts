// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as Actions from "actions/dashboard-filters-action-creators"
import { setSource } from "actions/data-source-action-creators"
import {
  redrawAll,
  redrawAllFromDashboardFilter
} from "actions/dc-action-creators"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"
import { getTablesForDataSource } from "components/join-manager/utils"
import { getQueryRuntime } from "./query-runtime"

type StorePort = { getState(): any; dispatch(action: any): any }
type Services = Map<string, any>

export function createFilterWorkflows(services: Services) {
  const runtime = getQueryRuntime(services)
  const active = new Map<string, AbortController>()
  let disposed = false
  const reset = () => {
    active.forEach((controller) => controller.abort())
    active.clear()
  }
  const unsubscribe = runtime.onInvalidate(reset)
  async function columns(dataSource: string) {
    const manager = services.get("crossfilter")
    let cf = manager.getCrossfilter(dataSource)
    if (!cf) {
      cf = await services
        .get("CrossFilter")
        .crossfilter(
          services.get("DbCon"),
          getTablesForDataSource(dataSource),
          dataSource
        )
      await cf.getFieldsAsync()
      manager.setCrossfilter(dataSource, cf)
    }
    return cf.getColumns()
  }
  async function run(store: StorePort, action: any) {
    const key = `${action.type}/${action.index ?? "all"}`
    active.get(key)?.abort()
    const controller = new AbortController()
    active.set(key, controller)
    const dashboardId = store.getState().dashboard.id
    const metadataRequest = [
      Actions.GET_FILTER_SIZE_REQUEST,
      Actions.GET_FILTER_MIN_MAX
    ].includes(action.type)
    const rowIdentity = () => {
      const row = store.getState().filters?.[action.index]
      return JSON.stringify([row?.dataSource, row?.value, row?.expression])
    }
    const originalRow = rowIdentity()
    const current = () =>
      !disposed &&
      !controller.signal.aborted &&
      active.get(key) === controller &&
      store.getState().dashboard.id === dashboardId &&
      (!metadataRequest || rowIdentity() === originalRow)
    const dispatch = (next: any) =>
      current() ? store.dispatch(next) : undefined
    let isAddingNewFilter = false
    try {
      const state = store.getState()
      switch (action.type) {
        case Actions.SELECT_FILTER_DATA_SOURCE_REQUEST: {
          const metadata = await columns(action.dataSource)
          dispatch(
            setSource(
              { filterIndex: action.index },
              action.dataSource,
              metadata
            )
          )
          dispatch(Actions.setFilterDataSource(action.index, action.dataSource))
          break
        }
        case Actions.GET_FILTER_SIZE_REQUEST: {
          const { value, dataSource } = state.filters[action.index]
          const result = await services
            .get("DbCon")
            .queryAsync(
              `SELECT APPROX_COUNT_DISTINCT(${value}) AS n FROM ${dataSource}`,
              { signal: controller.signal }
            )
          dispatch({
            type: Actions.GET_FILTER_SIZE_SUCCESS,
            index: action.index,
            shouldAutosuggest: result[0].n < 2000000
          })
          break
        }
        case Actions.GET_FILTER_MIN_MAX: {
          const cf = services
            .get("crossfilter")
            .getCrossfilter(action.filter.dataSource)
          const bounds = await cf.getMinMax(action.value)
          dispatch(
            Actions.setFilter(action.index, {
              minMaxValues: { min_val: bounds[0], max_val: bounds[1] },
              ...action.filter,
              expression: null
            })
          )
          break
        }
        case Actions.CLEAR_ALL_INPUT_FILTERS:
          await services
            .get("newFilter")
            .clearAllFilters(Object.keys(state.dashboard.dataSources))
          dispatch(updateDashboardSaveState())
          dispatch(redrawAll(null, true))
          break
        case Actions.REMOVE_INPUT_FILTER:
        case Actions.SET_FILTER: {
          const source = state.connection.isMSDEnabled
            ? action.attributes.dataSource
            : state.dashboard.currentDataSource
          const oldFilters = await services
            .get("crossfilter")
            .getCrossfilter(source)
            .getGlobalFilter()
          isAddingNewFilter = state.filters.length > oldFilters.length
          await services.get("newFilter").setFilters(source, state.filters)
          dispatch(redrawAllFromDashboardFilter(getTablesForDataSource(source)))
          break
        }
        default:
          break
      }
    } catch (error) {
      if (current()) {
        if (action.type === Actions.GET_FILTER_SIZE_REQUEST) {
          dispatch({
            type: Actions.GET_FILTER_SIZE_ERROR,
            index: action.index,
            error
          })
        } else if (action.type === Actions.SET_FILTER && isAddingNewFilter) {
          dispatch(Actions.invalidDashboardFilter(action.index))
        } else {
          dispatch({
            type: "FILTER_WORKFLOW_ERROR",
            index: action.index,
            error
          })
        }
      }
    } finally {
      if (active.get(key) === controller) {
        active.delete(key)
      }
    }
  }
  const handled = new Set([
    Actions.SELECT_FILTER_DATA_SOURCE_REQUEST,
    Actions.GET_FILTER_SIZE_REQUEST,
    Actions.GET_FILTER_MIN_MAX,
    Actions.CLEAR_ALL_INPUT_FILTERS,
    Actions.REMOVE_INPUT_FILTER,
    Actions.SET_FILTER
  ])
  return {
    middleware: (store: StorePort) => (next: Function) => (action: any) => {
      if (action.type === Actions.REMOVE_INPUT_FILTER) {
        reset()
      }
      // Effects observe the reduced state and preserve dispatch return values.
      // eslint-disable-next-line callback-return
      const result = next(action)
      if (handled.has(action.type)) {
        run(store, action)
      }
      return result
    },
    dispose: () => {
      disposed = true
      reset()
      unsubscribe()
    }
  }
}
