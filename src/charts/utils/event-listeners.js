// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { setCurrentDataSourceByChartId } from "actions/dashboard-action-creators"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"
import {
  setElasticX,
  setElasticY,
  updateBinBoundsVal,
  updateMeasureDomains,
  updateTimeBinInputVal
} from "actions/charts-action-creators"
import { updateChart } from "actions/update-chart-action-creator"
import {
  syncBinInterval,
  xAxisDomainDimensionUpdate
} from "charts/line/line-chart-action-creators"
import { importableStore as store } from "store/importableStore"
import { updateColorLegend } from "../raster-chart/raster-chart-actions"
import {
  updateSelectorAction,
  getHeatDimensionBinningAsync
} from "actions/selector-action-creators"
import {
  customCategoricalColor,
  isD3ChartWithCategoricalColoring
} from "reducers/charts/helpers/color-helpers"

// ------------------ D3 Event Listeners -----------------------

export function filteredListener(
  { id, dispatch = store.dispatch },
  dcChart,
  eventEmitterName
) {
  dcChart.on(eventEmitterName, (chart, filter, areFiltersInverse) => {
    let action = null
    const filters = dcChart.filters().slice(0)
    if (dcChart.range && dcChart.range()) {
      const rangeFilter = dcChart.range().filters().slice(0)
      action = updateChart(id, {
        filters,
        areFiltersInverse,
        rangeFilter,
        userGenerated: true
      })
    } else {
      action = updateChart(id, {
        filters,
        areFiltersInverse,
        userGenerated: true
      })
    }
    dispatch(setCurrentDataSourceByChartId(id))
    dispatch(action)
    dispatch(updateDashboardSaveState())
  })
}

export function binEventListenerForLine(
  { id, dispatch = store.dispatch },
  dcChart,
  eventEmitterName
) {
  dcChart.on(eventEmitterName, (chart, timeBinInputVal) => {
    dispatch(syncBinInterval(id, timeBinInputVal))
  })
}

export function binEventListener(
  { id, dispatch = store.dispatch },
  dcChart,
  eventEmitterName
) {
  dcChart.on(eventEmitterName, (chart, timeBinInputVal) => {
    const action = updateTimeBinInputVal(id, 0, timeBinInputVal)
    dispatch(action)
  })
}

export function sortEventListener(
  { id, dispatch = store.dispatch },
  dcChart,
  eventEmitterName
) {
  dcChart.on(eventEmitterName, (chart, sortColumn) => {
    const action = updateChart(id, { sortColumn })
    dispatch(action)
  })
}

export function alignEventListener(
  { id, dispatch = store.dispatch },
  dcChart,
  eventEmitterName
) {
  dcChart.on(eventEmitterName, (chart, columnAlignments) => {
    const action = updateChart(id, { columnAlignments })
    dispatch(action)
  })
}

export function dataFetchListener({ id, dispatch = store.dispatch }, dcChart) {
  dcChart.on("dataFetch", () => {
    dispatch(updateChart(id, { loading: true }))
  })
}

export function dataErrorListener({ id, dispatch = store.dispatch }, dcChart) {
  dcChart.on("dataError", () => {
    dispatch(updateChart(id, { loading: false }))
  })
}

export function postRedrawListener({ id, dispatch = store.dispatch }, dcChart) {
  dcChart.on("postRedraw", () => {
    dispatch(updateChart(id, { loading: false }))
  })
}

export function setCustomContLegendListener(
  { id, dispatch = store.dispatch },
  dcChart
) {
  dcChart.on("setCustomContLegend", (chart, event) => {
    dispatch(updateColorLegend(id, { colorDomain: event.detail }))
  })
}

export function updateBinBoundsListener(
  { id, dispatch = store.dispatch },
  dcChart
) {
  dcChart.on("updateBinBounds", (chart, bounds) => {
    dispatch(updateBinBoundsVal(id, 0, bounds))
  })
}

export function clearCustomContLegendListener(
  { id, dispatch = store.dispatch },
  dcChart
) {
  dcChart.on("clearCustomContLegend", () => {
    dispatch(updateColorLegend(id, { colorDomain: null }))
  })
}

export function preDataListener({ id, dispatch = store.dispatch }, dcChart) {
  dcChart.on("preData", (chart, domains) => {
    dispatch(updateMeasureDomains(id, domains))
  })
}

export function createLabelUpdateFunction(
  labelEvent,
  selectorType,
  index,
  setValue
) {
  return ({ id, dispatch = store.dispatch }, dcChart) => {
    dcChart.on(labelEvent, (chart, label) => {
      dispatch(updateSelectorAction(id, selectorType, index, setValue(label)))
    })
  }
}

export function elasticYListener({ id, dispatch = store.dispatch }, dcChart) {
  dcChart.on("elasticY", (chart) => {
    dispatch(setElasticY(id, chart.elasticY()))
  })
}

export function elasticXListener({ id, dispatch = store.dispatch }, dcChart) {
  dcChart.on("elasticX", (chart) => {
    dispatch(setElasticX(id, chart.elasticX()))
  })
}

export const heatElasticXListener = (
  { id, dispatch = store.dispatch },
  dcChart
) => {
  dcChart.on("elasticX", (chart) => {
    const { charts } = store.getState()
    const { type: chartType, dimensions, elasticX } = charts[id]
    if (!elasticX) {
      dispatch(
        getHeatDimensionBinningAsync(id, chartType, 0, dimensions[0], chart)
      ).then(() => {
        dispatch(setElasticX(id, chart.elasticX()))
      })
    } else {
      dispatch(setElasticX(id, chart.elasticX()))
    }
  })
}

export const heatElasticYListener = (
  { id, dispatch = store.dispatch },
  dcChart
) => {
  dcChart.on("elasticY", (chart) => {
    const { charts } = store.getState()
    const { type: chartType, dimensions, elasticY } = charts[id]
    if (!elasticY) {
      dispatch(
        getHeatDimensionBinningAsync(id, chartType, 1, dimensions[1], chart)
      ).then(() => {
        dispatch(setElasticY(id, chart.elasticY()))
      })
    } else {
      dispatch(setElasticY(id, chart.elasticY()))
    }
  })
}

export function createAxisDomainUpdateFunction(
  axisDomain,
  selectorType,
  selectorIndex,
  createSetter
) {
  return ({ id, dispatch = store.dispatch }, dcChart) => {
    dcChart.on(axisDomain, (chart, domain) => {
      dispatch({
        type: "UPDATE_SELECTOR",
        chartId: id,
        selectorType,
        selectorIndex,
        setter: createSetter(domain)
      })
    })
  }
}

export function xAxisDomainListener(
  { id, dispatch = store.dispatch },
  dcChart
) {
  dcChart.on("xDomain", (chart, domain) => {
    dispatch(xAxisDomainDimensionUpdate(id, domain))
  })
}

export function mountAction(event, action) {
  return ({ id }, dcChart) => {
    dcChart.on(event, (chart, ...data) => {
      action(chart, id, ...data)
    })
  }
}

export function createD3CustomDomainRangeUpdateListener(events) {
  return ({ id, dispatch = store.dispatch }, dcChart) => {
    for (const event of events) {
      dcChart.on(event, () => {
        const state = store.getState()
        const chart = state.charts[id]
        const dimension = chart?.dimensions[0]

        // set up chart.color object for palette mappings if we have a d3 chart
        // with categorical coloring and no palette mapping applied
        if (
          isD3ChartWithCategoricalColoring(chart) &&
          !chart?.color?.paletteMappingId
        ) {
          dispatch(
            updateChart(id, {
              color: customCategoricalColor({
                value: dimension.value,
                categories: dcChart.customDomain() ?? [],
                type: dimension.type,
                hideOther: !chart.showAllOthers,
                initMinMax: dcChart.customDomain() ?? [],
                color: { color: chart.color },
                customRange: dcChart.customRange() ?? []
              })
            })
          )
        }
      })
    }
  }
}
// ------------------- MapBox Listeners ------------------------

export function savePositionAndZoomOfMap(
  { id, dispatch = store.dispatch },
  dcChart,
  eventEmitterName
) {
  dcChart.map().on(eventEmitterName, () => {
    if (id) {
      const { _ne, _sw } = dcChart.map().getBounds()
      dispatch(setCurrentDataSourceByChartId(id))
      dispatch(
        updateChart(id, {
          mapZoomCenter: {
            zoom: dcChart.map().getZoom(),
            center: dcChart.map().getCenter(),
            bounds: {
              lonMin: _sw.lng,
              lonMax: _ne.lng,
              latMin: _sw.lat,
              latMax: _ne.lat
            }
          }
        })
      )
    }
  })
}

export default {
  filtered: filteredListener,
  setCustomContLegend: setCustomContLegendListener,
  clearCustomContLegend: clearCustomContLegendListener
}
