// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint no-return-assign: "off" */

import {
  and,
  assocPath,
  complement,
  compose,
  dissoc,
  has,
  identity,
  ifElse,
  isEmpty,
  lensIndex,
  lensPath,
  lensProp,
  map,
  merge,
  over,
  pathSatisfies,
  propEq,
  propSatisfies,
  set,
  without
} from "ramda"
import { DEFAULT_BASEMAP } from "constants/charts"
import {
  CONFIRM_LOAD_DASHBOARD_ERROR,
  LOAD_DASHBOARD_SUCCESS
} from "constants/action-types"
import forEach from "lodash/forEach"
import { initialState as initialDCState } from "reducers/dc-reducer"
import { initialState as initialUIState } from "reducers/ui-reducer"
import { isEnabledFromCookie } from "constants/feature-flags"
import { mergeR } from "utils/ramda-helpers"
import moment from "moment"
import msdCompatibilityReducer from "utils/load-dashboard-helpers/single-source-to-multi-reducer"
import { CHARTS_DEFAULT_COLORS, getColors } from "services/colors"
import {
  normalizeBasemap,
  upgradeBasemap,
  validBasemap
} from "charts/raster-chart/basemap"
import { getDefaultFilterSet } from "components/new-filters/filter-sets-action-creators"
import {
  getDefaultParametersData,
  getParameterSet
} from "components/parameters/actions"
import { upgradeCharts } from "charts/utils/chart-versioning"
import {
  filterHasChild,
  filterHasChildren,
  isMultiSourceFilter
} from "vega/constants/filter-types"
import { isTimeType } from "constants/data-types"

import { cloneDeep } from "lodash"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

import {
  FILTER_TYPE_SIMPLE,
  FILTER_TYPE_BETWEEN,
  FILTER_TYPE_IN,
  FILTER_TYPE_NOT_IN
} from "vega/constants/filter-type-constants"

const { POINTMAP_MAX_POINTS } = available_feature_flags

function updateChartSortingIfNeeded(chart) {
  if (chart.sortColumn && !chart.sortColumn.col) {
    const fixedChart = {
      col: {
        name: chart.sortColumn
      },
      index: 0,
      order: chart.ordering
    }
    return set(lensProp("sortColumn"), fixedChart, chart)
  }
  return chart
}

function updateColorsWithDefaultOther(chart) {
  if (chart.color && chart.color.customDomain) {
    const hasDefaultInDomain = chart.color.customDomain.filter(
      (d) => d === "Default"
    ).length

    if (hasDefaultInDomain) {
      const newCustomDomain = chart.color.customDomain.slice(
        1,
        chart.color.customDomain.length
      )
      const defaultOtherRange = chart.color.customRange[0]
      const newCustomRange = chart.color.customRange.slice(
        1,
        chart.color.customDomain.length
      )
      return over(
        lensProp("color"),
        mergeR({
          defaultOtherDomain: "Default",
          defaultOtherRange,
          customDomain: newCustomDomain,
          customRange: newCustomRange
        }),
        chart
      )
    } else if (
      (chart.type === "line" || chart.type === "line2") &&
      !chart.color.defaultOtherDomain
    ) {
      return over(
        lensProp("color"),
        mergeR({
          defaultOtherDomain: "other",
          defaultOtherRange: getColors(CHARTS_DEFAULT_COLORS).custom
            .defaultOtherRange
        }),
        chart
      )
    } else if (
      chart.type === "pointmap" &&
      !chart.color.defaultOtherDomain &&
      !chart.measures.find((m) => m.name === "color").type === "BOOL" // no need to add "Other" for boolean column
    ) {
      return over(
        lensProp("color"),
        mergeR({
          defaultOtherDomain: "Default",
          defaultOtherRange: getColors(CHARTS_DEFAULT_COLORS).custom
            .defaultOtherRange
        }),
        chart
      )
    }
  }
  return chart
}

export const maybeAddRangeFilter = ifElse(
  has("rangeFilter"),
  identity,
  set(lensProp("rangeFilter"), [])
)

export const showNullDimensions = ifElse(
  has("showNullDimensions"),
  identity,
  set(lensProp("showNullDimensions"), false)
)

// Applying the new Absolute value property for existing pie charts
export const showAbsoluteValues = ifElse(
  has("showAbsoluteValues"),
  identity,
  set(lensProp("showAbsoluteValues"), true)
)

export const elasticY = ifElse(
  has("elasticY"),
  identity,
  set(lensProp("elasticY"), true)
)

export const baseMap = ifElse(
  has("basemap"),
  identity,
  set(lensProp("basemap"), DEFAULT_BASEMAP)
)

export const upgradeLineChart = ifElse(
  and(propEq("type", "line"), () => isEnabledFromCookie("replace-line")),
  compose(set(lensProp("type"), "line2"), set(lensProp("isNotDc"), true)),
  identity
)

export const upgradeVegaCombo = ifElse(
  and(propEq("type", "vega-combo"), complement(has("numberOfGroups"))),
  set(lensProp("numberOfGroups"), 500),
  identity
)

function migrateTopNLegendProp(chart) {
  if (
    typeof chart.topnLegendPinned !== "undefined" &&
    typeof chart.layersLegendPinned === "undefined"
  ) {
    chart.layersLegendPinned = chart.topnLegendPinned
    delete chart.topnLegendPinned
  }
  return chart
}

const normalizeChartsState = compose(
  map(
    compose(
      normalizePointmap,
      maybeAddRangeFilter,
      mergeR({ loading: false }),
      dissoc("dcFlag"),
      dissoc("ordering"),
      updateChartSavedColors,
      updateChartSortingIfNeeded,
      addMapZoomCenterBounds,
      updateColorsWithDefaultOther,
      showNullDimensions,
      showAbsoluteValues,
      elasticY,
      baseMap,
      upgradeLineChart,
      upgradeVegaCombo,
      migrateTopNLegendProp
    )
  ),
  dissoc("0")
)

function normalizePointmap(chart) {
  if (chart.type === "pointmap") {
    if (chart.color && chart.color.key === "rainbow") {
      chart = over(
        lensProp("color"),
        mergeR({
          key: "custom",
          type: "custom"
        }),
        chart
      )
    }

    const maxPoints = getFeatureFlag(POINTMAP_MAX_POINTS)
    if (chart.cap > maxPoints) {
      chart.cap = maxPoints
    }
  }
  return chart
}

function addMapZoomCenterBounds(chart) {
  function listWithNamesToObj(list) {
    const objWithNames = {}
    list.forEach((item) => {
      objWithNames[item.name] = item
    })
    return objWithNames
  }

  const SMALL_AMOUNT = 0.00001 // Mapbox doesn't like coords being exactly on the edge.
  const LONMAX = 90 - SMALL_AMOUNT
  const LONMIN = -90 + SMALL_AMOUNT
  const LATMAX = 90 - SMALL_AMOUNT
  const LATMIN = -90 + SMALL_AMOUNT

  if (
    chart.type === "pointmap" &&
    chart.mapZoomCenter &&
    !chart.mapZoomCenter.bounds
  ) {
    const { x: lon, y: lat } = listWithNamesToObj(chart.measures)
    const [lonMin, lonMax] = lon.minMax
    const [latMin, latMax] = lat.minMax

    chart.mapZoomCenter.bounds = {
      latMax: latMax < LATMAX ? latMax : LATMAX,
      latMin: latMin > LATMIN ? latMin : LATMIN,
      lonMax: lonMax < LONMAX ? lonMax : LONMAX,
      lonMin: lonMin > LONMIN ? lonMin : LONMIN
    }
  }

  return chart
}

function updateChartSavedColors(chart) {
  if (colorsNeedUpgrade(chart)) {
    const oldColorMeasure = chart.measures.reduce(
      (result, measure) =>
        (result = measure.name === "color" ? measure : result),
      null
    )
    const newColorMeasure = merge(oldColorMeasure, {
      categories: chart.color.customDomain,
      colorType:
        oldColorMeasure && scaleTypeToColorType(oldColorMeasure.scaleType),
      scaleType: null
    })
    const newMeasures = set(
      lensIndex(newColorMeasure.originIndex),
      newColorMeasure,
      chart.measures
    )
    const colorWithColumn = set(
      lensProp("column"),
      oldColorMeasure && oldColorMeasure.value,
      chart.color
    )
    const savedColorKey = colorWithColumn.column
      ? `custom_${colorWithColumn.column}`
      : colorWithColumn.type
    const migratedSavedColors = colorWithColumn
      ? { [savedColorKey]: colorWithColumn }
      : {}
    const newChart = compose(
      set(lensProp("savedColors"), migratedSavedColors),
      set(lensProp("color"), colorWithColumn),
      set(lensProp("measures"), newMeasures)
    )(chart)
    return newChart
  } else {
    return chart
  }
}
function colorsNeedUpgrade(chart) {
  return chart.color && typeof chart.savedColors === "undefined"
}
function scaleTypeToColorType(scaleType) {
  switch (scaleType) {
    case "continuous":
      return "quantitative"
    case "categorical":
      return "ordinal"
    default:
      return "solid"
  }
}

export const normalizeAppState = compose(
  assocPath(["dashboard", "initialization"], {
    done: false,
    pending: false,
    error: false,
    counter: 0
  }),
  assocPath(["dashboard", "loadState"], {
    request: false,
    complete: false,
    error: false
  }),
  ifElse(
    pathSatisfies((saveState) => typeof saveState === "undefined", [
      "dashboard",
      "saveState"
    ]),
    assocPath(["dashboard", "saveState"], {
      isSaved: false,
      request: false,
      error: false
    }),
    over(lensPath(["dashboard", "saveState"]), without({}))
  ),
  assocPath(["dashboard", "copyState"], {
    request: false,
    error: false
  }),
  ifElse(
    pathSatisfies((streaming) => typeof streaming === "undefined", [
      "dashboard",
      "streaming"
    ]),
    assocPath(["dashboard", "streaming"], {
      interval: 0,
      request: false
    }),
    set(lensPath(["dashboard", "streaming", "request"]), false)
  ),
  over(lensProp("charts"), normalizeChartsState),
  ifElse(
    propSatisfies(
      (omnifilters) => typeof omnifilters === "undefined",
      "omnifilters"
    ),
    set(lensProp("omnifilters"), []),
    over(lensProp("omnifilters"), without([undefined]))
  ),
  ifElse(
    propSatisfies(
      (filterZones) => typeof filterZones === "undefined",
      "filterZones"
    ),
    set(lensProp("filterZones"), {}),
    over(lensProp("filterZones"), without({}))
  ),
  ifElse(
    propSatisfies((cohorts) => typeof cohorts === "undefined", "cohorts"),
    set(lensProp("cohorts"), {}),
    over(lensProp("cohorts"), without({}))
  ),
  ifElse(
    propSatisfies(
      (parameters) => typeof parameters === "undefined",
      "parameters"
    ),
    set(lensProp("parameters"), {}),
    over(lensProp("parameters"), without({}))
  ),
  ifElse(
    propSatisfies(
      (crossLinks) => typeof crossLinks === "undefined",
      "crossLinks"
    ),
    set(lensProp("crossLinks"), []),
    over(lensProp("crossLinks"), without([undefined]))
  ),
  ifElse(
    propSatisfies(
      (chartAddons) => typeof chartAddons === "undefined",
      "chartAddons"
    ),
    set(lensProp("chartAddons"), {}),
    over(lensProp("chartAddons"), without({}))
  ),
  ifElse(
    propSatisfies(
      (joinDataSources) => typeof joinDataSources === "undefined",
      "joinDataSources"
    ),
    set(lensProp("joinDataSources"), []),
    over(lensProp("joinDataSources"), without([undefined]))
  ),
  ifElse(
    propSatisfies(
      (sharedSettings) => typeof sharedSettings === "undefined",
      "sharedSettings"
    ),
    set(lensProp("sharedSettings"), { mappings: [] }),
    over(lensProp("sharedSettings"), without([undefined]))
  ),
  msdCompatibilityReducer
)

const isISODateString = (s) =>
  typeof s === "string" && moment(s, moment.ISO_8601, true).isValid()

const makeDate = (s) =>
  s === null || s === undefined ? s : moment(s, moment.ISO_8601, true).toDate()

const maybeMakeDate = ifElse(isISODateString, makeDate, identity)
const convertDateStringArrayToDates = (dateStringArray) =>
  dateStringArray && dateStringArray.map((s) => makeDate(s))

export const convertDateStringsToDateObjects = compose(
  over(lensProp("currentLowValue"), makeDate),
  over(lensProp("currentHighValue"), makeDate),
  over(lensProp("max_val"), makeDate),
  over(lensProp("min_val"), makeDate),
  over(lensProp("minMax"), convertDateStringArrayToDates),
  over(lensProp("initDomain"), convertDateStringArrayToDates)
)

export const maybeConvertDateStringsToDateObjects = compose(
  ifElse(
    (o) => o.currentLowValue && isISODateString(o.currentLowValue),
    over(lensProp("currentLowValue"), makeDate),
    identity
  ),
  ifElse(
    (o) => o.currentHighValue && isISODateString(o.currentHighValue),
    over(lensProp("currentHighValue"), makeDate),
    identity
  ),
  ifElse(
    (o) => o.max_val && isISODateString(o.max_val),
    over(lensProp("max_val"), makeDate),
    identity
  ),
  ifElse(
    (o) => o.min_val && isISODateString(o.min_val),
    over(lensProp("min_val"), makeDate),
    identity
  )
)

export const replaceValuesIfTimeStamp = ifElse(
  ({ type }) => type === "TIMESTAMP" || type === "DATE",
  convertDateStringsToDateObjects,
  identity
)

export const replaceValuesIfDateFilter = (filterObj) => {
  if (Array.isArray(filterObj)) {
    return map((value) => replaceValuesIfDateFilter(value), filterObj)
  } else if (
    typeof filterObj === "string" &&
    moment(filterObj, moment.ISO_8601, true).isValid()
  ) {
    return new Date(filterObj)
  } else {
    return filterObj
  }
}

export const convertISODatesToRegularDates = compose(
  ifElse(
    has("dimensions"),
    over(lensProp("dimensions"), map(replaceValuesIfTimeStamp)),
    identity
  ),
  ifElse(
    has("filters"),
    over(lensProp("filters"), map(replaceValuesIfDateFilter)),
    identity
  ),
  ifElse(
    has("rangeFilter"),
    over(lensProp("rangeFilter"), map(replaceValuesIfDateFilter)),
    identity
  ),
  ifElse(
    (chart) => chart.binSettings,
    over(lensProp("binSettings"), maybeConvertDateStringsToDateObjects),
    identity
  )
)

export const convertISODatesInRelativeOmnifilterValue = (v) => {
  if (isISODateString(v)) {
    return makeDate(v)
  } else if (v && v.value) {
    return {
      ...v,
      value: convertISODatesInRelativeOmnifilterValue(v.value)
    }
  }
  return v
}

export const convertISODatesInOmnifilters = (filter) => {
  if (filterHasChild(filter)) {
    return {
      ...filter,
      filter: convertISODatesInOmnifilters(filter.filter)
    }
  } else if (filterHasChildren(filter)) {
    return {
      ...filter,
      filters: map(convertISODatesInOmnifilters, filter.filters)
    }
  } else if (isMultiSourceFilter(filter)) {
    return {
      ...filter,
      filtersByDataSource: map(
        convertISODatesInOmnifilters,
        filter.filtersByDataSource
      )
    }
  } else if (isTimeType(filter.dataType)) {
    if (filter.filterType === FILTER_TYPE_SIMPLE) {
      return {
        ...filter,
        value: maybeMakeDate(filter.value)
      }
    } else if (filter.filterType === FILTER_TYPE_BETWEEN) {
      return {
        ...filter,
        start: convertISODatesInRelativeOmnifilterValue(filter.start),
        end: convertISODatesInRelativeOmnifilterValue(filter.end)
      }
    } else if (
      filter.filterType === FILTER_TYPE_IN ||
      filter.filterType === FILTER_TYPE_NOT_IN
    ) {
      return {
        ...filter,
        values: map(maybeMakeDate, filter.values)
      }
    }
  }
  return filter
}

export const convertISODatesInOmnifiltersMeta = compose(
  ifElse(
    (o) => o && o.cohortDimension && o.cohortDimension.postFilters,
    over(
      lensPath(["cohortDimension", "postFilters"]),
      map(convertISODatesInOmnifilters)
    ),
    identity
  ),
  over(lensProp("filter"), map(convertISODatesInOmnifilters))
)

export const setNumCharts = (num) =>
  over(lensProp("initialRender"), set(lensProp("numCharts"), num))

export const preservePending = (pending) =>
  over(lensProp("initialRender"), set(lensProp("pending"), pending))

export const normalizeDCState = (
  { chartContainers },
  { initialRender },
  charts
) => {
  const dcCharts = chartContainers.filter(
    (d) => d.id && charts[d.id] && !charts[d.id].isNotDc
  )
  return compose(
    setNumCharts(dcCharts.length + 1),
    preservePending(initialRender.pending)
  )
}

export const checkForCustomBasemap = (charts) => {
  if (isEmpty(charts)) {
    return charts
  }

  // if a dashboard chart has a custom basemap in chart.basemap, make sure it exists (from servers.json)
  // else replace it with the default basemap
  forEach(charts, (chart) => {
    chart.basemap = normalizeBasemap(chart.basemap)
    if (!validBasemap(chart)) {
      chart.basemap = upgradeBasemap(chart)
    }
  })

  return charts
}

export default function loadDashboardHigherOrderReducer(reducer) {
  return (state, action) => {
    if (action.type === LOAD_DASHBOARD_SUCCESS) {
      const {
        annotations,
        charts,
        dashboard,
        filters,
        omnifilters,
        filterZones,
        cohorts,
        parameters,
        crossLinks,
        chartAddons,
        joinDataSources,
        sharedSettings
      } = normalizeAppState(action.dashboardState)
      const dc = normalizeDCState(dashboard, state.dc, charts)(initialDCState)

      if (Object.keys(filterZones).length === 0) {
        const defaultFilterSet = getDefaultFilterSet()
        filterZones[defaultFilterSet.id] = defaultFilterSet.filterSet
      }

      if (
        Object.keys(parameters).length === 0 ||
        Object.keys(parameters.sets).length === 0
      ) {
        const defaultParamsData = getDefaultParametersData()
        parameters.values = defaultParamsData.values
        parameters.sets = defaultParamsData.sets
        parameters.definitions = defaultParamsData.definitions
      }

      if (
        action.selectedTabId &&
        !Object.values(parameters.sets).some(
          (parameterSet) => parameterSet.tabId === action.selectedTabId
        )
      ) {
        const dashboardParameterSet = Object.values(parameters.sets).find(
          (parameterSet) => parameterSet.tabId === undefined
        )

        const tabParameterSet = getParameterSet({
          tabId: action.selectedTabId,
          parent: dashboardParameterSet.id
        })
        parameters.sets[tabParameterSet.id] = tabParameterSet
      }

      return Object.assign({}, state, {
        annotations,
        charts: map(
          convertISODatesToRegularDates,
          checkForCustomBasemap(upgradeCharts(charts))
        ),
        dashboard: {
          ...dashboard,
          id: action.dashboardId,
          owner: action.dashboardOwner,
          raw: cloneDeep(action.dashboardState),
          tabs:
            state.dashboard.id === action.dashboardId && state.dashboard.tabs
              ? state.dashboard.tabs
              : action.dashboardTabs,
          selectedTabId: action.selectedTabId
        },
        // Reset UI state on dashboard load to make the behavior similar to old behavior where we'd
        // save UI state to serialized dashboards, and set the UI state on dashboard load
        ui: { ...initialUIState },
        filters,
        omnifilters: map(convertISODatesInOmnifilters, omnifilters),
        dc,
        filterZones,
        cohorts,
        parameters,
        crossLinks,
        chartAddons,
        joinDataSources,
        sharedSettings
      })
    } else if (action.type === CONFIRM_LOAD_DASHBOARD_ERROR) {
      return Object.assign({}, state, {
        dashboard: Object.assign({}, state.dashboard, {
          loadState: {
            request: false,
            error: false,
            dataAccessError: false
          }
        }),
        dashboards: { ...state.dashboards, dashboardLoading: false },
        dc: initialDCState
      })
    } else {
      return reducer(state, action)
    }
  }
}
