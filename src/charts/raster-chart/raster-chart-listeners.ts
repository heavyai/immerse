// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as ChartActions from "actions/charts-action-creators"
import { setCurrentDataSourceByChartId } from "actions/dashboard-action-creators"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"
import { colorDomainSetter, isMultiLayer } from "./raster-utils"
import { debounce } from "utils/helpers"
import {
  HOVER_DEBOUNCE_MS,
  MAP_UPDATE_DEBOUNCE
} from "constants/magic-variables"
import { mountAction } from "charts/utils/event-listeners"
import { saveLegendOpenState } from "./geoheat-actions"
import {
  updateColorLegend,
  createLabelUpdate,
  checkLayerVisibility,
  updateChartsBound,
  updateChartsZoom,
  deleteChartsPreviousBound
} from "./raster-chart-actions"
import { importableStore as store } from "store/importableStore"
import { CHART_REDRAW_ERROR, UPDATE_CHART } from "constants/action-types"
import action from "utils/redux/action"
import { setAppError } from "actions/app-action-creators"
import { isMapMoveCrossFilterPaused } from "services/ConnectorWithQueue"
import { throttle } from "lodash"
import { updateChart } from "actions/update-chart-action-creator"
import {
  handleLineDraw,
  removeParametersForShape
} from "charts/raster-chart/raster-chart-parameter-actions"
import { toggleLineDrawButtonDisabled } from "charts/raster-chart/cross-section/utils/toggle-line-draw-button-disabled"
import {
  setEndpointLabelsFromLines,
  setLineLabelData
} from "charts/utils/map-transect-draw"

function updateChartBounds(chartId, dcChart, mapZoomCenter) {
  const chart = store.getState().charts[chartId]

  if (
    !chart ||
    !isMultiLayer(chart.type) ||
    chart.dcFlag !== dcChart.chartID()
  ) {
    // This can be triggered while we're still tearing down a previous
    // dashboard, and our sequential chartIds are likely to collide. Check the
    // dcFlag to make sure the chart that receives the update is the same
    // that triggered it.
    return
  }

  store.dispatch(
    updateChartsBound(chartId, {
      mapZoomCenter
    })
  )
  // For Master layer view, we added a slider to adjust layer visibility based on zoom range
  // Thus, we listen zoom event on Master layer to update the layer visibility - "active" property
  // NOTE: Checking master layer is inside checkLayerVisibility because dcChart.getLayers() returns
  // empty array if all layers are not active
  store.dispatch(checkLayerVisibility(chartId))
}

const movementCallback = (chartId, dcChart, mapZoomCenter) => {
  if (isMapMoveCrossFilterPaused(chartId)) {
    return
  }
  dcChart.hidePopup()
  if (chartId) {
    updateChartBounds(chartId, dcChart, mapZoomCenter)
  }
}
const zoomCallback = (chartId) => {
  store.dispatch(deleteChartsPreviousBound(chartId))
}
const updateLinkedChartsZoom = throttle(
  (chartId, mapZoomCenter) => {
    if (chartId) {
      store.dispatch(updateChartsZoom(chartId, mapZoomCenter))
    }
  },
  MAP_UPDATE_DEBOUNCE,
  { leading: false, trailing: true }
)

const setupListeners = ({ chartId, type }, dcChart) => {
  let lastRefresh = null
  dcChart.on("vegaSpec", (_chart, spec) => {
    const refresh = store.getState().dashboard.streaming.last_request
    if (lastRefresh !== refresh) {
      lastRefresh = refresh
      spec.usermeta = spec.usermeta || {}
      spec.usermeta.clearCaches = true
    }
  })

  dcChart.on("setCustomContLegend", (_chart, event) => {
    store.dispatch(updateColorLegend(chartId, { colorDomain: event.detail }))
    const layer = dcChart.getLayer(type)
    if (layer) {
      layer.setState(colorDomainSetter(event.detail))
    }
  })

  dcChart.legend().on("input.component", ({ domain, index = 0 }) => {
    store.dispatch(updateColorLegend(chartId, { colorDomain: domain }, index))
    // automatically lock color legend when min/max input changes
    store.dispatch(updateColorLegend(chartId, { legendLocked: true }, index))
  })

  dcChart.on("clearCustomContLegend", () => {
    store.dispatch(updateColorLegend(chartId, { colorDomain: null }))
    const layer = dcChart.getLayer(type)
    if (layer) {
      layer.setState(colorDomainSetter("auto"))
    }
  })

  dcChart.on("dataError", (_chart, error) => {
    store.dispatch(
      action(CHART_REDRAW_ERROR, {
        error,
        id: chartId
      })
    )

    // Why both `chartRedrawError` and `setChartHasError`? Read on.
    store.dispatch(setAppError(CHART_REDRAW_ERROR, error))
    //
    // `chartRedrawError` sets an `error` and `id` in state.dc.redraw while `setChartHasError`
    // sets `hasError` on a single chart in state.charts[]. `chartRedrawError` has a side effect
    // of triggering the error modal (among other possible side effects).
    //
    // `setChartHasError` prevents `createGeoHeatChart` from being called again in createRasterComponent
    // (src/charts/raster-chart/raster-chart-component) if it errors out the first time (see
    // `this.props.hasError` logic in `componentDidMount`).
    //
    // This is the async raster chart version of something similar we're doing in createChartComponent
    // (src/charts/components/create-chart-component)
    store.dispatch(ChartActions.setChartHasError(chartId, error))
  })

  dcChart.on("filtered", async (_chart, _filter, areFiltersInverse) => {
    // Stopgap, lines can be inadventently cleared
    // by filterAll. Ideally lines shouldn't be affected by filter events at all,
    // but at least keep the button state in sync with it.
    toggleLineDrawButtonDisabled(chartId, dcChart.filters())
    setEndpointLabelsFromLines(dcChart)

    const filters = [
      ...dcChart.filters().filter((f) => f.type !== "LatLonPolyLine")
    ]
    await store.dispatch(setCurrentDataSourceByChartId(chartId))
    await store.dispatch(updateChart(chartId, { filters, areFiltersInverse }))
    await store.dispatch(updateDashboardSaveState())
  })

  dcChart.legend().on("open.component", (index = 0) => {
    // layer legend open/collapse event in stacked legend only. It should
    // expect legend index which corresponds to layer index
    const legend = dcChart.getLayers()[index].getState().encoding.color.legend
    if (legend) {
      store.dispatch(saveLegendOpenState(chartId, index, legend.open))
    }
  })

  dcChart.legend().on("toggle.component", () => {
    // chart legend open/collapse event
    const legend = dcChart.legend()
    if (legend) {
      dcChart.legendOpen(legend.state.open)
      store.dispatch(saveLegendOpenState(chartId, null, legend.state.open))
    }
  })

  dcChart.legend().on("lock.component", ({ index = 0 }) => {
    const layer = dcChart.getLayers()[index]
    if (layer) {
      const legend = layer.getState().encoding.color.legend
      if (legend) {
        store.dispatch(
          updateColorLegend(chartId, { legendLocked: legend.locked }, index)
        )

        if (legend.locked === false) {
          store.dispatch(
            updateColorLegend(chartId, { colorDomain: null }, index)
          )
        }
      }
    }
  })

  const getMapZoomCenter = () => {
    const { _ne, _sw } = dcChart.map().getBounds()
    return {
      zoom: dcChart.map().getZoom(),
      center: dcChart.map().getCenter(),
      bounds: {
        lonMin: _sw.lng,
        lonMax: _ne.lng,
        latMin: _sw.lat,
        latMax: _ne.lat
      }
    }
  }

  if (type !== "geoheat") {
    // bool to avoid race condition between showing & hiding popup
    let dragging = false
    let userHasMousedOut = false
    const debouncedGetClosestResults = debounce((event) => {
      if (dragging) {
        return
      }

      const chart = store.getState().charts[chartId]
      // sends hit testing request only if popup is enabled
      const enableHitTesting =
        chart && chart.currentLayer && chart.currentLayer === "master"
          ? chart.layers.some((layer) => layer.popupEnabled)
          : chart.popupEnabled
      if (enableHitTesting) {
        dcChart.getClosestResult(event.point, (...args) => {
          if (!userHasMousedOut) {
            dcChart.hidePopup()
            dcChart.displayPopup(...args)
          }
        })
      }
    }, HOVER_DEBOUNCE_MS)

    dcChart.map().on("mousedown", () => {
      dragging = true
    })

    dcChart.map().on("mouseup", () => {
      dragging = false
    })

    dcChart.map().on("mousemove", (e) => {
      if (type === "backendScatter" && e.point.x <= 3) {
        userHasMousedOut = true
        dcChart.hidePopup()
      } else {
        userHasMousedOut = false
        debouncedGetClosestResults(e)
      }
    })

    dcChart.map().on("mouseout", (e) => {
      if (
        e.originalEvent.relatedTarget &&
        e.originalEvent.relatedTarget.className === "map-popup-box-new"
      ) {
        userHasMousedOut = true
      } else {
        dcChart.hidePopup()
        userHasMousedOut = false
      }
    })

    dcChart.map().on("move", () => {
      const mapZoomCenter = getMapZoomCenter()
      movementCallback(chartId, dcChart, mapZoomCenter)
    })
  }

  if (type === "backendScatter") {
    mountAction("xLabel", (_chart, _id, label) =>
      store.dispatch(createLabelUpdate(chartId, 0, label))
    )({ chartId }, dcChart)
    mountAction("yLabel", (_chart, _id, label) =>
      store.dispatch(createLabelUpdate(chartId, 1, label))
    )({ chartId }, dcChart)
  } else {
    dcChart.map().on("moveend", () => {
      if (chartId) {
        // Get the map view state deets now and pass as argument instead of grabbing from state later
        // state updates are happening async and could be out of date.
        const mapZoomCenter = getMapZoomCenter()

        // Update chart bounds on move end but then throttled update linked charts
        updateChartBounds(chartId, dcChart, mapZoomCenter)

        // Cancel any zoom setting we already have going on
        // This prevents most unexpected view state changes if we had
        // already called this from a previous moveend
        updateLinkedChartsZoom?.cancel?.()
        updateLinkedChartsZoom(chartId, mapZoomCenter)
      }
    })
  }
  if (dcChart) {
    dcChart.onDrawEvent(["lasso:shape:create"], (e) => {
      if (e.shape && e.shape.toJSON().type === "LatLonPolyLine") {
        store.dispatch(handleLineDraw(chartId, e.shape))

        const filters = dcChart.filter()
        toggleLineDrawButtonDisabled(chartId, filters)

        store.dispatch({
          type: UPDATE_CHART,
          chartId,
          payload: {
            crossSectionLines: [e.shape.toJSON()]
          }
        })

        setEndpointLabelsFromLines(dcChart)
      }
    })

    dcChart.onDrawEvent(["lasso:shape:edits:end"], (e) => {
      const line = e.shapes.find((s) => s.toJSON().type === "LatLonPolyLine")

      if (line) {
        const filters = dcChart.filter()

        store.dispatch({
          type: UPDATE_CHART,
          chartId,
          payload: {
            crossSectionLines: [line]
          }
        })
        toggleLineDrawButtonDisabled(chartId, filters)

        if (line) {
          store.dispatch(handleLineDraw(chartId, line))
        }
      }

      setEndpointLabelsFromLines(dcChart)
    })

    dcChart.onDrawEvent(["lasso:shape:edits:begin"], (e) => {
      // Clear out the old labels as soon as a line is being edited, else this can look laggy
      if (e.shapes.find((s) => s.toJSON().type === "LatLonPolyLine")) {
        setLineLabelData(dcChart, [])
      }
    })

    dcChart.onDrawEvent(["lasso:shape:destroy"], (e) => {
      if (e.shape && e.shape.toJSON().type === "LatLonPolyLine") {
        store.dispatch(removeParametersForShape(chartId, e.shape))

        const filters = dcChart.filter()
        toggleLineDrawButtonDisabled(chartId, filters)

        store.dispatch({
          type: UPDATE_CHART,
          chartId,
          payload: {
            crossSectionLines: []
          }
        })

        setEndpointLabelsFromLines(dcChart)
      }
    })

    dcChart.map().on("zoomstart", () => zoomCallback(chartId, dcChart))
  }
}

export default setupListeners
