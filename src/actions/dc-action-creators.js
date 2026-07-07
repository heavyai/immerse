// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import notifyImmerseLoaded from "services/external-messenger-api/notifyImmerseLoaded"

import { setAppError } from "actions/app-action-creators"
import {
  CHART_REDRAW_ERROR,
  CHART_REDRAW_REQUEST,
  CHART_REDRAW_SUCCESS,
  CHART_RENDER_ERROR,
  CHART_RENDER_REQUEST,
  CHART_RENDER_SUCCESS,
  INITIAL_RENDER_DONE,
  INITIAL_RENDER_ERROR,
  REDRAW_ALL_ERROR,
  REDRAW_ALL_REQUEST,
  REDRAW_ALL_SUCCESS,
  REFRESH_BINNED_DATA,
  RENDER_ALL_ERROR,
  RENDER_ALL_REQUEST,
  RENDER_ALL_SUCCESS,
  RESET_SPECIFIC_DC_STATE
} from "constants/action-types"
import action from "utils/redux/action"

import { setChartZoom } from "actions/map-charts-filter-action-creators"
import { hasBoundingBoxFilter } from "vega/utils/filter"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"

export const chartRenderRequest = (id) => action(CHART_RENDER_REQUEST, { id })

export const chartRenderError = (error, id) =>
  action(CHART_RENDER_ERROR, { error, id })

export const handleAllChartsRendered = (id, dashboardId, tabId) => (
  dispatch,
  getState,
  services
) => {
  services.get("dc").resetRedrawStack()
  dispatch(action(RENDER_ALL_SUCCESS, { dashboardId, tabId }))
  dispatch(action(INITIAL_RENDER_DONE, { dashboardId, tabId }))
  dispatch(action(REFRESH_BINNED_DATA, { dashboardId, tabId }))
  notifyImmerseLoaded()

  // TODO : After the completion of the initial render, if we have a bounding
  // box filter, then poke the BE Choropleth to update the count widget. This is probably due
  // to the charts no longer being poked which
  // adjusted the CSS a little bit. This is almost assuredly not how we actually
  // want to do this, but it should properly reset the bounding box on the BE Choropleth chart
  // which'll update the crossfilters and tide us over for a little while.
  const currentState = getState()
  Object.keys(currentState.charts).forEach((chartId) => {
    if (currentState.charts[chartId].type === "backendChoropleth") {
      const omnifilters = currentState.omnifilters
      const isEditingChart = currentState.chartEditor.editing
      if (!isEditingChart) {
        for (const filter of omnifilters) {
          if (hasBoundingBoxFilter(filter)) {
            dispatch(setChartZoom(filter.chartId, filter.mapZoomCenter))
          }
        }
      }
    }
  })
  // end TODO
}

export const chartRenderSuccess = (id, dashboardId, tabId) => (
  dispatch,
  getState,
  services
) => {
  dispatch(action(CHART_RENDER_SUCCESS, { id, dashboardId, tabId }))

  const {
    dc: {
      initialRender: { done, numCharts, counter },
      renderAll
    },
    charts
  } = getState()

  let numRenderedCharts = counter

  if (getFeatureFlag(available_feature_flags.CHART_LEVEL_ERRORS)) {
    const numErroredCharts = Object.values(charts).reduce(
      (total, c) => (c.dataError ? total + 1 : total),
      0
    )

    numRenderedCharts += numErroredCharts
  }

  if (!done && numCharts === numRenderedCharts && !renderAll.pending) {
    dispatch(action(RENDER_ALL_REQUEST))

    return services
      .get("dc")
      .renderAllAsync(null, true)
      .then(() => {
        dispatch(handleAllChartsRendered(id, dashboardId, tabId))
      })
      .catch((error) => {
        /**
         * There are core features (removing charts, refreshing dashboard) that
         * we prevent if we've set a render error. Presumably, in the world of
         * chart level errors, aside from setting an error on the chart, we
         * should otherwise pretend everything is fine.
         */
        if (getFeatureFlag(available_feature_flags.CHART_LEVEL_ERRORS)) {
          dispatch(handleAllChartsRendered(id, dashboardId, tabId))
        } else {
          dispatch(action(RENDER_ALL_ERROR, { error, dashboardId, tabId }))
          dispatch(action(INITIAL_RENDER_ERROR, { error, dashboardId, tabId }))
        }
      })
  } else {
    return null
  }
}

export const redrawAll = (group, all, excludeDcChart) => (
  dispatch,
  getState,
  services
) => {
  dispatch(action(REDRAW_ALL_REQUEST))

  const { id: dashboardId, selectedTabId: tabId } = getState().dashboard

  return services
    .get("dc")
    .redrawAllAsync(group, all, excludeDcChart)
    .then(() => {
      return dispatch(action(REDRAW_ALL_SUCCESS, { dashboardId, tabId, group }))
    })
    .catch((error) => {
      dispatch(setAppError(REDRAW_ALL_ERROR, error))
    })
}

export const renderChartRedrawAllWithExcludeChart = (
  dcChart,
  id,
  dataSource
) => (dispatch, getState) => {
  dispatch(chartRenderRequest(id))
  const { id: dashboardId, selectedTabId: tabId } = getState().dashboard
  return dcChart
    .renderAsync()
    .then(() => {
      dispatch(action(CHART_RENDER_SUCCESS, { id, dashboardId, tabId }))
      dispatch(redrawAll(dataSource, false, dcChart))
    })
    .catch((error) => dispatch(chartRenderError(error, id)))
}

export const renderChart = (dcChart, id) => (dispatch, getState) => {
  const { id: dashboardId, selectedTabId: tabId } = getState().dashboard
  dispatch(chartRenderRequest(id))
  return dcChart
    .renderAsync()
    .then(() =>
      dispatch(action(CHART_RENDER_SUCCESS, { id, dashboardId, tabId }))
    )
    .catch((error) => dispatch(chartRenderError(error, id)))
}

export const resetSpecificDCState = (key) => ({
  type: RESET_SPECIFIC_DC_STATE,
  key
})

export const redrawChart = (dcChart, id, expireCache) => (
  dispatch,
  getState
) => {
  const { id: dashboardId, selectedTabId: tabId } = getState().dashboard
  dispatch(action(CHART_REDRAW_REQUEST, { id }))

  if (expireCache) {
    dcChart.expireCache()
  }

  return dcChart
    .redrawAsync()
    .then(() =>
      dispatch(action(CHART_REDRAW_SUCCESS, { id, dashboardId, tabId }))
    )
    .catch((error) => dispatch(action(CHART_REDRAW_ERROR, { error, id })))
}

export const redrawAllFromDashboardFilter = (group, all) => (
  dispatch,
  getState,
  services
) => {
  dispatch(action(REDRAW_ALL_REQUEST))
  const { id: dashboardId, selectedTabId: tabId } = getState().dashboard
  return services
    .get("dc")
    .redrawAllAsync(group, all)
    .then(() =>
      dispatch(action(REDRAW_ALL_SUCCESS, { dashboardId, tabId, group }))
    )
}

export const addPointMapEventListeners = (editId) => (
  dispatch,
  getState,
  services
) => {
  const { charts } = getState()
  Object.keys(charts).forEach((id) => {
    const dcChart = services.get("dc").getChart(charts[id].dcFlag)
    // This dcChart may be undefined if this function is called when exiting chart editor and we are resetting the chart
    // to its saved state. If so, the chart is recreated with a new dcFlag and handleResetRasterChart takes care of adding
    // these listeners instead.
    if (dcChart && charts[id].type === "pointmap" && editId !== id) {
      dcChart.addMapListeners()
    }
  })
}

export const removePointMapEventListeners = (editId) => (
  dispatch,
  getState,
  services
) => {
  const { charts } = getState()
  Object.keys(charts).forEach((id) => {
    if (charts[id].type === "pointmap" && editId !== id) {
      const dcChart = services.get("dc").getChart(charts[id].dcFlag)
      if (dcChart) {
        dcChart.removeMapListeners()
      }
    }
  })
}
