// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  all,
  call,
  put,
  select,
  take,
  takeEvery,
  fork
} from "redux-saga/effects"

import CrossFilter, { resetCrossFilter } from "services/ImmerseCrossFilter"
import pushid from "pushid"
import R from "ramda"

import { resetAnnotations } from "actions/annotation-action-creators"
import { deserialize } from "utils/dashboard-load"
import {
  setColumnMetadata,
  setStreamingInterval
} from "actions/dashboard-action-creators"
import { getDataSourcesList } from "actions/tables-action-creators"
import { resetPreviewStyles } from "actions/user-configurable-ui-action-creators"
import * as ActionTypes from "constants/action-types"
import {
  handleGetDashboardPrivileges,
  getDataSourcePrivileges
} from "actions/privileges-thunks"
import createFilterService, {
  isValidFilter
} from "services/create-filter-service"
import { createCrossfilterService } from "services/crossfilter"
import { clearVegaSpecCache } from "vega/actions/vega-data-thunks"
import { clearAllFilters } from "vega/actions/filter-action-creators"
import {
  setFilterX,
  setChartSpecificBinFilters
} from "vega/actions/filter-action-creators-crossfilter-interop"
import {
  clearAllFilterSets,
  getDefaultFilterSet,
  selectFilterSet
} from "components/new-filters/filter-sets-action-creators"
import { deleteAllCohorts } from "components/new-filters/cohorts-action-creators"
import {
  clearParametersData,
  initializeParametersData,
  clearParameterUsage
} from "components/parameters/actions"
import { mergeQueryParamsIntoParameters } from "components/parameters/merge-query-params-util"
import * as Omnifilter from "vega/constants/filter-types"
import { isNumerical } from "constants/data-types"
import Services from "services/immerse"
import action from "utils/redux/action"
import { CHART_TYPES } from "../constants/charts"
import { replace } from "connected-react-router"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
const { DASHBOARD_TABS } = available_feature_flags
import { purgeQueues } from "services/ConnectorWithQueue"
import repairFilters, { repairJoinFilters } from "utils/FilterRepair"
import { isMultiLayer } from "../charts/raster-chart/raster-utils"
import { initRasterLayerIds } from "../utils/raster-layer-id-utils"
import { hasParamSyntax } from "utils/parameters"
import { getTablesForDataSource } from "components/join-manager/utils"
import { buildDefaultCustomizableTopNOptions } from "vega/charts/top-n-utils"

// This function automatically detects and fixes corrupted dashboards.
// Prior to us fixing the source of the corruption,
// dashboards could have invalid, incomplete chart objects added to the `charts`
// list in the state. This function automatically fixes this by
// cross-referencing the `charts` list with the dashboard's `chartContainers`
// and `dataSources`, and removing any charts that shouldn't be there.
function removeIncompleteCharts(dashboardState) {
  const {
    charts = {},
    dashboard: { chartContainers = [], dataSources = {} }
  } = dashboardState

  const chartIds = Object.keys(charts)
  const chartContainerIds = chartContainers.map((chart) => chart.id)
  const dataSourceIds = Object.keys(dataSources)

  // The charts that _should_ exist (are referenced from either
  // `chartContainers` or `dataSources`)
  const expectedChartIds = chartContainerIds.concat(dataSourceIds)
  // The charts that exist in the `charts` object, but are not expected. These
  // are malformed charts.
  const unexpectedChartIds = R.difference(chartIds, expectedChartIds)

  if (unexpectedChartIds.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      "Warning: unexpected/invalid charts found in the current dashboard. Will remove the following charts from the dashboard:",
      R.pick(unexpectedChartIds, charts)
    )
  }

  // Remove any unexpected charts from the `charts` object
  const repairedCharts = R.omit(unexpectedChartIds, charts)

  return {
    ...dashboardState,
    charts: repairedCharts
  }
}

// Combo charts created prior to 4.7 had a bin maximum of 400. The number of bins is
// updated from 400 to 1000 on combo charts to address an issue with combo binning labeling.
function updateComboChartsBinMax(dashboardState) {
  const previousBinMax = 400
  const currentBinMax = 1000
  const { charts = {} } = dashboardState

  Object.keys(charts).forEach((chartIndex) => {
    const { type, dimensions } = charts[chartIndex]

    if (type === "line2" && dimensions[0].numOfBins === previousBinMax) {
      charts[chartIndex].dimensions[0].numOfBins = currentBinMax
    }
  })

  return { ...dashboardState, charts }
}

// This function migrates dashboard filters from the old "filters" redux state
// into the new omnifilters state.
function moveOldFiltersIntoOmnifilters(dashboardState) {
  const { filters = [], omnifilters = [] } = dashboardState

  const convertRelativeValue = (relativeValue, datePart) => {
    if (relativeValue.now) {
      return "NOW"
    }

    const operator =
      typeof relativeValue.operator === "undefined"
        ? "DATE_ADD"
        : relativeValue.operator

    if (typeof relativeValue.number === "object") {
      // AFAIK for all of the old preset options this nested datePart is always *supposed* to be the same as the same as the parent datePart,
      // but in relative-filter-types.js the "Last Month" option was seemingly incorrectly entered, so let's pass the correct one in.
      return convertRelativeValue(
        relativeValue.number,
        relativeValue.datepart.toUpperCase()
      )
    }

    const value = relativeValue.number === 0 ? "NOW" : relativeValue.number
    const adjustment = relativeValue.add || relativeValue.number

    if (operator === "DATE_ADD") {
      return {
        func: "ADD",
        datePart: datePart || relativeValue.datepart.toUpperCase(),
        adjustment,
        value
      }
    }

    return {
      func: "TRUNC",
      datePart: datePart || relativeValue.datepart.toUpperCase(),
      adjustment,
      value
    }
  }

  const newFilters = Object.values(filters)
    .map((filter) => {
      if (!isValidFilter(filter)) {
        return null
      }

      switch (filter.operator) {
        case "=":
          if (filter.isRelative) {
            return Omnifilter.relativeFilter(
              filter.table,
              filter.dataSource,
              filter.value,
              filter.type,
              convertRelativeValue(filter.operand[0]),
              convertRelativeValue(filter.operand[1])
            )
          } else if (filter.type === "BOOL") {
            return Omnifilter.simpleFilter(
              filter.table,
              filter.dataSource,
              filter.value,
              filter.type,
              "=",
              filter.operand === "true"
            )
          }

        // eslint-disable-next-line no-fallthrough
        case "<":
        case ">":
        case "!=":
        case "<>":
        case "<=":
        case ">=":
        case "EQUALS":
        case "NOT EQUALS": {
          let operator = filter.operator
          let negated = false
          if (operator === "!=") {
            operator = "="
            negated = true
          } else if (operator === "EQUALS") {
            operator = "="
          } else if (operator === "NOT EQUALS") {
            operator = "="
            negated = true
          } else if (operator === "<>") {
            operator = "="
            negated = true
          }
          const simpleFilter = Omnifilter.simpleFilter(
            filter.table,
            filter.dataSource,
            filter.value,
            filter.type,
            operator,
            isNumerical(filter.type)
              ? parseFloat(filter.operand)
              : filter.operand
          )

          return negated ? Omnifilter.notFilter(simpleFilter) : simpleFilter
        }

        case "CONTAINS":
        case "NOT CONTAINS": {
          const containsFilter = filter.is_array
            ? Omnifilter.simpleFilter(
                filter.table,
                filter.dataSource,
                filter.value,
                filter.type,
                "=",
                filter.operand,
                { dataTypeIsArray: true }
              )
            : Omnifilter.simpleFilter(
                filter.table,
                filter.dataSource,
                filter.value,
                filter.type,
                "ILIKE",
                filter.operand
              )

          if (filter.operator === "NOT CONTAINS") {
            return Omnifilter.notFilter(containsFilter)
          } else {
            return containsFilter
          }
        }

        case "IS":
        case "BTW":
          return Omnifilter.betweenFilter(
            filter.table,
            filter.dataSource,
            filter.value,
            filter.type,
            filter.operand[0],
            filter.operand[1]
          )

        case "IS NULL":
          return Omnifilter.nullFilter(
            filter.table,
            filter.dataSource,
            filter.value,
            filter.type
          )

        case "NOT NULL":
          return Omnifilter.notNullFilter(
            filter.table,
            filter.dataSource,
            filter.value,
            filter.type
          )

        default:
          return Omnifilter.sqlFilter(
            filter.table,
            filter.dataSource,
            filter.expression
          )
      }
    })
    .filter(Boolean)

  const convertedDashboardFilterIds = []

  newFilters.forEach((filter) => {
    const name = pushid()
    convertedDashboardFilterIds.push(name)

    omnifilters.push({
      appliesTo: "GLOBAL",
      enabled: true,
      dataSources: [
        filter.filter ? filter.filter.dataSource : filter.dataSource
      ],
      name,
      filter
    })
  })

  return {
    dashboardStateOmnifilters: { ...dashboardState, filters: [], omnifilters },
    convertedDashboardFilterIds
  }
}

function addFilterSetlessDashboardFiltersToDefaultFilterSet(
  dashboardState,
  filterIds
) {
  const { filterZones = {} } = dashboardState
  if (Object.keys(filterZones).length === 0) {
    const {
      id: defaultFilterSetId,
      filterSet: defaultFilterSet
    } = getDefaultFilterSet()
    filterZones[defaultFilterSetId] = defaultFilterSet
  }

  const defaultFilterSetId = Object.keys(filterZones).sort()[0]
  const defaultFilterSetFilters = filterZones[
    defaultFilterSetId
  ].filters.concat(filterIds)

  return {
    ...dashboardState,
    filterZones: {
      ...filterZones,
      [defaultFilterSetId]: {
        ...filterZones[defaultFilterSetId],
        filters: defaultFilterSetFilters
      }
    }
  }
}

// Charts created before being able to set top n options for color measures that use the mode agg
function fixVegaComboTopN(dashboardState) {
  Object.keys(dashboardState.charts).forEach((key) => {
    const chart = dashboardState.charts[key]
    if (chart?.type === CHART_TYPES.VEGA_COMBO) {
      chart.dataSelections?.forEach((ds, idx) => {
        if (
          ds?.measures?.color?.aggregate === "Mode" &&
          !ds?.measureTopNOptions
        ) {
          ds.measureTopNOptions = buildDefaultCustomizableTopNOptions(
            ds.table,
            idx
          )
        }
      })
    }
  })
}

// Prior to 5.5, vega combo filter names included the chart ID to make them
// "unique". However, this didn't consider filtersets. In 5.5, we updated the
// names to include the filterset.
function fixVegaComboFilters(dashboardState) {
  if (
    !Array.isArray(dashboardState.omnifilters) ||
    !dashboardState.filterZones
  ) {
    return
  }

  dashboardState.omnifilters.forEach((omnifilter) => {
    if (/^chart.*-(range-)?crossfilter$/.test(omnifilter.name)) {
      // find which filterset this belongs to
      Object.values(dashboardState.filterZones).find((zone) => {
        if (zone.filters) {
          const filterIdx = zone.filters.indexOf(omnifilter.name)
          if (filterIdx >= 0) {
            // update filter name and update filterset.
            omnifilter.name = `zone${zone.id}-${omnifilter.name}`
            zone.filters.splice(filterIdx, 1, omnifilter.name)
            return true
          }
        }
        return false
      })
    }
  })
}

// Prior to 5.5, the default tab was missing a tabId property
function fixTabIds(dashboardTabs) {
  Object.keys(dashboardTabs).forEach((tabId) => {
    if (!dashboardTabs[tabId].tabId) {
      dashboardTabs[tabId].tabId = tabId
    }
  })
}

const DATA_ACCESS_FAILURE = new Error(
  "You do not have privileges to one of the underlying tables"
)

export function* getView({
  id,
  link,
  linkId,
  selectedFilterSetId,
  selectedTabId,
  parametersFromQueryString
}) {
  try {
    const { dashboard } = yield select()
    // Do nothing if the dashboard has already been loaded into state
    // (For instance, coming back from a different page)
    if (!(dashboard && dashboard.id && dashboard.id === id)) {
      const connector = Services.get("DbCon")

      yield put(action(ActionTypes.LOAD_DASHBOARD_REQUEST))
      yield put(action(ActionTypes.INITIAL_RENDER_BEGIN))
      yield put(action(ActionTypes.SET_DASHBOARD_LOAD_PENDING))

      if (link) {
        const linkView = yield call(connector.getLinkViewAsync, linkId)

        yield call(loadLinkView, connector, linkView)
      } else {
        const dashboardView = yield call(connector.getDashboardAsync, id)

        yield call(
          loadDashboardView,
          connector,
          dashboardView,
          id,
          selectedFilterSetId,
          selectedTabId,
          parametersFromQueryString
        )
      }
    }
  } catch (error) {
    if (error === DATA_ACCESS_FAILURE) {
      yield put(action(ActionTypes.LOAD_DASHBOARD_DATA_ACCESS_ERROR, { error }))
    } else {
      yield put(action(ActionTypes.LOAD_DASHBOARD_ERROR, { error }))
    }
  }
}

const insureRasterLayerIdsExist = (charts) =>
  Object.keys(charts).reduce((newCharts, chartId) => {
    const chart = charts[chartId]
    return isMultiLayer(chart.type) && chart.layers
      ? {
          ...newCharts,
          [chartId]: {
            ...chart,
            layers: [...initRasterLayerIds(chart.layers, chartId, chart.type)]
          }
        }
      : {
          ...newCharts,
          [chartId]: {
            ...chart
          }
        }
  }, {})

function* loadDashboard(
  dashboardId,
  dashboardOwner,
  dashboardTabs,
  dashboardStateUnpacked,
  selectedFilterSetId,
  selectedTabId,
  isTabNavigation = false,
  parameters,
  joinDataSources,
  sharedSettings
) {
  // Clear out dc listeners, etc. ASAP in case we're coming directly from
  // another dashboard or tab
  resetDcState()

  // Remove corrupt dashboards due to invalid chart objects
  const dashboardStateCompleteCharts = removeIncompleteCharts(
    dashboardStateUnpacked
  )

  // Update combo bin number of pre-4.7 combo charts
  const dashboardStateComboCharts = updateComboChartsBinMax(
    dashboardStateCompleteCharts
  )

  // Move old filters into new omnifilters state
  const {
    dashboardStateOmnifilters,
    convertedDashboardFilterIds
  } = moveOldFiltersIntoOmnifilters(dashboardStateComboCharts)

  // Converted dashboard filters need a zone to be rendered
  const dashboardState = addFilterSetlessDashboardFiltersToDefaultFilterSet(
    dashboardStateOmnifilters,
    convertedDashboardFilterIds
  )

  dashboardState.charts = insureRasterLayerIdsExist(dashboardState.charts)

  // TODO MIGRATION: this should be replaced with the real migration functionality, when it's created.
  // this'll blow away any XFILTER (prototype) or old crossfilter style filters (with crossfilterId)
  // from omnifilters. We'll add things back in a little later.
  dashboardState.omnifilters = dashboardState.omnifilters.filter(
    (f) => f.appliesTo !== "XFILTER" || f.crossfilterId === undefined
  )

  dashboardState.parameters = parameters
  if (joinDataSources) {
    dashboardState.joinDataSources = joinDataSources
  }

  if (sharedSettings) {
    dashboardState.sharedSettings = sharedSettings
  }

  fixVegaComboFilters(dashboardState)
  fixVegaComboTopN(dashboardState)

  if (getFeatureFlag(DASHBOARD_TABS)) {
    fixTabIds(dashboardTabs)
  }

  // this function has several repair utilities, all of which are governed by feature flags.
  repairFilters(dashboardState)

  // Repairs filters on join datasources, which need a table AND a datasource
  repairJoinFilters(dashboardState)

  // DONE TODO MIGRATION block

  // clearDashboard thunk is intentionally not called since it has side effects
  // that should not happen on tab navigation, e.g. clearing parameters
  yield put(action(ActionTypes.CLEAR_DASHBOARD))
  clearVegaSpecCache()
  yield put(clearAllFilters())
  yield put(clearAllFilterSets())
  yield put(deleteAllCohorts())
  if (!isTabNavigation) {
    yield put.resolve(clearParametersData())
  }
  yield call(resetCrossFilter)
  yield call(purgeQueues)

  yield put(
    action(ActionTypes.LOAD_DASHBOARD_SUCCESS, {
      dashboardId,
      dashboardOwner,
      dashboardState,
      dashboardTabs,
      selectedTabId
    })
  )

  if (getFeatureFlag(available_feature_flags.CLEAR_PARAMETER_USAGE)) {
    yield put(clearParameterUsage())
  }

  // Sets "saved" state on dashboard on load.
  // Unsaved state should carry over when switching between tabs
  if (!isTabNavigation) {
    yield put(
      action(ActionTypes.SAVE_DASHBOARD_SUCCESS, {
        payload: { id: dashboardId }
      })
    )
  }

  const { tables } = yield select((state) => state)

  if (!tables.length) {
    yield put(getDataSourcesList())
  }

  if (dashboardId || dashboardId === 0) {
    yield put(handleGetDashboardPrivileges(dashboardId))
  }

  // Clear any styles the user added to other dashboards that they didn't save
  yield put(resetPreviewStyles())

  // XXX TODO Fun. Again, this needs to be ripped apart when we have real linking,
  // much like the history.push code in filter-set-action-creators.
  // This is ~epic~. We can't select the given filter set now because we can only do
  // that after the charts have come to life, due to reasons.
  //
  // So we fork off a new saga and wait until INITIAL_RENDER_DONE fires so we know
  // everything has come to life. Then we can select the set.
  //
  // This causes a flash upon load if a URL w/o the currently selected set is loaded,
  // but there's nothing I can do about that yet.
  if (selectedFilterSetId !== undefined) {
    // eslint-disable-next-line func-names
    yield fork(function* () {
      yield take(ActionTypes.INITIAL_RENDER_DONE)
      yield put(selectFilterSet(selectedFilterSetId))
    })
  }
  // end XXX TODO linking
  if (
    getFeatureFlag(available_feature_flags.USE_CACHED_COHORTS) &&
    (getFeatureFlag(available_feature_flags.AUTO_REFRESH_CACHED_COHORTS) ||
      getFeatureFlag(available_feature_flags.AUTO_RECREATE_CACHED_COHORTS))
  ) {
    const promise = yield call(
      window.refreshCohorts,
      undefined,
      getFeatureFlag(available_feature_flags.AUTO_REFRESH_CACHED_COHORTS)
    )
    yield put({ type: "COHORTS_REFRESHED", promise })
  }
  yield* initializeDashboard()
  yield put(action(ActionTypes.SET_DASHBOARD_LOAD_SUCCESS))

  // TODO MIGRATION : this needs to be replaced with a real migration function.
  // for now, look at our filters and see if we have anything with a crossfilter. If not,
  // then iterate through the charts and create new omnifilters from their crossfilters. If
  // no crossfilters exist on the chart, no omnifilters will be created.
  const newState = yield select()

  const hasNewChartFilters = newState.omnifilters.find(
    (f) => f.chartId !== undefined
  )
  if (!hasNewChartFilters) {
    for (const chartId of Object.keys(newState.charts)) {
      if (newState.charts[chartId].type !== CHART_TYPES.HEAT) {
        yield put.resolve(setFilterX(chartId))
        yield put.resolve(setChartSpecificBinFilters(chartId))
      }
    }
  }

  // END TODO MIGRATION Block
}

function resetDcState() {
  Services.get("dc")
    .chartRegistry.listAll()
    .forEach((chart) => {
      chart.on("filtered", null)
      if (chart.removeMapListeners) {
        chart.removeMapListeners()
      }
      chart.filterAll()
      if (chart.root && chart.root()) {
        chart.resetSvg()
      }
      chart.destroyChart()
    })
  Services.get("dc").deregisterAllCharts()
  Services.get("dc").resetState()
}

function* loadDashboardTab({ selectedFilterSetId, selectedTabId }) {
  try {
    yield put(action(ActionTypes.SET_DASHBOARD_LOAD_PENDING))
    const dashboard = yield select((state) => state.dashboard)
    const parameters = yield select((state) => state.parameters)
    const joinDataSources = yield select((state) => state.joinDataSources)
    const sharedSettings = yield select((state) => state.sharedSettings)

    const dashboardId = dashboard.id
    const dashboardOwner = dashboard.owner

    const dashboardTabs = dashboard.tabs
    const dashboardStateUnpacked = dashboardTabs[selectedTabId]

    yield loadDashboard(
      dashboardId,
      dashboardOwner,
      dashboardTabs,
      dashboardStateUnpacked,
      selectedFilterSetId,
      selectedTabId,
      true,
      parameters,
      joinDataSources,
      sharedSettings
    )
  } catch (error) {
    if (error === DATA_ACCESS_FAILURE) {
      yield put(action(ActionTypes.LOAD_DASHBOARD_DATA_ACCESS_ERROR, { error }))
    } else {
      yield put(action(ActionTypes.LOAD_DASHBOARD_ERROR, { error }))
    }
  }
}

export const getFirstTabId = (tabs = {}) =>
  Object.keys(tabs).find((tabId) => tabs[tabId].index === 0) ||
  Object.keys(tabs)[0]

function* loadDashboardView(
  connector,
  view,
  id,
  selectedFilterSetId,
  selectedTabId,
  parametersFromQueryString
) {
  const dashboardId = view.dashboard_id
  const dashboardOwner = view.dashboard_owner

  const dashboardStateInitial = yield call(deserialize, view.dashboard_state)

  let dashboardStateUnpacked = dashboardStateInitial
  let dashboardTabs = undefined

  if (getFeatureFlag(DASHBOARD_TABS)) {
    dashboardTabs = dashboardStateInitial.tabs

    const location = yield select((state) => state.router.location)
    const queryParams = new URLSearchParams(location.search)
    const queryTabId = queryParams.get("tab")

    if (selectedTabId && selectedTabId !== queryTabId) {
      queryParams.set("tab", selectedTabId)
    }

    // Override saved tabs with what's in memory, to pull in unsaved tab state
    const { id: memoryId, tabs: memoryTabs } = yield select(
      (state) => state.dashboard
    )

    if (memoryTabs || dashboardTabs) {
      const tabs = memoryTabs || dashboardTabs
      const invalidQueryTabId = queryTabId !== null && !tabs[selectedTabId]
      // Pick first tab as default
      if (!selectedTabId || invalidQueryTabId) {
        selectedTabId = getFirstTabId(tabs)

        queryParams.set("tab", selectedTabId)
      }

      yield put(
        replace({
          ...location,
          search: queryParams.toString()
        })
      )
    } else {
      // Rewrap old, untabbed state if that's what was saved
      const newTabId = pushid()

      dashboardTabs = {
        [newTabId]: {
          ...dashboardStateInitial,
          tabId: newTabId,
          index: 0,
          defaultTabIndex: 0
        }
      }
      selectedTabId = newTabId
    }

    // Pull from memory tabs, saved tabs, then fall back to old untabbed state
    dashboardStateUnpacked =
      memoryTabs && dashboardId === memoryId
        ? memoryTabs[selectedTabId]
        : dashboardTabs
        ? dashboardTabs[selectedTabId]
        : dashboardStateInitial
  } else {
    dashboardTabs = dashboardStateInitial.tabs

    dashboardStateUnpacked = dashboardTabs
      ? dashboardTabs[getFirstTabId(dashboardTabs)]
      : dashboardStateInitial
  }

  return yield loadDashboard(
    dashboardId,
    dashboardOwner,
    dashboardTabs,
    dashboardStateUnpacked,
    selectedFilterSetId,
    selectedTabId,
    false,
    mergeQueryParamsIntoParameters(
      dashboardStateInitial.parameters,
      parametersFromQueryString,
      selectedTabId
    ),
    dashboardStateInitial.joinDataSources,
    dashboardStateInitial.sharedSettings
  )
}

function* loadLinkView(connector, view) {
  const dashboardStateInitial = yield call(deserialize, view.view_state)

  const {
    dashboardStateOmnifilters,
    convertedDashboardFilterIds
  } = moveOldFiltersIntoOmnifilters(dashboardStateInitial)

  const dashboardState = addFilterSetlessDashboardFiltersToDefaultFilterSet(
    dashboardStateOmnifilters,
    convertedDashboardFilterIds
  )

  // TODO MIGRATION: this should be replaced with the real migration functionality, when it's created.
  // this'll blow away any XFILTER (prototype) or old crossfilter style filters (with crossfilterId)
  // from omnifilters. We'll add things back in a little later.
  dashboardState.omnifilters = dashboardState.omnifilters.filter(
    (f) => f.appliesTo !== "XFILTER" || f.crossfilterId === undefined
  )

  fixVegaComboFilters(dashboardState)
  // DONE TODO MIGRATION block

  yield put(clearAllFilters())
  yield put(clearAllFilterSets())
  yield put(deleteAllCohorts())
  yield put.resolve(clearParametersData())

  yield call(purgeQueues)
  yield put(action(ActionTypes.LOAD_DASHBOARD_SUCCESS, { dashboardState }))

  yield put(
    action(ActionTypes.SAVE_DASHBOARD_SUCCESS, { payload: { isLink: true } })
  )

  yield* initializeDashboard()
  yield put(action(ActionTypes.SET_DASHBOARD_LOAD_SUCCESS))

  // TODO MIGRATION : this needs to be replaced with a real migration function.
  // for now, look at our filters and see if we have anything with a crossfilter. If not,
  // then iterate through the charts and create new omnifilters from their crossfilters. If
  // no crossfilters exist on the chart, no omnifilters will be created.
  const newState = yield select()

  const hasNewChartFilters = newState.omnifilters.find(
    (f) => f.chartId !== undefined
  )
  if (!hasNewChartFilters) {
    for (const chartId of Object.keys(newState.charts)) {
      yield put.resolve(setFilterX(chartId))
      yield put.resolve(setChartSpecificBinFilters(chartId))
    }
  }
  // END TODO MIGRATION Block
}

function* getTableColumns(
  connector,
  cfManager,
  filterService,
  filters,
  source
) {
  const privsSet = hasParamSyntax(source)
    ? { select: true }
    : yield call(getDataSourcePrivileges, source)

  const tables = getTablesForDataSource(source)

  const { select: selectAllowed = false } = privsSet || {}
  if (selectAllowed) {
    const cf = yield call(CrossFilter.crossfilter, connector, tables, source)
    yield call(cf.getFieldsAsync)
    yield call(cfManager.setCrossfilter, source, cf)
    yield call(filterService.setFilters, source, filters)

    const columnMetadata = yield call(cf.getColumns)
    const size = yield call(cf.sizeAsync)

    yield put(setColumnMetadata(source, columnMetadata, size))
  } else {
    yield Promise.reject(DATA_ACCESS_FAILURE)
  }
}

export function* initializeDashboard() {
  const cfManager = yield call(createCrossfilterService)
  const filterService = yield call(createFilterService, cfManager)
  const connector = Services.get("DbCon")

  const { interval } = yield select((state) => state.dashboard.streaming)
  if (interval) {
    yield put(setStreamingInterval(interval))
  }

  const { dataSources } = yield select((state) => state.dashboard)
  const filters = yield select((state) => state.filters)

  yield all(
    R.keys(dataSources).map((source) =>
      call(
        getTableColumns,
        connector,
        cfManager,
        filterService,
        filters,
        source
      )
    )
  )

  const { joinTable } = yield select((state) => state.dashboard)
  if (joinTable) {
    yield call(
      getTableColumns,
      connector,
      cfManager,
      filterService,
      filters,
      joinTable.name
    )
  }

  Services.set("crossfilter", cfManager)
  Services.set("newFilter", createFilterService(cfManager))

  // Clear any styles the user added to other dashboards that they didn't save
  yield put(resetPreviewStyles())
}

export function* createDashboard() {
  clearVegaSpecCache()
  yield put(clearAllFilters())
  yield put(clearAllFilterSets("navigate"))
  yield put(deleteAllCohorts())
  yield put.resolve(initializeParametersData())

  yield call(purgeQueues)
  yield put(resetAnnotations())

  yield* initializeDashboard()
}

export function* loadDashSaga() {
  while (true) {
    yield take(ActionTypes.LOAD_DASH)
    yield* createDashboard()
  }
}

export default function* rootDashboardSaga() {
  yield all([
    loadDashSaga(),
    takeEvery(ActionTypes.GET_VIEW_AND_LOAD, getView),
    takeEvery(ActionTypes.LOAD_DASHBOARD_TAB, loadDashboardTab)
  ])
}
