// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  ADD_CHART,
  CONFIRM_SAVE_DASHBOARD_ERROR,
  CONFIRM_COPY_DASHBOARD_ERROR,
  COPY_DASHBOARD_ERROR_SET_MESSAGE,
  COPY_DASHBOARD,
  DELETE_CHART,
  INITIALIZE_DASHBOARD,
  INITIALIZE_JOIN_TABLE,
  CLEAR_JOIN_TABLE,
  LOAD_DASH,
  LOAD_DASHBOARD_ERROR,
  LOAD_DASHBOARD_DATA_ACCESS_ERROR,
  LOAD_DASHBOARD_REQUEST,
  REFRESH_DASHBOARD_COMPLETE,
  REFRESH_DASHBOARD_REQUEST,
  SAVE_DASHBOARD_ERROR,
  SAVE_DASHBOARD_REQUEST,
  SAVE_DASHBOARD_SUCCESS,
  SET_DASHBOARD_STYLES,
  RESET_DASHBOARD_STYLES,
  SET_LOADLINK_ID,
  SET_STREAMING_INTERVAL,
  SET_DASHBOARD_PRIVILEGES,
  SET_DASHBOARD_LOAD_SUCCESS,
  UPDATE_DASHBOARD_NAME,
  UPDATE_DASHBOARD_SAVE_STATE,
  UPDATE_LAYOUT,
  UPDATE_LAYOUT_FOR_CHART,
  DASHBOARD_ADD_DATA_SOURCE,
  DASHBOARD_DELETE_DATA_SOURCE,
  ADD_DASHBOARD_TAB,
  SET_DASHBOARD_TAB,
  REMOVE_DASHBOARD_TAB,
  RENAME_DASHBOARD_TAB,
  DUPLICATE_DASHBOARD_TAB,
  SET_DASHBOARD_TAB_ORDER,
  COPY_COMMON_TAB_STATE,
  UPDATE_DASHBOARD_NAME_FORMATTED,
  SET_DASHBOARD_CONFIG_PANEL_WIDTH,
  CLEAR_PALETTE_MAPPING_INACTIVE_TAB
} from "constants/action-types"

import { clone, dissoc, keys } from "ramda"
import { produce } from "immer"
import pushid from "pushid"
import { isEmpty } from "lodash"
import createReducer from "utils/redux/create-reducer"
import { getErrorMessageFromBackendError } from "utils/error-handling-helpers"
import { tabDisplayName } from "components/tabs/tabs-utils"
import {
  COPY_TITLE,
  generateUniqueTitle
} from "../actions/dashboard-action-creators"
import { setDataSourcesAndColumns } from "vega/constants/filter-types"
import {
  ADD_PARAMETER_DASHBOARD_WIDGET,
  REMOVE_PARAMETER_DASHBOARD_WIDGET,
  REMOVE_PARAMETER_DEFINITION
} from "components/parameters/constants"
import { MIN_DASHBOARD_CONFIG_PANEL_WIDTH } from "components/dashboard/consts"
import { clearPaletteMapping } from "components/shared-settings/palette-mapping-helpers"

export const initialState = {
  id: null,
  title: null,
  titleFormatted: null,
  columnMetadata: null,
  chartContainers: [],
  parameterContainers: [],
  table: null,
  filtersId: [],
  layout: [],
  currentDataSource: null,
  dataSources: {},
  privileges: {},
  loadState: {
    error: false,
    dataAccessError: false,
    complete: false,
    request: false,
    loadLinkId: null
  },
  saveState: {
    error: false,
    request: false,
    lastState: null,
    isLink: false,
    isSaved: false,
    warnUnsaved: false
  },
  copyState: { error: false, request: false },
  streaming: { interval: 0, request: false, last_request: 0 },
  userConfigurableUI: {},
  configPanelWidth: MIN_DASHBOARD_CONFIG_PANEL_WIDTH
}

const A = 65

export function nextChar(data, start = A) {
  let found = false
  let charCode = null
  // eslint-disable-next-line guard-for-in
  for (const a in data) {
    charCode = data[a].alias?.charCodeAt?.(0)
    found = found || charCode === start
  }
  return found ? nextChar(data, start + 1) : String.fromCharCode(start)
}

function addLabel({ column, ...rest }) {
  return {
    ...rest,
    label: column,
    value: column
  }
}

export const mapToMetadata = (columnMetadata) =>
  Object.values(columnMetadata).map(addLabel)

const dashboardReducers = {
  SET_DATASOURCES(state, { currentDataSource, dataSources }) {
    return {
      ...state,
      currentDataSource,
      dataSources
    }
  },
  DELETE_DATASOURCE(state, { dataSource }) {
    const dataSources = dissoc(dataSource, state.dataSources)
    return {
      ...state,
      currentDataSource:
        state.currentDataSource === dataSource
          ? keys(dataSources)[0]
          : state.currentDataSource,
      table: state.table === dataSource ? keys(dataSources)[0] : state.table,
      dataSources
    }
  },
  SET_CURRENT_DATASOURCE(state, { dataSource }) {
    if (dataSource === state.currentDataSource) {
      return state
    } else {
      return {
        ...state,
        currentDataSource: dataSource
      }
    }
  },
  [ADD_CHART](state, action) {
    return {
      ...state,
      chartContainers: [...state.chartContainers, action.payload]
    }
  },
  [DELETE_CHART](state, action) {
    return {
      ...state,
      chartContainers: state.chartContainers.filter(
        ({ id }) => id !== action.chartId
      )
    }
  },
  [ADD_PARAMETER_DASHBOARD_WIDGET](state, { parameterName, id }) {
    return {
      ...state,
      parameterContainers: [
        ...(state.parameterContainers || []),
        { id, parameterName }
      ]
    }
  },
  [REMOVE_PARAMETER_DASHBOARD_WIDGET](state, action) {
    const { id } = action
    return {
      ...state,
      parameterContainers: state.parameterContainers.filter(
        (widget) => widget.id !== id
      )
    }
  },
  [REMOVE_PARAMETER_DEFINITION](state, action) {
    const { name } = action.payload
    const { tabs } = state
    const newTabState = {}

    Object.keys(tabs).forEach((tab) => {
      newTabState[tab] = {
        ...tabs[tab],
        dashboard: {
          ...tabs[tab].dashboard,
          parameterContainers: tabs[tab].dashboard.parameterContainers?.filter(
            (widget) => widget.parameterName !== name
          )
        }
      }
    })

    return {
      ...state,
      parameterContainers: state.parameterContainers?.filter(
        (widget) => widget.parameterName !== name
      ),
      tabs: newTabState
    }
  },
  [INITIALIZE_DASHBOARD](state, { name, columns }) {
    // For dashboard dataSources, we only include the data source that is selected
    // as primary but not the join datasource from geo joined chart
    if (
      !state.joinTable ||
      (state.joinTable && state.joinTable.name !== name)
    ) {
      return Object.assign({}, state, {
        table: name,
        columnMetadata: mapToMetadata(columns),
        dataSources: {
          ...state.dataSources,
          [name]: {
            ...state.dataSources[name],
            columnMetadata: mapToMetadata(columns)
          }
        }
      })
    } else {
      return state
    }
  },
  [INITIALIZE_JOIN_TABLE](state, { name, columns }) {
    return {
      ...state,
      joinTable: {
        ...state.joinTable,
        name,
        columnMetadata: mapToMetadata(columns)
      }
    }
  },
  [CLEAR_JOIN_TABLE](state) {
    const { joinTable: _, ...rest } = state
    return rest
  },
  [LOAD_DASHBOARD_ERROR](state, { error }) {
    return Object.assign({}, state, {
      loadState: {
        request: false,
        error: getErrorMessageFromBackendError(error)
      }
    })
  },
  [LOAD_DASHBOARD_DATA_ACCESS_ERROR](state, { error }) {
    return Object.assign({}, state, {
      loadState: { request: false, dataAccessError: error }
    })
  },
  [LOAD_DASHBOARD_REQUEST](state) {
    return Object.assign({}, state, {
      loadState: { request: true, error: false, dataAccessError: false }
    })
  },
  [SAVE_DASHBOARD_ERROR](state, { error }) {
    return Object.assign({}, state, {
      saveState: {
        error: getErrorMessageFromBackendError(error),
        request: false,
        isSaved: false
      }
    })
  },
  [SAVE_DASHBOARD_REQUEST](state) {
    return Object.assign({}, state, {
      saveState: { request: true, error: false, isSaved: false }
    })
  },
  [SAVE_DASHBOARD_SUCCESS](
    state,
    { payload: { id, isLink, state: lastState } }
  ) {
    return Object.assign({}, state, {
      id,
      saveState: {
        request: false,
        error: false,
        isSaved: true,
        warnUnsaved: false,
        isLink,
        lastState
      }
    })
  },
  [`${COPY_DASHBOARD}_PENDING`](state) {
    return Object.assign({}, state, {
      copyState: {
        ...state.copyState,
        request: true
      }
    })
  },
  [`${COPY_DASHBOARD}_FULFILLED`](state) {
    return Object.assign({}, state, {
      copyState: {
        ...state.copyState,
        request: false,
        error: false
      }
    })
  },
  [`${COPY_DASHBOARD}_REJECTED`](state) {
    return Object.assign({}, state, {
      copyState: {
        ...state.copyState,
        request: false,
        error: true
      }
    })
  },
  [COPY_DASHBOARD_ERROR_SET_MESSAGE](state, action) {
    return Object.assign({}, state, {
      copyState: {
        ...state.copyState,
        errorMessage: action.payload
      }
    })
  },
  [CONFIRM_COPY_DASHBOARD_ERROR](state) {
    return Object.assign({}, state, {
      copyState: {
        ...state.copyState,
        error: false
      }
    })
  },
  [LOAD_DASH](state) {
    const newTabId = pushid()

    return {
      ...state,
      loadState: {
        ...state.loadState,
        complete: true
      },
      tabs: {
        [newTabId]: {
          tabId: newTabId,
          index: 0,
          defaultTabIndex: 0,
          dashboard: {
            ...state,
            maxTabIndex: 0
          }
        }
      },
      selectedTabId: newTabId
    }
  },
  [SET_DASHBOARD_LOAD_SUCCESS](state) {
    return Object.assign({}, state, {
      loadState: {
        ...state.loadState,
        complete: true
      }
    })
  },
  [CONFIRM_SAVE_DASHBOARD_ERROR](state) {
    return Object.assign({}, state, {
      saveState: { request: false, error: false, isSaved: false }
    })
  },
  [SET_STREAMING_INTERVAL](state, { interval }) {
    return {
      ...state,
      streaming: {
        ...state.streaming,
        interval
      }
    }
  },
  [REFRESH_DASHBOARD_REQUEST](state) {
    return {
      ...state,
      streaming: {
        ...state.streaming,
        request: true,
        last_request: Date.now()
      }
    }
  },
  [REFRESH_DASHBOARD_COMPLETE](state) {
    return {
      ...state,
      streaming: {
        ...state.streaming,
        request: false
      }
    }
  },
  [SET_LOADLINK_ID](state, action) {
    return Object.assign({}, state, {
      loadState: {
        request: false,
        error: false,
        dataAccessError: false,
        loadLinkId: action.payload
      }
    })
  },
  [SET_DASHBOARD_STYLES](state, action) {
    return {
      ...state,
      userConfigurableUI: {
        ...state.userConfigurableUI,
        ...action.styles
      }
    }
  },
  [RESET_DASHBOARD_STYLES](state) {
    return Object.assign({}, state, {
      userConfigurableUI: {}
    })
  },
  [UPDATE_LAYOUT](state, action) {
    return Object.assign({}, state, action.payload)
  },
  [UPDATE_LAYOUT_FOR_CHART](state, { chartId, layout }) {
    // Find the index in the state.dashboard.layout array that contains our
    // chart's layout information
    const chartLayoutIndex = state.layout.findIndex(
      (layoutObject) => layoutObject.i === chartId
    )
    // If it exists, modify it with the new layout
    if (typeof chartLayoutIndex !== "undefined") {
      const newLayout = state.layout.map((l, i) => {
        if (i === chartLayoutIndex) {
          return layout
        }
        return l
      })
      return {
        ...state,
        layout: newLayout
      }
    }
    return state
  },
  [UPDATE_DASHBOARD_SAVE_STATE](state, { warnUnsaved }) {
    if (
      state.saveState.isSaved === false &&
      state.saveState.warnUnsaved === true
    ) {
      return state
    }
    return Object.assign({}, state, {
      saveState: {
        ...state.saveState,
        isSaved: false,
        warnUnsaved: state.saveState.warnUnsaved || warnUnsaved
      }
    })
  },
  [UPDATE_DASHBOARD_NAME](state, action) {
    return Object.assign({}, state, action.payload)
  },
  [UPDATE_DASHBOARD_NAME_FORMATTED](state, action) {
    return Object.assign({}, state, action.payload)
  },
  [SET_DASHBOARD_PRIVILEGES](state, action) {
    return Object.assign({}, state, {
      privileges: action.payload
    })
  },
  [DASHBOARD_ADD_DATA_SOURCE](state, { payload: { tableName, tableData } }) {
    const dataSources = {
      ...state.dataSources,
      [tableName]: {
        alias: nextChar(state.dataSources),
        columnMetadata: tableData
      }
    }
    return { ...state, dataSources }
  },
  [DASHBOARD_DELETE_DATA_SOURCE](state, { payload: { tableName } }) {
    const dataSources = { ...state.dataSources }
    delete dataSources[tableName]
    return { ...state, dataSources }
  },
  [ADD_DASHBOARD_TAB](state, { tabId }) {
    const { tabs = {}, maxTabIndex = 0 } = state
    const newMaxTabIndex = maxTabIndex + 1

    const newTabs = clone(tabs)
    Object.keys(newTabs).forEach((id) => {
      newTabs[id].dashboard.maxTabIndex = newMaxTabIndex
    })

    return {
      ...state,
      maxTabIndex: newMaxTabIndex,
      tabs: {
        ...newTabs,
        [tabId]: {
          tabId,
          index: Object.keys(tabs).length,
          defaultTabIndex: newMaxTabIndex,
          dashboard: {
            ...clone(initialState),
            id: state.id,
            title: state.title,
            owner: state.owner,
            maxTabIndex: newMaxTabIndex
          }
        }
      }
    }
  },
  [DUPLICATE_DASHBOARD_TAB](state, { tabId, newTabId }) {
    const { tabs = {} } = state
    const tab = tabs[tabId]

    const newTabName = generateUniqueTitle(COPY_TITLE)(
      tabDisplayName(tab),
      Object.values(tabs),
      "tabName"
    )
    const duplicatedTabIndex = tab.index + 1

    // Shift tab indexes to account for insert
    const shiftedTabs = clone(tabs)
    Object.keys(tabs).forEach((id) => {
      if (shiftedTabs[id].index >= duplicatedTabIndex) {
        shiftedTabs[id].index++
      }
    })

    return {
      ...state,
      tabs: {
        ...shiftedTabs,
        [newTabId]: {
          ...tab,
          tabId: newTabId,
          index: duplicatedTabIndex,
          tabName: newTabName
        }
      }
    }
  },
  [REMOVE_DASHBOARD_TAB](state, { tabId, newSelectedTabId }) {
    const { tabs = {} } = state
    const { [tabId]: _, ...restOfTabs } = tabs
    const removedIndex = tabs[tabId].index

    // Shift tab indexes to account for deletion
    const shiftedTabs = clone(restOfTabs)
    Object.keys(restOfTabs).forEach((id) => {
      if (shiftedTabs[id].index >= removedIndex) {
        shiftedTabs[id].index--
      }
    })

    // Disallow deleting the only tab
    return isEmpty(shiftedTabs)
      ? state
      : {
          ...state,
          tabs: shiftedTabs,
          selectedTabId: newSelectedTabId
        }
  },
  [RENAME_DASHBOARD_TAB](state, { tabId, tabName }) {
    const { tabs = {} } = state
    const tab = tabs[tabId]

    return {
      ...state,
      tabs: {
        ...tabs,
        [tabId]: {
          ...tab,
          tabName
        }
      }
    }
  },
  [SET_DASHBOARD_TAB](state, { tab }) {
    const { tabs = {} } = state
    const { tabs: _, ...dashboardWithoutTabs } = tab.dashboard

    return {
      ...state,
      tabs: {
        ...tabs,
        [tab.tabId]: {
          ...tab,
          dashboard: dashboardWithoutTabs
        }
      }
    }
  },
  [SET_DASHBOARD_TAB_ORDER](state, { orderedTabIds }) {
    const { tabs = {} } = state
    const newTabs = clone(tabs)

    orderedTabIds.forEach((tabId, index) => {
      newTabs[tabId].index = index
    })

    return {
      ...state,
      tabs: newTabs
    }
  },
  [COPY_COMMON_TAB_STATE](state, { id }) {
    const { tabs = {}, selectedTabId, privileges } = state

    return {
      ...state,
      tabs: {
        ...tabs,
        [id]: {
          ...tabs[id],
          dashboard: {
            ...tabs[id].dashboard,
            saveState: { ...tabs[selectedTabId].dashboard.saveState },
            title: tabs[selectedTabId].dashboard.title,
            privileges
          }
        }
      }
    }
  },
  [SET_DASHBOARD_CONFIG_PANEL_WIDTH](state, action) {
    return {
      ...state,
      configPanelWidth: action.width,
      saveState: {
        ...state.saveState,
        isSaved: false
      }
    }
  },
  [CLEAR_PALETTE_MAPPING_INACTIVE_TAB]: produce(
    (state, { tabId, chartId, layerId, isMeasure }) => {
      const tab = state.tabs[tabId]
      const chart = tab.charts[chartId]
      clearPaletteMapping({ chart, layerId, isMeasure })
    }
  )
}

function finalReducer(nextState, _action, prevState) {
  if (nextState.dataSources !== prevState.dataSources) {
    setDataSourcesAndColumns(nextState.dataSources)
  }
  return nextState
}

export default createReducer(dashboardReducers, initialState, finalReducer)
