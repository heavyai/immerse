// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { setAppError } from "actions/app-action-creators"
import { getDashboards } from "actions/dashboards-action-creator"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"
import {
  COPY_DASHBOARD,
  CLEAR_DASHBOARD,
  CONFIRM_LOAD_DASHBOARD_ERROR,
  CONFIRM_SAVE_DASHBOARD_ERROR,
  CONFIRM_COPY_DASHBOARD_ERROR,
  COPY_DASHBOARD_ERROR_SET_MESSAGE,
  DELETE_DATASOURCE,
  INITIALIZE_DASHBOARD,
  INITIALIZE_JOIN_TABLE,
  CLEAR_JOIN_TABLE,
  GET_VIEW_AND_LOAD,
  LOAD_DASH,
  REFRESH_DASHBOARD,
  REFRESH_DASHBOARD_COMPLETE,
  REFRESH_DASHBOARD_REQUEST,
  SAVE_DASHBOARD_ERROR,
  SAVE_DASHBOARD_REQUEST,
  SAVE_DASHBOARD_SUCCESS,
  SET_CURRENT_DATASOURCE,
  SET_DATASOURCES,
  SET_DASHBOARD_PRIVILEGES,
  SET_LOADLINK_ID,
  SET_STREAMING_INTERVAL_REQUEST,
  UPDATE_DASHBOARD_NAME,
  UPDATE_DASHBOARD_NAME_FORMATTED,
  SET_DASHBOARD_LOAD_PENDING,
  SET_DASHBOARD_LOAD_SUCCESS,
  IMPORT_DASHBOARD_ERROR,
  DASHBOARD_ADD_DATA_SOURCE,
  DASHBOARD_DELETE_DATA_SOURCE,
  ADD_DASHBOARD_TAB,
  REMOVE_DASHBOARD_TAB,
  SET_DASHBOARD_TAB,
  DUPLICATE_DASHBOARD_TAB,
  RENAME_DASHBOARD_TAB,
  LOAD_DASHBOARD_TAB,
  SET_DASHBOARD_TAB_ORDER,
  COPY_COMMON_TAB_STATE,
  SET_DASHBOARD_CONFIG_PANEL_WIDTH
} from "constants/action-types"
import {
  assoc,
  compose,
  dissoc,
  filter,
  ifElse,
  lensPath,
  lensProp,
  over,
  pick,
  propSatisfies,
  set,
  view
} from "ramda"
import { push } from "connected-react-router"
import fileSaver from "file-saver"
import pushid from "pushid"
import { ColumnMetadata } from "constants/prop-types"
import { COPY_DASHBOARD_UNKNOWN_SERVER_ERROR } from "constants/error-messages"
import {
  MIN_SAVE_DASHBOARD_SPINNER_DURATION,
  MS_IN_SECONDS
} from "constants/magic-variables"
import { deserialize } from "utils/dashboard-load"
import { getErrorMessageFromBackendError } from "utils/error-handling-helpers"
import { Column } from "vega/constants/data-selection-types"
import {
  MINIMALIST_BASEMAP_VALUE,
  MINIMALIST_THEME_LABEL
} from "constants/charts"
import { isLegacyMinimalistBasemapValue } from "charts/raster-chart/basemap"

import { getActiveDataSources } from "utils/currently-active-datasources"
import { getSelectedFilterSet } from "components/new-filters/filter-sets-selectors"
import {
  addParameterSet,
  duplicateParameterSet,
  removeParameterSets
} from "components/parameters/actions/parameter-sets-action-creators"
import {
  getParameterSetForDashboard,
  getParameterSetsForTabId,
  makeGetParameterSetIdsForTabId
} from "components/parameters/selectors"
import { getDatabase } from "selectors"
import { toggleAnnotationsEditMode } from "./annotation-action-creators"

import { routeToDashboard, routeToChartEditor } from "utils/routerPath"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { clearParametersData } from "../components/parameters/actions"
import { getFields } from "services/ImmerseCrossFilter/utils"
import { setDashboardStyles } from "./user-configurable-ui-action-creators"
import { getTablesForDataSource } from "components/join-manager/utils"
const { DASHBOARD_TABS } = available_feature_flags

let streamingIntervalId = null

const isNotDashboardFilterError = (dashboardFilter) => !dashboardFilter.error
const removeErrorFilters = over(
  lensProp("filters"),
  filter(isNotDashboardFilterError)
)
const addVersionNumberToDashboard = (state) =>
  over(
    lensProp("dashboard"),
    assoc("version", view(lensPath(["connection", "version"]), state)),
    state
  )

const normalizeChartBasemap = (chart) => {
  if (
    chart?.basemap?.label === MINIMALIST_THEME_LABEL &&
    isLegacyMinimalistBasemapValue(chart.basemap.value)
  ) {
    return {
      ...chart,
      basemap: {
        ...chart.basemap,
        value: MINIMALIST_BASEMAP_VALUE
      }
    }
  }

  return chart
}

const normalizeChartsBasemap = (charts = {}) =>
  Object.fromEntries(
    Object.entries(charts).map(([chartId, chart]) => [
      chartId,
      normalizeChartBasemap(chart)
    ])
  )

export const normalizeMinimalistBasemapState = (state) => {
  if (!state || typeof state !== "object") {
    return state
  }

  const nextState = {
    ...state
  }

  if (nextState.charts) {
    nextState.charts = normalizeChartsBasemap(nextState.charts)
  }

  if (nextState.tabs && typeof nextState.tabs === "object") {
    nextState.tabs = Object.fromEntries(
      Object.entries(nextState.tabs).map(([tabId, tab]) => [
        tabId,
        normalizeMinimalistBasemapState(tab)
      ])
    )
  }

  return nextState
}

export const pickStateForViewState = compose(
  removeErrorFilters,
  over(lensProp("dashboard"), dissoc("raw")),
  over(lensProp("dashboard"), dissoc("columnMetadata")),
  over(lensPath(["dashboard", "saveState"]), dissoc("lastState")),
  // TODO: remove this entire ifElse with old crossfilter
  ifElse(
    propSatisfies(
      (omnifilters) => typeof omnifilters === "undefined",
      "omnifilters"
    ),
    set(lensProp("omnifilters"), []),
    over(
      lensProp("omnifilters"),
      filter(() => true)
    )
  ),
  over(lensProp("annotations"), dissoc("editMode")),
  pick([
    "annotations",
    "charts",
    "filters",
    "dashboard",
    "omnifilters",
    "filterZones",
    "cohorts",
    "parameters",
    "chartAddons",
    "tabId",
    "crossLinks",
    "joinDataSources",
    "sharedSettings"
  ]),
  addVersionNumberToDashboard
)

const mapTabState = (state) => {
  const {
    dashboard: {
      selectedTabId,
      tabs,
      title,
      parameters,
      chartAddons,
      joinDataSources,
      ...dashboardRest
    }
  } = state

  return getFeatureFlag(DASHBOARD_TABS) && tabs
    ? {
        tabs: {
          ...Object.fromEntries(
            Object.entries(tabs).map(([id, tab]) => [
              id,
              {
                ...tab,
                dashboard: {
                  ...tab.dashboard,
                  title
                }
              }
            ])
          ),
          [selectedTabId]: {
            ...tabs[selectedTabId],
            ...state,
            dashboard: {
              ...dashboardRest,
              title
            }
          }
        },
        parameters: state.parameters,
        chartAddons: state.chartAddons,
        joinDataSources: state.joinDataSources,
        sharedSettings: state.sharedSettings
      }
    : state
}

const dashboardStateWithNewTitle = (
  tabs,
  deserializedDashboardState,
  uniqueTitle
) => {
  return tabs
    ? {
        ...deserializedDashboardState,
        tabs: Object.fromEntries(
          Object.entries(deserializedDashboardState.tabs).map(
            ([tabId, tab]) => [
              tabId,
              {
                ...tab,
                dashboard: {
                  ...tab.dashboard,
                  title: uniqueTitle
                }
              }
            ]
          )
        )
      }
    : {
        ...deserializedDashboardState,
        dashboard: {
          ...deserializedDashboardState.dashboard,
          title: uniqueTitle
        }
      }
}

const serializeViewState = compose(
  window.btoa,
  window.unescape,
  window.encodeURIComponent,
  JSON.stringify
)

export const mapStateToSerializedViewState = compose(
  window.btoa,
  window.unescape,
  window.encodeURIComponent,
  JSON.stringify,
  normalizeMinimalistBasemapState,
  mapTabState,
  pickStateForViewState
)

export function setCurrentDataSourceByChartId(chartId) {
  return (dispatch, getState) => {
    const chart = getState().charts[chartId]
    if (chart) {
      dispatch(setCurrentDataSource(chart.dataSource))
    }
  }
}

export function setDataSources({ currentDataSource, dataSources }) {
  return {
    type: SET_DATASOURCES,
    currentDataSource,
    dataSources
  }
}

export function deleteDataSource(dataSource) {
  return {
    type: DELETE_DATASOURCE,
    dataSource
  }
}

export function setCurrentDataSource(dataSource) {
  return {
    type: SET_CURRENT_DATASOURCE,
    dataSource
  }
}

export function updateDashboardName(title) {
  return {
    type: UPDATE_DASHBOARD_NAME,
    payload: {
      title
    }
  }
}

export function updateDashboardNameFormatted(titleFormatted) {
  return {
    type: UPDATE_DASHBOARD_NAME_FORMATTED,
    payload: {
      titleFormatted
    }
  }
}

export function clearDashboard() {
  return async (dispatch) => {
    await dispatch({ type: CLEAR_DASHBOARD })
    dispatch(clearParametersData())
  }
}

export function setColumnMetadata(name, columns, size) {
  return {
    type: INITIALIZE_DASHBOARD,
    name,
    columns,
    size
  }
}

export function setJoinTableMetadata(name, columns) {
  return {
    type: INITIALIZE_JOIN_TABLE,
    name,
    columns
  }
}

export function clearJoinTable() {
  return {
    type: CLEAR_JOIN_TABLE
  }
}

export const getDashboard = (
  id,
  selectedFilterSetId,
  selectedTabId,
  parametersFromQueryString
) => ({
  type: GET_VIEW_AND_LOAD,
  id,
  selectedFilterSetId,
  selectedTabId,
  parametersFromQueryString
})

export const setDashboardTab = (tab) => ({
  type: SET_DASHBOARD_TAB,
  tab
})

// "Soft" save of current dashboard to in-memory tabs state
export const softSaveDashboardTab = () => async (dispatch, getState) => {
  await dispatch(setDashboardStyles())
  const state = getState()
  const {
    dashboard: { selectedTabId, tabs }
  } = state
  const tab = tabs?.[selectedTabId]

  if (selectedTabId) {
    // my life is pain. We do -not- want to copy parameters across tabs.
    const selectableTab = {
      ...tab,
      ...pickStateForViewState(state),
      tabId: selectedTabId
    }
    delete selectableTab.parameters
    delete selectableTab.joinDataSources
    delete selectableTab.sharedSettings
    await dispatch(setDashboardTab(selectableTab))
  }
}

export const loadDashboardTab = (selectedFilterSetId, selectedTabId) => ({
  type: LOAD_DASHBOARD_TAB,
  selectedFilterSetId,
  selectedTabId
})

export const copyCommonTabState = (id) => ({
  type: COPY_COMMON_TAB_STATE,
  id
})

export const loadDashboardLink = (linkId) => ({
  type: GET_VIEW_AND_LOAD,
  link: true,
  linkId
})

export const addDashboardTab = () => async (dispatch, getState) => {
  await dispatch(updateDashboardSaveState(true))

  const tabId = pushid()

  await dispatch({
    type: ADD_DASHBOARD_TAB,
    tabId
  })

  const parent = getParameterSetForDashboard(getState())

  await dispatch(addParameterSet({ parent: parent.id, tabId }))
}

export const duplicateDashboardTab = (tabId) => async (dispatch, getState) => {
  await dispatch(updateDashboardSaveState(true))
  // We duplicate the "soft saved" tab state, so in case we're duplicating the
  // current tab, ensure that the soft saved state is in sync with the current
  // dashboard state
  await dispatch(softSaveDashboardTab())

  const newTabId = pushid()

  await dispatch({
    type: DUPLICATE_DASHBOARD_TAB,
    tabId,
    newTabId
  })

  const parameterSetId = getParameterSetsForTabId(getState())(tabId)[0].id
  await dispatch(duplicateParameterSet(parameterSetId, newTabId))
}

export const removeDashboardTab = (tabId, newSelectedTabId) => ({
  type: REMOVE_DASHBOARD_TAB,
  tabId,
  newSelectedTabId
})

export const deleteDashboardTab = (tabId, dashboardId) => async (
  dispatch,
  getState
) => {
  const {
    dashboard: { tabs = {}, selectedTabId }
  } = getState()

  await dispatch(updateDashboardSaveState(true))

  // If deleting the selected tab, select the next tab.
  // If the selected tab was the last tab, select the prev tab.
  if (selectedTabId === tabId) {
    const tabValues = Object.values(tabs)
    const deletedTabIndex = tabValues.find((tab) => tab.tabId === selectedTabId)
      .index

    let newSelectedTabId = Object.values(tabs)[0].tabId
    const nextTab = tabValues.find((tab) => tab.index === deletedTabIndex + 1)
    if (nextTab) {
      newSelectedTabId = nextTab.tabId
    } else {
      const prevTab = tabValues.find((tab) => tab.index === deletedTabIndex - 1)
      newSelectedTabId = prevTab ? prevTab.tabId : newSelectedTabId
    }

    await dispatch(removeDashboardTab(tabId, newSelectedTabId))

    // Change route when the selected tab is deleted
    await dispatch(
      push(
        routeToDashboard(getDatabase(getState()), dashboardId, newSelectedTabId)
      )
    )
  } else {
    await dispatch(removeDashboardTab(tabId, selectedTabId))
  }

  const getParameterSetForTabId = makeGetParameterSetIdsForTabId(getState())
  await dispatch(removeParameterSets(getParameterSetForTabId(tabId)))
}

export const renameDashboardTab = (tabId, tabName) => (dispatch) => {
  dispatch(updateDashboardSaveState(true))
  dispatch({
    type: RENAME_DASHBOARD_TAB,
    tabId,
    tabName
  })
}

export const setDashboardTabOrder = (orderedTabIds) => (dispatch) => {
  dispatch(updateDashboardSaveState(true))
  dispatch({
    type: SET_DASHBOARD_TAB_ORDER,
    orderedTabIds
  })
}

/*
  routeToDashboard might not dispatch an action because it accepts two additional booleans -
  the first flag will optionally open a link in a new window/tab, and the second flag
  will optionally open it in the foreground.

  false false - same window (default) (false true also behaves this way)
  true false  - new tab/window, in background
  true true   - new tab/window, in foreground

  Flags typically correspond to the event's metaKey and shiftKey, respectively.
*/
export const navigateToDashboard = (dashboardId) => (dispatch, getState) => {
  const { dashboard, router } = getState()
  const id = dashboardId || (dashboard && dashboard.id)
  const filterSetId = (getSelectedFilterSet(getState()) || {}).id

  const route = routeToDashboard(
    getDatabase(getState()),
    id,
    undefined,
    filterSetId
  )

  // If there are no new query params for the filter set or tab, maintain the current ones in the URL.
  const currentParams = new URLSearchParams(router?.location?.search || "")
  const routeParams = new URLSearchParams(route.search || "")

  const currentFilterSet = currentParams.get("filterSet")

  if (!routeParams.has("filterSet") && currentFilterSet) {
    routeParams.set("filterSet", currentFilterSet)
  }

  const currentTab = currentParams.get("tab")

  if (!routeParams.has("tab") && currentTab) {
    routeParams.set("tab", currentTab)
  }

  route.search = routeParams.toString()

  dispatch(push(route))
}

export const navigateToChartEditor = (chartId) => (dispatch, getState) => {
  const { dashboard = {}, router } = getState()

  const pathname = routeToChartEditor(
    getDatabase(getState()),
    dashboard.id,
    chartId
  )

  // disable annotation edit mode
  dispatch(toggleAnnotationsEditMode(false))

  dispatch(
    push({
      pathname,
      search: router?.location?.search || ""
    })
  )
}

export function saveDashboardSuccess(id, serializedState) {
  return (dispatch) => {
    setTimeout(
      () =>
        dispatch({
          type: SAVE_DASHBOARD_SUCCESS,
          payload: {
            id,
            state: serializedState
          }
        }),
      MIN_SAVE_DASHBOARD_SPINNER_DURATION
    )
  }
}

function cleanUpDataSources(state, dispatch) {
  const currentSources = getActiveDataSources(state)
  Object.keys(state.dashboard.dataSources).forEach((ds) => {
    if (currentSources.indexOf(ds) === -1) {
      dispatch(deleteDataSource(ds))
    }
  })
}

export function saveDashboard() {
  return (dispatch, getState, services) => {
    const DbCon = services.get("DbCon")
    cleanUpDataSources(getState(), dispatch)
    const state = getState()

    const {
      dashboard: {
        id,
        owner,
        title,
        titleFormatted,
        selectedTabId,
        tabs,
        dataSources
      }
    } = state
    const otherTabsTables = Object.entries(tabs || {}).flatMap(([tabId, tab]) =>
      tabId === selectedTabId ? [] : Object.keys(tab.dashboard.dataSources)
    )
    const currentTabTables = Object.keys(dataSources)

    const table = [...otherTabsTables, ...currentTabTables].join(", ")

    const serializedState = mapStateToSerializedViewState(state)
    const serializedDashboardMetaData = JSON.stringify({
      table,
      version: "v3",
      dashboard_name_formatted:
        titleFormatted.length > 0 ? titleFormatted : undefined
    })
    dispatch({
      type: SAVE_DASHBOARD_REQUEST
    })
    if (id) {
      return DbCon.replaceDashboardAsync(
        id,
        title,
        owner,
        serializedState,
        null,
        serializedDashboardMetaData
      )
        .then(() => {
          dispatch(saveDashboardSuccess(id, serializedState))
        })
        .catch((error) =>
          dispatch({
            error,
            type: SAVE_DASHBOARD_ERROR
          })
        )
    } else {
      return DbCon.createDashboardAsync(
        title,
        serializedState,
        null,
        serializedDashboardMetaData
      )
        .then((result) => {
          const newId = result[0]
          dispatch(push(`/${getDatabase(getState())}/dashboard/${newId}`))
          dispatch(saveDashboardSuccess(newId, serializedState))
        })
        .catch((error) =>
          dispatch({
            error,
            type: SAVE_DASHBOARD_ERROR
          })
        )
    }
  }
}

export const COPY_TITLE = "Copy"
const IMPORT_TITLE = "Import"

export const generateUniqueTitle = (label) => (title, list, nameProp) => {
  const copyTitleBase = `${title} (${label}`
  const copyNumPosition = -2

  const copyNum = list.reduce((n, { [nameProp]: name }) => {
    if (name && name.includes(copyTitleBase)) {
      const copyNumChar = name.slice(copyNumPosition, -1)
      const newCopyNum = isNaN(copyNumChar) ? 1 : Number(copyNumChar) + 1
      return newCopyNum > n ? newCopyNum : n
    }
    return n
  }, 0)

  return copyNum ? `${copyTitleBase} ${copyNum})` : `${copyTitleBase})`
}

const copyDashboard = (title, serializedState, serializedMetadata) => async (
  dispatch,
  _getState,
  services
) => {
  const DbCon = services.get("DbCon")

  const result = await DbCon.createDashboardAsync(
    title,
    serializedState,
    null,
    serializedMetadata
  )

  dispatch({ type: COPY_DASHBOARD })

  return result
}

export const copyDashboardWithId = (dashboardId) => async (
  dispatch,
  _getState,
  services
) => {
  const DbCon = services.get("DbCon")

  try {
    const [dashboard, dashboards] = await Promise.all([
      DbCon.getDashboardAsync(dashboardId),
      await DbCon.getDashboardsAsync()
    ])
    const { dashboard_name, dashboard_metadata, dashboard_state } = dashboard

    const deserializedDashboardState = deserialize(dashboard_state)
    const uniqueTitle = generateUniqueTitle(COPY_TITLE)(
      dashboard_name,
      dashboards,
      "dashboard_name"
    )
    const newTitleState = dashboardStateWithNewTitle(
      deserializedDashboardState.tabs,
      deserializedDashboardState,
      uniqueTitle
    )

    const serializedState = serializeViewState(newTitleState)

    await dispatch(
      copyDashboard(uniqueTitle, serializedState, dashboard_metadata)
    )

    // Refresh the dashboard list to include the new one
    dispatch(getDashboards())
  } catch (error) {
    dispatch(
      setAppError(
        IMPORT_DASHBOARD_ERROR,
        getErrorMessageFromBackendError(error, {
          customDefault: COPY_DASHBOARD_UNKNOWN_SERVER_ERROR
        })
      )
    )
  }
}

export const copyCurrentDashboard = () => async (
  dispatch,
  getState,
  services
) => {
  const state = getState()
  const DbCon = services.get("DbCon")

  const {
    dashboard: { title, dataSources }
  } = state

  dispatch({ type: SET_DASHBOARD_LOAD_PENDING })

  const dashboards = await DbCon.getDashboardsAsync()

  const uniqueTitle = generateUniqueTitle(COPY_TITLE)(
    title,
    dashboards,
    "dashboard_name"
  )

  const copiedState = {
    ...state,
    dashboard: {
      ...state.dashboard,
      title: uniqueTitle
    }
  }

  const table = Object.keys(dataSources).join(", ")
  const serializedState = mapStateToSerializedViewState(copiedState)
  const serializedMetaData = JSON.stringify({
    table,
    version: "v3",
    dashboard_name_formatted: copiedState.dashboard.titleFormatted.length
      ? copiedState.dashboard.titleFormatted
      : undefined
  })

  try {
    const [newDashboardId] = await dispatch(
      copyDashboard(uniqueTitle, serializedState, serializedMetaData)
    )

    dispatch(push(`/${getDatabase(getState())}/dashboard/${newDashboardId}`))
    dispatch({ type: SET_DASHBOARD_LOAD_SUCCESS })
  } catch (error) {
    dispatch({
      type: COPY_DASHBOARD_ERROR_SET_MESSAGE,
      payload: getErrorMessageFromBackendError(error, {
        customDefault: COPY_DASHBOARD_UNKNOWN_SERVER_ERROR
      })
    })
    dispatch({ type: SET_DASHBOARD_LOAD_SUCCESS })
  }
}

export const exportDashboard = (dashboardId) => async (
  dispatch,
  getState,
  services
) => {
  const {
    connection: { version }
  } = getState()
  const DbCon = services.get("DbCon")

  try {
    const {
      dashboard_name,
      dashboard_metadata,
      dashboard_state
    } = await DbCon.getDashboardAsync(dashboardId)

    const deserializedState = normalizeMinimalistBasemapState(
      deserialize(dashboard_state)
    )

    const filename = `${dashboard_name}_${version}_${new Date().toISOString()}.json`
    const filetext = `${dashboard_name}\n${dashboard_metadata}\n${JSON.stringify(
      deserializedState
    )}`

    const blob = new window.Blob([filetext], {
      type: "application/json;charset=utf-8"
    })

    fileSaver.saveAs(blob, filename)
  } catch (error) {
    dispatch(setAppError(IMPORT_DASHBOARD_ERROR, error))
  }
}

export const importDashboard = (title, metadata, state) => async (
  dispatch,
  _getState,
  services
) => {
  const DbCon = services.get("DbCon")

  try {
    const dashboards = await DbCon.getDashboardsAsync()
    const titleUsed = dashboards.some(
      (dashboard) => dashboard.dashboard_name === title
    )

    const uniqueTitle = titleUsed
      ? generateUniqueTitle(IMPORT_TITLE)(title, dashboards, "dashboard_name")
      : title

    const deserializedState = normalizeMinimalistBasemapState(JSON.parse(state))

    const newTitleState = dashboardStateWithNewTitle(
      state.tabs,
      deserializedState,
      uniqueTitle
    )

    const serializedState = serializeViewState(newTitleState)

    await DbCon.createDashboardAsync(
      uniqueTitle,
      serializedState,
      null,
      metadata
    )

    // Refresh the dashboard list to include the new one
    dispatch(getDashboards())
  } catch (error) {
    dispatch(setAppError(IMPORT_DASHBOARD_ERROR, error))
  }
}

export function setLoadLinkId(id) {
  return {
    type: SET_LOADLINK_ID,
    payload: id
  }
}

export function confirmLoadDashboardError() {
  return {
    type: CONFIRM_LOAD_DASHBOARD_ERROR
  }
}

export function confirmSaveDashboardError() {
  return {
    type: CONFIRM_SAVE_DASHBOARD_ERROR
  }
}

export function confirmCopyDashboardError() {
  return {
    type: CONFIRM_COPY_DASHBOARD_ERROR
  }
}

export function startStreaming(interval) {
  return (dispatch) => {
    streamingIntervalId = window.setInterval(
      () => dispatch(refreshDashboard()),
      interval * MS_IN_SECONDS
    )
  }
}

export function loadDash() {
  return {
    type: LOAD_DASH
  }
}

export function refreshDashboard() {
  return {
    type: REFRESH_DASHBOARD
  }
}

export function stopStreaming() {
  window.clearInterval(streamingIntervalId)
}

export function setStreamingInterval(interval) {
  return {
    type: SET_STREAMING_INTERVAL_REQUEST,
    interval
  }
}

export function refreshDashboardRequest() {
  return {
    type: REFRESH_DASHBOARD_REQUEST
  }
}

export function refreshDashboardComplete() {
  return {
    type: REFRESH_DASHBOARD_COMPLETE
  }
}

export function setDashboardPrivileges(privileges) {
  return {
    type: SET_DASHBOARD_PRIVILEGES,
    payload: privileges
  }
}

// This is the object shape output by crossfilter.getColumns
// and stored in dashboard.dataSources..columnMetadata,
// plus 'value' for the data selector dialog.
type CrossFilterRowDescriptor = ColumnMetadata

// Transform Column[] (which comes from connector.getFields) to the
// crossfilter / dashboard.dataSources version. This is effectively
// the same as what old crossfilter does in its own getFields, aside
// from the addition of the 'value' prop
export const transformColumnMetadata = (
  table: string,
  columns: Column[]
): CrossFilterRowDescriptor[] =>
  columns.map(
    ({
      name,
      table: columnTable,
      type,
      precision,
      is_array,
      is_dict,
      is_join
    }) => {
      return {
        table: is_join ? columnTable : table,
        column: name,
        label: name,
        type,
        precision,
        is_array,
        is_dict,
        is_join,
        name_is_ambiguous: false, // These columns will only ever be over one table
        value: name // Used by data selector dialog
      }
    }
  )

export const setTableListData = (dataSource: string, columns: Column[]) => ({
  type: DASHBOARD_ADD_DATA_SOURCE,
  payload: {
    tableName: dataSource,
    tableData: transformColumnMetadata(dataSource, columns)
  }
})

/**
 *
 * @param dataSource Can be a table name or parameter name
 * @returns
 */
export const getTableListData = (dataSource: string) => async (
  dispatch,
  _getstate,
  services
) => {
  const DbCon = services.get("DbCon")
  const tables = getTablesForDataSource(dataSource)
  const { columns } = await getFields({
    connector: DbCon,
    tables
  })

  dispatch(setTableListData(dataSource, columns))
}

export const deleteDataSourceData = (tableName: string) => ({
  type: DASHBOARD_DELETE_DATA_SOURCE,
  payload: {
    tableName
  }
})

export const setConfigPanelWidth = (width) => ({
  type: SET_DASHBOARD_CONFIG_PANEL_WIDTH,
  width
})
