// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// It is not helping anyone to have typescript
// errors squiggling this whole file ATM, its not even close

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { lassoToolSetTypes } from "@heavyai/charting"
import * as ActionTypes from "./geoheat-actions"
import * as ChartActions from "actions/charts-action-creators"
import * as DCActions from "actions/dc-action-creators"
import * as RasterActions from "charts/raster-chart/raster-chart-actions"
import * as AppActions from "actions/app-action-creators"
import {
  all,
  apply,
  call,
  put,
  select,
  take,
  takeEvery
} from "redux-saga/effects"
import { updateChartType } from "actions/update-chart-type-action-creators"
import { updateChart } from "actions/update-chart-action-creator"
import {
  CHART_RENDER_SUCCESS,
  APPLY_SAVED_PALETTE_MAPPING,
  CLEAR_PALETTE_MAPPING
} from "constants/action-types"
import {
  colorDomainSetter,
  isLayerValid,
  selectChart,
  getRasterLegendProp,
  isRasterPointChart,
  isRasterChart,
  isGeoTypeSupportedRasterChart,
  isMultiLayer,
  isGeoChart,
  isWindbarbChartType,
  getMultiLayerName
} from "./raster-utils"
import { currentBasemapValue } from "./basemap"
import {
  createHeatLayer,
  handleUpdateGeoHeatSettings,
  setGeoHeatDimension
} from "./heat"
import { createPointLayer, handleUpdatePointmapSettings } from "./point/point"
import {
  createLineLayer,
  handleUpdateLinemapAggTransition,
  handleUpdateLinemapSettings,
  setLinemapMeasure,
  updateLinemapMeasure
} from "./line"
import {
  createPolyLayer,
  setPolyMeasure,
  handleUpdatePolySettings,
  updatePolyMeasure
} from "./poly"
import {
  createContourLayer,
  setContourDimension,
  setContourMeasure,
  updateContourMeasure,
  handleUpdateContourSettings,
  createContourPolygonLayer,
  CONTOUR_LINE_LAYER_NAME,
  CONTOUR_POLYGON_LAYER_NAME
} from "./contour"
import { filter, intersection, keys, length, path, values } from "ramda"
import APP_CONFIG from "constants/app-config"
import d3 from "services/d3"
import { CHART_TYPES, CHARTS } from "constants/charts"
import initGeocoder from "services/geocoder"
import {
  layerDefaultOpacity,
  MAP_UPDATE_DEBOUNCE,
  MAPBOX_BBOX_PADDING
} from "constants/magic-variables"
import Services from "services/immerse"
import setupListeners from "./raster-chart-listeners"
import {
  isPointOnlyGeo,
  isPointOtherGeo,
  isPolyGeo,
  isLineGeo,
  isGeo
} from "constants/data-types"
import { navigateToDashboard } from "actions/dashboard-action-creators"
import { showInfoModal, hideInfoModal } from "actions/ui-action-creators"
import React from "react"
import { cancelChartEdits } from "actions/chart-editor-action-creators"
import { importableStore as store } from "store/importableStore"
import { inDashboard, onEditPath } from "../../utils/routerPath"
import {
  createAxisDomainUpdateFunction,
  elasticXListener,
  elasticYListener
} from "../utils/event-listeners"
import { createQueuedConnector } from "services/ConnectorWithQueue"
import {
  clearFilterByName,
  updateFilterLayerIdByName
} from "../../vega/actions/filter-action-creators-actual"
import { process as parserProcess } from "utils/ImmerseSQLPlusPlus/parser"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { addVertexLabelLayer } from "charts/utils/map-transect-draw"
import { createWindbarbLayer } from "./windbarb/windbarb"
import { CHART_TYPE_WINDBARB } from "./windbarb/constants"
import { setPointmapOrWindbarbMeasure } from "./point/utils/set-pointmap-or-windbarb-measure"
import { setPointmapPostFilter } from "./point/set-pointmap-post-filter"
import { handleUpdatePointmapAggTransition } from "./point/utils/handle-update-pointmap-agg-transition"
import { handleUpdateWindbarbSettings } from "./windbarb/utils/handle-update-windbarb-settings"
import { updatePointmapOrWindbarbMeasure } from "./point/utils/update-pointmap-or-windbarb-measure"
import {
  createCrossSectionLayer,
  createCrossSectionTerrainLayer,
  handleUpdateCrossSectionSettings,
  handleUpdateCrossSectionTerrainSettings
} from "charts/raster-chart/cross-section/cross-section"
import { setCrossSectionMeasure } from "charts/raster-chart/cross-section"
import { isCrossSectionType } from "charts/raster-chart/cross-section/utils/is-cross-section-type"
import { isMultiLayeredCrossSection } from "charts/raster-chart/cross-section/utils/is-multi-layered-cross-section"
import { toggleLineDrawButtonDisabled } from "charts/raster-chart/cross-section/utils/toggle-line-draw-button-disabled"
import { isNil } from "lodash"
import { getTablesForDataSource } from "components/join-manager/utils"
import { UPDATE_PALETTE_MAPPING } from "components/shared-settings/palette-mapping-actions"
import { MAP_MEASUREMENT_UNITS } from "./raster-chart-consts"
import { immerseAutoFormatter } from "utils/auto-formatter"

const rasterChartSettings = ["basemap", "width", "height"]

function polyfillColorsGetter(type) {
  let colorScale = null
  this.colors = (scale) => {
    if (scale) {
      colorScale = scale
      return this
    } else {
      return colorScale
    }
  }

  this.colorDomain = (colorDomain) => {
    if (colorScale) {
      colorScale.domain(colorDomain)
    }

    this.getLayer(type).setState(colorDomainSetter(colorDomain))
    return this
  }
  this.colorAccessor = () => (a) => a
  return this
}

function isGeoJoinedLinemap(chartSpec) {
  return (
    chartSpec.type === "linemap" &&
    chartSpec.geoJoin &&
    chartSpec.geoJoin.table &&
    chartSpec.geoJoin.column !== "undefined" &&
    chartSpec.geoJoin.column !== null
  )
}

const updateSelectorMinMaxes = (RasterChart) => (minMax) => (selector) => {
  if (
    !RasterChart.originalXMinMax &&
    selector.initMinMax &&
    Array.isArray(selector.minMax)
  ) {
    RasterChart.originalXMinMax = [...selector.minMax]
  }
  return {
    ...selector,
    minMax,
    initMinMax: RasterChart.originalXMinMax
  }
}

const chartTables = ({ dataSource, layers = [] }) => {
  const layerDataSources = layers?.map?.((l) => l.dataSource) ?? []
  const dataSources = new Set([dataSource, ...layerDataSources])

  return Array.from(dataSources)
    .map(getTablesForDataSource)
    .flat()
    .filter((ds) => !isNil(ds))
}

// We are not supporting crossfilter on geojoined Linemap until we integrate
function shouldShowDrawTools(chartSpec) {
  return (
    chartSpec.type !== "backendChoropleth" &&
    !isGeoJoinedLinemap(chartSpec) &&
    !isCrossSectionType(chartSpec.type) &&
    // Contour only shows line tool if cross section is enabled, nothing if not.
    (chartSpec.type !== CHART_TYPES.CONTOUR ||
      getFeatureFlag(available_feature_flags.ENABLE_CROSS_SECTION_CHART))
  )
}

function* addDrawTools(chart, chartSpec) {
  if (shouldShowDrawTools(chartSpec)) {
    yield call(
      chart.addDrawControl,
      getFeatureFlag(available_feature_flags.ENABLE_CROSS_SECTION_CHART) &&
        isGeoChart(chartSpec.type)
        ? chartSpec.type === CHART_TYPES.CONTOUR
          ? lassoToolSetTypes.kCrossSection
          : lassoToolSetTypes.kAll
        : lassoToolSetTypes.kStandard
    )
  }
}

function* getRasterLayers(chartId, chartSpec) {
  // Should be an array of [name, layer]
  const rasterLayers = []
  const colorDomain = getRasterLegendProp(chartSpec, "colorDomain")
  const legendLocked = getRasterLegendProp(chartSpec, "legendLocked")
  const chartLayers = chartSpec.layers
  const currentLayerIndex = chartSpec.currentLayer
  const layerPostFilter =
    chartLayers?.[currentLayerIndex]?.postFilters ?? chartSpec.postFilters
  const opacity =
    chartLayers?.[currentLayerIndex]?.opacity ??
    (chartSpec.opacity || layerDefaultOpacity(chartSpec.type))

  if (chartSpec.type === "geoheat") {
    rasterLayers.push([
      chartSpec.type,
      yield* createHeatLayer({
        width: chartSpec.width,
        height: chartSpec.height,
        mark: chartSpec.mark,
        type: chartSpec.type,
        color: chartSpec.color,
        measures: chartSpec.measures,
        pixelSize: chartSpec.pixelSize,
        dataSource: chartSpec.dataSource,
        dimensions: chartSpec.dimensions,
        mapZoomCenter: chartSpec.mapZoomCenter,
        legendOpen: chartSpec.legendOpen,
        colorDomain,
        legendLocked,
        currentLayer: currentLayerIndex || 0,
        chartId,
        opacity
      })
    ])
  } else if (isWindbarbChartType(chartSpec.type)) {
    rasterLayers.push([
      CHART_TYPE_WINDBARB,
      yield* createWindbarbLayer({
        ...chartSpec,
        colorDomain,
        legendLocked,
        currentLayer: currentLayerIndex || 0,
        postFilters: layerPostFilter || [],
        chartId,
        opacity,
        popupEnabled: false,
        rasterShowOther: chartSpec.rasterShowOther
      })
    ])
  } else if (isRasterPointChart(chartSpec.type)) {
    rasterLayers.push([
      chartSpec.type,
      yield* createPointLayer({
        cap: chartSpec.cap,
        type: chartSpec.type,
        color: chartSpec.color,
        autoSize: chartSpec.autoSize,
        measures: chartSpec.measures,
        dimensions: chartSpec.dimensions,
        markShape: chartSpec.markShape,
        sizeRange: chartSpec.sizeRange,
        sizeDomain: chartSpec.sizeDomain,
        dataSource: chartSpec.dataSource,
        mapZoomCenter: chartSpec.mapZoomCenter,
        hoverSelectedColumns: chartSpec.hoverSelectedColumns,
        densityAccumulatorEnabled: chartSpec.densityAccumulatorEnabled,
        legendOpen: chartSpec.legendOpen,
        colorDomain,
        colorRamps: chartSpec?.colorRamps,
        legendLocked,
        currentLayer: currentLayerIndex || 0,
        postFilters: layerPostFilter || [],
        chartId,
        opacity,
        popupEnabled:
          chartSpec.popupEnabled === undefined ? true : chartSpec.popupEnabled,
        rasterShowOther: chartSpec.rasterShowOther,
        fullColorHashing: chartSpec.fullColorHashing,
        scaleType: chartSpec.scaleType
      })
    ])
  } else if (chartSpec.type === "backendChoropleth") {
    // Using different name for BE Choropleth sampling cap value since we introduced sampling later and
    // needed to apply the new defaultCap to existing Choropleth charts
    if (!chartSpec.polyCap) {
      yield put(
        updateChart(chartId, {
          polyCap: CHARTS.backendChoropleth.defaultCap
        })
      )
    }
    rasterLayers.push([
      chartSpec.type,
      yield* createPolyLayer({
        polyCap: chartSpec.polyCap,
        type: chartSpec.type,
        color: chartSpec.color,
        measures: chartSpec.measures,
        dataSource: chartSpec.dataSource,
        mapZoomCenter: chartSpec.mapZoomCenter,
        dimensions: chartSpec.dimensions,
        geoJoin: chartSpec.geoJoin,
        legendOpen: chartSpec.legendOpen,
        borderWidth: chartSpec.borderWidth,
        colorDomain,
        filters: chartSpec.filters,
        chartId,
        legendLocked,
        currentLayer: currentLayerIndex || 0,
        hoverSelectedColumns: chartSpec.hoverSelectedColumns,
        hasBorderColorFromFill: chartSpec.hasBorderColorFromFill,
        borderColor: chartSpec.borderColor,
        opacity,
        rasterShowOther: chartSpec.rasterShowOther,
        fullColorHashing: chartSpec.fullColorHashing
      })
    ])
  } else if (chartSpec.type === "linemap") {
    rasterLayers.push([
      chartSpec.type,
      yield* createLineLayer({
        cap: chartSpec.cap,
        type: chartSpec.type,
        color: chartSpec.color,
        autoSize: chartSpec.autoSize,
        measures: chartSpec.measures,
        dimensions: chartSpec.dimensions,
        geoJoin: chartSpec.geoJoin,
        sizeRange: chartSpec.sizeRange,
        sizeDomain: chartSpec.sizeDomain,
        dataSource: chartSpec.dataSource,
        mapZoomCenter: chartSpec.mapZoomCenter,
        hoverSelectedColumns: chartSpec.hoverSelectedColumns,
        densityAccumulatorEnabled: chartSpec.densityAccumulatorEnabled,
        legendOpen: chartSpec.legendOpen,
        colorDomain,
        legendLocked,
        currentLayer: currentLayerIndex || 0,
        chartId,
        opacity,
        popupEnabled:
          chartSpec.popupEnabled === undefined ? true : chartSpec.popupEnabled,
        rasterShowOther: chartSpec.rasterShowOther,
        fullColorHashing: chartSpec.fullColorHashing
      })
    ])
  } else if (chartSpec.type === CHART_TYPES.CONTOUR) {
    if (chartSpec.fillEnabled) {
      rasterLayers.push([
        CONTOUR_POLYGON_LAYER_NAME,
        yield* createContourPolygonLayer(chartId)
      ])
    }
    rasterLayers.push([
      CONTOUR_LINE_LAYER_NAME,
      yield* createContourLayer(chartId)
    ])
  } else if (chartSpec.type === CHART_TYPES.CROSS_SECTION) {
    rasterLayers.push([
      chartSpec.type,
      yield* createCrossSectionLayer({
        cap: chartSpec.cap,
        type: chartSpec.type,
        color: chartSpec.color,
        autoSize: chartSpec.autoSize,
        measures: chartSpec.measures,
        dimensions: chartSpec.dimensions,
        markShape: chartSpec.markShape,
        sizeRange: chartSpec.sizeRange,
        sizeDomain: chartSpec.sizeDomain,
        dataSource: chartSpec.dataSource,
        mapZoomCenter: chartSpec.mapZoomCenter,
        hoverSelectedColumns: chartSpec.hoverSelectedColumns,
        densityAccumulatorEnabled: chartSpec.densityAccumulatorEnabled,
        legendOpen: chartSpec.legendOpen,
        colorDomain,
        colorRamps: chartSpec?.colorRamps,
        legendLocked,
        currentLayer: currentLayerIndex || 0,
        postFilters: layerPostFilter || [],
        chartId,
        opacity,
        smoothing: chartSpec.smoothing,
        searchDistance: chartSpec.searchDistance,
        width: chartSpec.width,
        height: chartSpec.height,
        popupEnabled:
          chartSpec.popupEnabled === undefined ? true : chartSpec.popupEnabled,
        rasterShowOther: chartSpec.rasterShowOther
      })
    ])
  } else if (chartSpec.type === CHART_TYPES.CROSS_SECTION_TERRAIN) {
    rasterLayers.push([
      chartSpec.type,
      yield* createCrossSectionTerrainLayer({
        cap: chartSpec.cap,
        type: chartSpec.type,
        color: chartSpec.color,
        autoSize: chartSpec.autoSize,
        measures: chartSpec.measures,
        dimensions: chartSpec.dimensions,
        markShape: chartSpec.markShape,
        sizeRange: chartSpec.sizeRange,
        sizeDomain: chartSpec.sizeDomain,
        dataSource: chartSpec.dataSource,
        mapZoomCenter: chartSpec.mapZoomCenter,
        hoverSelectedColumns: chartSpec.hoverSelectedColumns,
        densityAccumulatorEnabled: chartSpec.densityAccumulatorEnabled,
        legendOpen: chartSpec.legendOpen,
        colorDomain,
        colorRamps: chartSpec?.colorRamps,
        legendLocked,
        currentLayer: currentLayerIndex || 0,
        postFilters: layerPostFilter || [],
        chartId,
        opacity,
        smoothing: chartSpec.smoothing,
        width: chartSpec.width,
        popupEnabled:
          chartSpec.popupEnabled === undefined ? true : chartSpec.popupEnabled,
        rasterShowOther: chartSpec.rasterShowOther
      })
    ])
  }
  return rasterLayers
}

export function* handleCreateRasterChart({
  chartId,
  chartSpec,
  dashboardId,
  tabId
}: ActionTypes.CREATE_GEOHEAT_CHART_ACTION): Generator {
  try {
    yield put.resolve(
      updateChart(chartId, {
        dcFlag: null,
        mapZoomCenter: chartSpec.mapZoomCenter
      })
    )

    yield* handleDestroyRasterChart({ chartId })
    const dc = Services.get("dc")
    const connector = Services.get("DbCon")
    const localState = yield select()

    const con = createQueuedConnector({
      connector,
      chartId,
      dashboardId: localState.dashboard.id,
      tableName: localState.charts[chartId]?.dataSource || null
    })

    const node = document.getElementById(`chart${chartId}`)

    // get the updated state then use it for chart height width
    const updatedChart = yield select(selectChart(chartId))
    const paletteMappings = yield select(
      (state) => state.sharedSettings.mappings
    )
    const width = updatedChart.width || chartSpec.width
    const height = updatedChart.height || chartSpec.height
    yield put(
      updateChart(chartId, {
        width,
        height
      })
    )
    yield put(DCActions.chartRenderRequest(chartId))

    const currentLayerIndex = chartSpec.currentLayer
    if (node && document.getElementById(`chart${chartId}`)) {
      const RasterChart = yield call(
        dc.rasterChart,
        node,
        chartSpec.type !== CHART_TYPES.BACKEND_SCATTER &&
          !isCrossSectionType(chartSpec.type)
      )

      if (APP_CONFIG.maxBounds && isGeoChart(chartSpec.type)) {
        yield call(RasterChart.maxBounds, APP_CONFIG.maxBounds)
      }

      if (RasterChart.popupImageEnabled) {
        RasterChart.popupImageEnabled(
          getFeatureFlag(available_feature_flags.ENABLE_POPUP_IMAGE_PREVIEW)
        )
      }

      // this is complete nonsense. So. When we're creating a chart, we set its initial bounds so
      // as to negate the need to zoom in on the area after we've loaded it up. Be extra extra careful
      // and confirm that the raster chart has the setInitialBounds method before falling into here.
      if (RasterChart.setInitialBounds) {
        // it's easy! Just look for its mapZoomCenter, and if we have one - then we zoom in on it.
        // this should cover pointmap and linemap, as well as a geo heatmap that's been loaded and a
        // choropleth that's been loaded. All is well if you fall into here.
        const mapZoomCenterBounds = chartSpec.mapZoomCenter
        if (mapZoomCenterBounds) {
          yield call(RasterChart.setInitialBounds, {
            _sw: {
              lng: mapZoomCenterBounds.bounds.lonMin,
              lat: mapZoomCenterBounds.bounds.latMin
            },
            _ne: {
              lng: mapZoomCenterBounds.bounds.lonMax,
              lat: mapZoomCenterBounds.bounds.latMax
            }
          })
          // of course, there are special cases. A newly created choropleth chart doesn't have a mapZoomCenter
          // yet for some reason. But we can find its min/max values to get an initial bounds on its first measure's categories.
          // IMPORTANT NOTE - measures[0].categories and mapZoomCenter will -not- stay in sync, since the former is from the initial
          // data load, and the latter is what the user has navigated to. So we always use the mapZoomCenter if we have it.
        } else if (
          chartSpec.type === "backendChoropleth" ||
          chartSpec.type === "choropleth"
        ) {
          const choroplethInitBounds = chartSpec.measures[0].categories
          if (choroplethInitBounds && choroplethInitBounds.length) {
            yield call(RasterChart.setInitialBounds, {
              _sw: {
                lng: choroplethInitBounds[0],
                lat: choroplethInitBounds[2]
              },
              _ne: {
                lng: choroplethInitBounds[1],
                lat: choroplethInitBounds[3]
              }
            })
          }
        }
        // and geoheatmap? Yet another special case. Now, amusingly enough, geoheatmap's zoom-into-view on init still works (unlike choropleth's)
        // so we don't technically need it. But it's a nice to have for consistency's sake. Here, we just look for different fields.
        else if (
          [CHART_TYPES.GEOHEAT, CHART_TYPES.CONTOUR].includes(chartSpec.type)
        ) {
          const lonDim = chartSpec.dimensions.find((dim) =>
            ["lon", "raster_lon"].includes(dim.value)
          )
          const latDim = chartSpec.dimensions.find((dim) =>
            ["lat", "raster_lat"].includes(dim.value)
          )
          if (latDim?.minMax?.length && lonDim?.minMax?.length) {
            yield call(RasterChart.setInitialBounds, {
              _sw: {
                lng: lonDim.minMax[0],
                lat: latDim.minMax[0]
              },
              _ne: {
                lng: lonDim.minMax[1],
                lat: latDim.minMax[1]
              }
            })
          } else if (
            latDim?.min_val &&
            latDim?.max_val &&
            lonDim?.min_val &&
            lonDim?.max_val
          ) {
            yield call(RasterChart.setInitialBounds, {
              _sw: {
                lng: lonDim.min_val,
                lat: latDim.min_val
              },
              _ne: {
                lng: lonDim.max_val,
                lat: latDim.max_val
              }
            })
          }
        }
      }
      // done with setting initial bounds

      yield call(RasterChart.con, con)
      yield call(RasterChart.height, updatedChart.height)
      yield call(RasterChart.width, updatedChart.width)
      yield call(RasterChart.popupSearchRadius, 2)
      yield call(RasterChart.shiftToZoom, chartSpec.shiftToZoom)

      if (chartSpec.type === "backendChoropleth") {
        yield call(
          RasterChart.setShouldRedrawAll,
          getFeatureFlag(available_feature_flags.GEOJOIN_BOUNDING_BOXES)
        )
      }

      // Apply hoverSelectedColumns formats to auto formatter for the chart
      if (chartSpec.hoverSelectedColumns?.length) {
        const popupColumnFormats = chartSpec.hoverSelectedColumns
          .filter((col) => col.format)
          .map((col) => ({
            key: parserProcess(col.label, { useDisplayName: true }),
            format: col.format
          }))
        yield call(
          RasterChart.valueFormatter,
          immerseAutoFormatter(popupColumnFormats)
        )
      }

      if (
        isGeoTypeSupportedRasterChart(chartSpec.type) ||
        chartSpec.type === CHART_TYPES.CONTOUR
      ) {
        // Backend Choropleth and Linemap requires geo poly or linestring columns
        // for some reason contour requires this as well, even though I'm not sure why
        yield call(RasterChart.useGeoTypes, true)
      }

      if (
        chartSpec.type === CHART_TYPES.BACKEND_SCATTER ||
        isCrossSectionType(chartSpec.type)
      ) {
        elasticYListener({ id: chartId }, RasterChart)
        elasticXListener({ id: chartId }, RasterChart)
        createAxisDomainUpdateFunction(
          "xDomain",
          "measures",
          0,
          updateSelectorMinMaxes(RasterChart)
        )({ id: chartId }, RasterChart)
        createAxisDomainUpdateFunction(
          "yDomain",
          "measures",
          1,
          updateSelectorMinMaxes(RasterChart)
        )({ id: chartId }, RasterChart)

        yield call(RasterChart.margins, {
          top: 16,
          right: 24,
          bottom: 40,
          left: 48
        })
        yield call(RasterChart.renderHorizontalGridLines, true)
        yield call(RasterChart.renderVerticalGridLines, true)
        yield call(RasterChart.enableInteractions, true)
        yield call(RasterChart.transitionDuration, 0)
        yield call(RasterChart.width, width)
        yield call(RasterChart.height, height)

        if (isCrossSectionType(chartSpec.type)) {
          yield* configureCrossSectionChart(RasterChart, chartSpec)
        } else {
          yield call(
            RasterChart.xAxisLabel,
            chartSpec.measures[0].axisLabel || chartSpec.measures[0].label
          )
          yield call(
            RasterChart.yAxisLabel,
            chartSpec.measures[1].axisLabel || chartSpec.measures[1].label
          )
        }
      } else {
        if (RasterChart.mapUnits) {
          yield call(
            RasterChart.mapUnits,
            getFeatureFlag(available_feature_flags.MAP_MEASUREMENT_UNITS) ||
              MAP_MEASUREMENT_UNITS.METRIC
          )
        }
        yield call(RasterChart.useLonLat, true)
        yield call(RasterChart.mapUpdateInterval, MAP_UPDATE_DEBOUNCE)

        yield call(RasterChart.mapboxToken, process.env.MAPBOX_TOKEN)

        if (!getFeatureFlag(available_feature_flags.DISABLE_MAP_GEOCODER)) {
          const geoCoder = yield call(initGeocoder)
          yield call(RasterChart.geocoder, geoCoder)
        }
        yield* setRasterChartSettings({ chartId, chartSpec }, RasterChart)
        if (chartSpec.mapZoomCenter) {
          yield call(RasterChart.center, [
            chartSpec.mapZoomCenter.center.lng,
            chartSpec.mapZoomCenter.center.lat
          ])
          yield call(RasterChart.zoom, chartSpec.mapZoomCenter.zoom)
        }
      }
      // eslint-disable-next-line no-underscore-dangle
      yield put(ChartActions.setChartDCFlag(chartId, RasterChart.__dcFlag__))

      const tables = chartTables(chartSpec)
      yield call(RasterChart.chartGroup, tables)

      yield call(RasterChart.legendOpen, chartSpec.legendOpen)
      yield call(RasterChart.init)

      if (Array.isArray(chartSpec.measures)) {
        const yMeasure = chartSpec.measures.find((m) => m.name === "y")
        const xMeasure = chartSpec.measures.find((m) => m.name === "x")
        if (yMeasure) {
          RasterChart.originalYMinMax = yMeasure.initMinMax
            ? yMeasure.initMinMax
            : yMeasure.minMax
        }
        if (xMeasure) {
          RasterChart.originalXMinMax = xMeasure.initMinMax
            ? xMeasure.initMinMax
            : xMeasure.minMax
        }
      }

      // when we try to add different type of raster layer, we need to update the existing layer object in
      // chart.layers array to support Master layer tab visibility
      if (
        isMultiLayer(chartSpec.type) &&
        chartSpec.layers &&
        chartSpec.layers.length > 1 &&
        typeof currentLayerIndex === "number" &&
        currentLayerIndex !== "master"
      ) {
        yield put(
          RasterActions.saveCurrentRasterLayer(chartId, chartSpec.currentLayer)
        )
      }

      yield call(addDrawTools, RasterChart, chartSpec)

      yield call(fitData, RasterChart, chartSpec, width, height)

      yield apply(RasterChart, polyfillColorsGetter, [chartSpec.type])
      const color =
        paletteMappings?.find(
          (pm) => pm.id === chartSpec.color.paletteMappingId
        )?.mapping ?? chartSpec.color
      yield call(RasterChart.colors, d3.scale.linear().range(color.val))

      setupListeners({ chartId, type: chartSpec.type }, RasterChart)

      chartSpec.filters.forEach((value) => RasterChart.filter(value))

      if (shouldShowDrawTools(chartSpec) && isGeoChart(chartSpec.type)) {
        addVertexLabelLayer(RasterChart)
      }

      if (chartSpec.crossSectionLines) {
        chartSpec.crossSectionLines.forEach((line) => RasterChart.filter(line))
        toggleLineDrawButtonDisabled(chartId, chartSpec.crossSectionLines)
      }

      // Either combine layers if we're on the master layer
      // Or get them individually from the spec if not
      if (currentLayerIndex === "master") {
        yield* handleCombineLayers({ chartId })
      } else {
        const rasterLayers = yield call(getRasterLayers, chartId, chartSpec)
        for (const [layerName, layer] of rasterLayers) {
          yield call(RasterChart.pushLayer, layerName, layer)
        }
      }

      if (yield select((state) => state.dc.initialRender.done)) {
        yield put(updateChart(chartId, { loading: true }))
        yield call(RasterChart.renderAsync)
        yield put(updateChart(chartId, { loading: false }))
        yield call(dc.resetRedrawStack)
      }

      yield call(
        ChartActions.setValueFormatter,
        RasterChart,
        chartSpec.measures,
        chartSpec.type
      )

      yield put(ChartActions.setElasticX(chartId, chartSpec.elasticX))
      yield put(ChartActions.setElasticY(chartId, chartSpec.elasticY))
      yield put(DCActions.chartRenderSuccess(chartId, dashboardId, tabId))
    }
  } catch (e) {
    if (e.name === "WebGL" && e.message === "WebGL Not Enabled") {
      const chartEditor = yield select((state) => state.chartEditor)
      if (chartEditor.editing && !chartEditor.wasApplied) {
        const primaryAction = () => () => {
          store.dispatch(hideInfoModal())

          // adding a new parameter in updateChartType for bad raster chart to
          // prevent async issue on redrawAll in dc-action-creators.js when
          // changing the chart type to Table. Probably need to revisit to
          // investigate the root cause
          store.dispatch(updateChartType(chartId, "table", false))
        }

        yield put(
          showInfoModal({
            hideCloseIcon: true,
            title: "WebGL Not Enabled",
            message: (
              <span>
                {" "}
                WebGL is required to create map charts. Continuing to use the
                product without WebGL will result in a degraded experience.{" "}
                <br />
                <b>Troubleshooting tips</b> <br />
                <ul>
                  <li>Try a different browser or computer</li>
                  <li>Contact your IT administrator</li>
                </ul>
              </span>
            ),
            primaryAction: {
              action: primaryAction(),
              text: "OK"
            }
          })
        )
      } else {
        const primaryAction = () => () => {
          store.dispatch(hideInfoModal())
          store.dispatch(cancelChartEdits(chartId, chartSpec.type))
          store.dispatch(navigateToDashboard())
        }

        yield put(
          showInfoModal({
            hideCloseIcon: true,
            title: "WebGL Not Enabled",
            message: (
              <span>
                {" "}
                WebGL is required to render one or more charts on this
                dashboard. Continuing to use the product without WebGL will
                result in a degraded experience. <br />
                <b>Troubleshooting tips</b> <br />
                <ul>
                  <li>Try a different browser or computer</li>
                  <li>Contact your IT administrator</li>
                </ul>
              </span>
            ),
            primaryAction: {
              action: primaryAction(),
              text: "OK"
            }
          })
        )
      }
    } else {
      yield put(AppActions.setAppError("CHART_RENDER_ERROR", e))
    }
  }
}

function* configureCrossSectionChart(RasterChart, chartSpec) {
  // cross section/terrain have a custom x axis label
  yield call(RasterChart.xAxisLabel, "Distance along transect")
  yield call(RasterChart.enableInteractions, false)

  // in the case of multi-layered CS/terrain, need to specifically pull
  // labels from the layers and NOT the chartSpec. Only do this when
  // viewing the master layer.
  if (
    isMultiLayeredCrossSection(chartSpec) &&
    chartSpec.currentLayer === "master"
  ) {
    const csLayer = chartSpec.layers.find(
      (l) => l.type === CHART_TYPES.CROSS_SECTION
    )
    const terrainLayer = chartSpec.layers.find(
      (l) => l.type === CHART_TYPES.CROSS_SECTION_TERRAIN
    )
    yield call(
      RasterChart.yAxisLabel,
      csLayer.measures[2].axisLabel || csLayer.measures[2].label
    )
    const terrainMeasure = terrainLayer.measures[2]
    yield call(
      RasterChart.y2AxisLabel,
      terrainMeasure.axisLabel || terrainMeasure.label || terrainMeasure.name
    )
  } else {
    yield call(
      RasterChart.yAxisLabel,
      chartSpec.measures[2].axisLabel || chartSpec.measures[2].label
    )
  }
}

function* fitData(RasterChart, chartSpec, width, height) {
  if (
    typeof RasterChart.zoomToLocation === "function" &&
    !path(["mapZoomCenter"], chartSpec)
  ) {
    if (isGeoTypeSupportedRasterChart(chartSpec.type)) {
      if (path(["measures", 0, "categories"], chartSpec)) {
        yield call(RasterChart.zoomToLocation, {
          bounds: {
            sw: [
              chartSpec.measures[0].categories[0],
              chartSpec.measures[0].categories[2]
            ],
            ne: [
              chartSpec.measures[0].categories[1],
              chartSpec.measures[0].categories[3]
            ]
          },
          maxZoom: getFeatureFlag(available_feature_flags.MAX_ZOOM_LEVEL),
          padding: {
            top: height * MAPBOX_BBOX_PADDING,
            bottom: height * MAPBOX_BBOX_PADDING,
            left: width * MAPBOX_BBOX_PADDING,
            right: width * MAPBOX_BBOX_PADDING
          }
        })
      }
    } else if (
      [CHART_TYPES.GEOHEAT, CHART_TYPES.CONTOUR].includes(chartSpec.type)
    ) {
      if (
        path(["dimensions", 0, "minMax"], chartSpec) &&
        path(["dimensions", 1, "minMax"], chartSpec)
      ) {
        yield call(RasterChart.zoomToLocation, {
          bounds: {
            sw: [
              chartSpec.dimensions[0].minMax[0],
              chartSpec.dimensions[1].minMax[0]
            ],
            ne: [
              chartSpec.dimensions[0].minMax[1],
              chartSpec.dimensions[1].minMax[1]
            ]
          },
          maxZoom: getFeatureFlag(available_feature_flags.MAX_ZOOM_LEVEL),
          padding: {
            top: height * MAPBOX_BBOX_PADDING,
            bottom: height * MAPBOX_BBOX_PADDING,
            left: width * MAPBOX_BBOX_PADDING,
            right: width * MAPBOX_BBOX_PADDING
          }
        })
      }
    } else if (
      path(["measures", 0, "minMax"], chartSpec) &&
      path(["measures", 1, "minMax"], chartSpec)
    ) {
      // Note that this condition applies to all other charts besides backend
      // choropleth. We may want to explicitly enumerate other charts in the future.
      yield call(RasterChart.zoomToLocation, {
        bounds: {
          sw: [
            chartSpec.measures[0].minMax[0],
            chartSpec.measures[1].minMax[0]
          ],
          ne: [chartSpec.measures[0].minMax[1], chartSpec.measures[1].minMax[1]]
        },
        maxZoom: getFeatureFlag(available_feature_flags.MAX_ZOOM_LEVEL),
        padding: {
          top: height * MAPBOX_BBOX_PADDING,
          bottom: height * MAPBOX_BBOX_PADDING,
          left: width * MAPBOX_BBOX_PADDING,
          right: width * MAPBOX_BBOX_PADDING
        }
      })
    }
  }
}

export function* handleUpdateRasterChartSize(
  action: ActionTypes.UPDATE_GEOHEAT_CHART_ACTION
): Generator {
  try {
    const chartSpec = yield select(selectChart(action.chartId))
    const dcChart = yield call(Services.get("dc").getChart, chartSpec.dcFlag)
    const { width, height } = action.updates

    yield put(
      updateChart(action.chartId, {
        width: action.updates.width,
        height: action.updates.height
      })
    )

    if (dcChart && width !== 0 && height !== 0) {
      yield call(dcChart.width, width)
      yield call(dcChart.height, height)

      dcChart.getLayerNames().forEach((layerName) => {
        const layer = dcChart.getLayer(layerName)
        // TODO[C]: will we need this for contour as well?
        if (layer.type === "heatmap") {
          layer.setState((state) => ({
            ...state,
            encoding: {
              ...state.encoding,
              x: {
                ...state.encoding.x,
                size: width
              },
              y: {
                ...state.encoding.y,
                size: height
              }
            }
          }))
        }
      })

      yield call(fitData, dcChart, chartSpec, width, height)
      yield call(dcChart.renderAsync)
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e)
  }
}

export function* setRasterChartSettings(
  { chartId, chartSpec },
  dcChart = false
) {
  let RasterChart = dcChart
  if (dcChart === false) {
    const { dcFlag } = yield select(selectChart(chartId))
    RasterChart = yield call(Services.get("dc").getChart, dcFlag)
  }

  if (typeof RasterChart === "undefined" || RasterChart === null) {
    return
  }

  if (!isCrossSectionType(chartSpec.type)) {
    yield call(RasterChart.mapStyle, currentBasemapValue(chartSpec))
  }

  const updatedChart = yield select(selectChart(chartId))
  // Reconcile that for some reason unknown, a saga, somewhere, in the void, fires off a
  // bad height causing the chart to grow BACK to the editor height on Cancel.  Please don't judge.
  yield call(
    RasterChart.width,
    chartSpec.width < updatedChart.width ? chartSpec.width : updatedChart.width
  )
  yield call(
    RasterChart.height,
    chartSpec.height < updatedChart.height
      ? chartSpec.height
      : updatedChart.height
  )

  if (dcChart === false) {
    yield call(RasterChart.renderAsync)
  }
}

export function* handleDestroyRasterChart(action) {
  const { dcFlag, ...chart } = yield select(selectChart(action.chartId))
  const dc = Services.get("dc")
  const dcChart = dc.getChart(dcFlag)
  if (dcChart) {
    const chartGroup = yield call(chartTables, chart)
    dcChart.on("setCustomContLegend", null)
    dcChart.on("clearCustomContLegend", null)
    yield call(dcChart.destroyChart)
    yield call(dc.chartRegistry.deregister, dcChart, chartGroup)
    yield call(dc.resetRedrawStack)
    // We need to only try to run a redraw if we're actually in a dashboard or
    //  in the chart editor.
    const router = yield select((state) => state.router)
    if (inDashboard(router.location.path) || onEditPath(router.location.path)) {
      yield call(dc.redrawAllAsync, chartGroup)
    }
  }
}

export function* handleCombineLayers({ chartId, chartSpec: cSpec }) {
  try {
    const { dcFlag, ...chartState } = yield select(selectChart(chartId))
    const chartSpec = cSpec ? cSpec : chartState
    if (chartSpec.isNotDc) {
      return
    }

    const RasterChart = yield call(Services.get("dc").getChart, dcFlag)
    if (RasterChart) {
      RasterChart.popAllLayers().forEach((layer) =>
        layer.destroyLayer(RasterChart)
      )
      const layers = chartSpec.layers.filter(isLayerValid)
      for (let i = 0; i < layers.length; i += 1) {
        const { active, activeZoomLevel, type } = layers[i]
        const opacity = layers[i].opacity || layerDefaultOpacity(layers[i].type)
        if (active !== false && activeZoomLevel !== false) {
          // rasterLayers is an array of arrays, [[layerName, layer], ...]
          const rasterLayers = []
          switch (type) {
            case CHART_TYPES.GEOHEAT:
              rasterLayers.push([
                CHART_TYPES.GEOHEAT,
                yield call(createHeatLayer, {
                  ...layers[i],
                  mapZoomCenter: chartSpec.mapZoomCenter,
                  currentLayer: chartSpec.currentLayer,
                  chartId,
                  opacity
                })
              ])
              break
            case CHART_TYPES.POINTMAP:
              rasterLayers.push([
                CHART_TYPES.POINTMAP,
                yield call(createPointLayer, {
                  ...layers[i],
                  mapZoomCenter: chartSpec.mapZoomCenter,
                  currentLayer: chartSpec.currentLayer,
                  chartId,
                  opacity
                })
              ])
              break
            case CHART_TYPE_WINDBARB:
              rasterLayers.push([
                CHART_TYPE_WINDBARB,
                yield call(createWindbarbLayer, {
                  ...layers[i],
                  mapZoomCenter: chartSpec.mapZoomCenter,
                  currentLayer: chartSpec.currentLayer,
                  chartId,
                  opacity
                })
              ])
              break
            case CHART_TYPES.LINEMAP:
              yield call(RasterChart.useGeoTypes, true)
              rasterLayers.push([
                CHART_TYPES.LINEMAP,
                yield call(createLineLayer, {
                  ...layers[i],
                  mapZoomCenter: chartSpec.mapZoomCenter,
                  currentLayer: chartSpec.currentLayer,
                  chartId,
                  opacity
                })
              ])
              break
            case CHART_TYPES.BACKEND_CHOROPLETH:
              // Note: backend choropleth requires the chart to use geo types.
              // Not clear what interaction this will have with other charts.
              yield call(RasterChart.useGeoTypes, true)
              rasterLayers.push([
                CHART_TYPES.BACKEND_CHOROPLETH,
                yield call(createPolyLayer, {
                  chartId,
                  layerIndex: i,
                  ...layers[i],
                  mapZoomCenter: chartSpec.mapZoomCenter,
                  currentLayer: chartSpec.currentLayer,
                  opacity
                })
              ])
              break
            case CHART_TYPES.CONTOUR:
              yield call(RasterChart.useGeoTypes, true)

              if (layers[i].fillEnabled) {
                rasterLayers.push([
                  CONTOUR_POLYGON_LAYER_NAME,
                  yield call(createContourPolygonLayer, chartId, i)
                ])
              }
              rasterLayers.push([
                CONTOUR_LINE_LAYER_NAME,
                yield call(createContourLayer, chartId, i)
              ])
              break

            case CHART_TYPES.CROSS_SECTION:
              rasterLayers.push([
                CHART_TYPES.CROSS_SECTION,
                yield call(createCrossSectionLayer, {
                  ...layers[i],
                  chartId,
                  layerIndex: i,
                  width: chartSpec.width,
                  height: chartSpec.height,
                  smoothing: chartSpec.smoothing,
                  searchDistance: chartSpec.searchDistance
                })
              ])
              break

            case CHART_TYPES.CROSS_SECTION_TERRAIN:
              rasterLayers.push([
                CHART_TYPES.CROSS_SECTION_TERRAIN,
                yield call(createCrossSectionTerrainLayer, {
                  ...layers[i],
                  chartId,
                  layerIndex: i,
                  width: chartSpec.width,
                  smoothing: chartSpec.smoothing
                })
              ])
              break
            default:
              throw new Error(`Unsuported layer type: ${type}`)
          }
          for (const layerConfig of rasterLayers) {
            const [layerName, layer] = layerConfig
            yield call(
              RasterChart.pushLayer,
              getMultiLayerName(layerName, i),
              layer
            )
          }
        }
      }

      if (isCrossSectionType(chartSpec.type)) {
        yield* configureCrossSectionChart(RasterChart, chartSpec)
      }

      const tables = chartTables(chartSpec)
      yield call(RasterChart.chartGroup, tables)
      yield call(Services.get("dc").resetRedrawStack)
      yield call(Services.get("dc").resetRenderStack)
      yield call(RasterChart.renderAsync)
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    yield put(AppActions.setAppError("CHART_RENDER_ERROR", e))
  }
}

export function* handleResetRasterChart({ chartId, chartSpec, prevChartSpec }) {
  try {
    const { id: dashboardId, selectedTabId: tabId } = yield select(
      ({ dashboard }) => dashboard
    )

    yield* handleClearFilters({ chartId, redrawChart: false })
    // `prevChartSpec` is _not_ the previous spec. Somewhere along the way, `chartSpe`c _actually_ became
    //  `savedChartSpec` and `prevChartSpec` became `currentChartState`:
    //  Action dispatch: https://github.com/heavyai/immerse/blob/a817c21e45e65f31a7fb64410d2d8066be0a314e/src/actions/charts-action-creators.js#L113-L116
    //  Action thunk implementation: https://github.com/heavyai/immerse/blob/a817c21e45e65f31a7fb64410d2d8066be0a314e/src/charts/raster-chart/geoheat-actions.ts#L46-L53
    //  These really need to be renamed to reflect their usage.
    if (prevChartSpec?.basemap?.value !== chartSpec?.basemap?.value) {
      yield put(
        RasterActions.updateRasterChart(chartId, {
          basemap: chartSpec.basemap
        })
      )
    }
    if (chartSpec.layers && chartSpec.layers.length > 1) {
      const { dcFlag, type } = yield select(selectChart(chartId))
      const RasterChart = Services.get("dc").getChart(dcFlag)
      if (RasterChart) {
        yield* setRasterChartSettings({ chartId, chartSpec }, RasterChart)
        yield* handleCombineLayers({ chartId, chartSpec })
      }
      yield put(updateChart(chartId, { ...chartSpec, type, dcFlag }))
    } else {
      yield* handleDestroyRasterChart({ chartId })
      yield put(updateChart(chartId, chartSpec))

      // Only call handleCreateRasterChart if the chart/layer was valid to avoid duplicate call for handleCreateRasterChart.
      // The valid chart/layer means that it showed rendered image in RasterChartComponent.
      // If it wasn't a valid chart, there is no RasterChartComponent in the DOM, so
      // componentDidMount in raster-chart-component.js will call createGeoHeatChart after resetting chart state.
      if (
        isLayerValid(prevChartSpec) ||
        prevChartSpec.type === "backendScatter"
      ) {
        yield* handleCreateRasterChart({
          chartId,
          chartSpec,
          dashboardId,
          tabId
        })

        const dc = Services.get("dc")
        const chartGroup = yield call(chartTables, chartSpec)
        yield call(dc.redrawAllAsync, chartGroup)
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    yield put(AppActions.setAppError("CHART_RENDER_ERROR", e))
  }
}

function* handleClearFilters({ chartId, redrawChart }) {
  const { dcFlag, type, measures } = yield select(selectChart(chartId))
  const dc = Services.get("dc")
  const RasterChart = dc.getChart(dcFlag)
  if (RasterChart) {
    // Choropleth poly filter's source of truth is layer.filters
    // so update layer.filters before chart.filters
    if (type === "backendChoropleth") {
      // NOTE: It is likely that RasterChart.filterAll has no effect on backendChoropleth.
      // Leaving for now but consider refactoring this in the future.
      yield call(RasterChart.clearLayerFilters)
    }
    yield call(RasterChart.filterAll)
    if (type === "backendScatter") {
      const ScatterLayer = yield call(RasterChart.getLayer, type)
      ScatterLayer.xDim().filter([...measures[0].minMax])
      ScatterLayer.yDim().filter([...measures[1].minMax])
    }

    if (redrawChart) {
      // In some instance, RasterChart.redrawGroup is called before everything
      // is complete from RasterChart.filterAll call.  filterAll supposed to
      // clear all filters for the chart, but because redrawGroup is called
      // before filter gets cleared, it is sending old filter in renderVega
      // call. setTimeout allows the queued filter changes to run through redux
      // before calling redrawGroup.
      setTimeout(RasterChart.redrawGroup, 0)
    }
  }
}

function* waitForRenderDone(chartId: String) {
  const renderDoneSelector = (state) => state.dc.render[chartId]?.done

  if (yield select(renderDoneSelector)) {
    return
  }

  while (true) {
    yield take(CHART_RENDER_SUCCESS)
    if (yield select(renderDoneSelector)) {
      return
    }
  }
}

export function* handleUpdateRasterLayerSettings({ chartId, updates }) {
  try {
    const { type, currentLayer, ...chartSpec } = yield select(
      selectChart(chartId)
    )

    const renderPending = yield select(({ dc }) => dc.render[chartId]?.pending)

    if (renderPending) {
      yield* waitForRenderDone(chartId)
    }

    if (currentLayer !== "master") {
      switch (type) {
        case "backendChoropleth":
          yield* handleUpdatePolySettings({ chartId })
          break
        case "pointmap":
        case "backendScatter":
          yield* handleUpdatePointmapSettings({ chartId })
          break
        case CHART_TYPES.CROSS_SECTION:
          yield* handleUpdateCrossSectionSettings({ chartId })
          break
        case CHART_TYPES.CROSS_SECTION_TERRAIN:
          yield* handleUpdateCrossSectionTerrainSettings({ chartId })
          break
        case CHART_TYPE_WINDBARB:
          yield* handleUpdateWindbarbSettings({ chartId })
          break
        case "geoheat":
          yield* handleUpdateGeoHeatSettings({ chartId })
          break
        case "linemap":
          yield* handleUpdateLinemapSettings({ chartId })
          break
        case CHART_TYPES.CONTOUR:
          yield* handleUpdateContourSettings({ chartId })
          break
        default:
          break
      }
    }

    if (length(intersection(keys(updates), rasterChartSettings))) {
      yield* setRasterChartSettings({ chartId, chartSpec })
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    yield put(AppActions.setAppError("CHART_RENDER_ERROR", e))
  }
}

function* handleSetRasterChartMeasure({ chartId, selector, index }) {
  const { type } = yield select(selectChart(chartId))

  if (type === "backendChoropleth") {
    yield* setPolyMeasure({ chartId, selector, index })
  } else if (isCrossSectionType(type)) {
    yield* setCrossSectionMeasure({ chartId, selector, index })
  } else if (isRasterPointChart(type) || isWindbarbChartType(type)) {
    yield* setPointmapOrWindbarbMeasure({ chartId, selector, index })
  } else if (type === "linemap") {
    yield* setLinemapMeasure({ chartId, selector, index })
  } else if (type === CHART_TYPES.CONTOUR) {
    yield* setContourMeasure({ chartId, selector, index })
  }
}

function* handleSetRasterChartPostFilter({ chartId, selector, index }) {
  const { type } = yield select(selectChart(chartId))
  if (isRasterPointChart(type)) {
    yield* setPointmapPostFilter({ chartId, selector, index })
  }
}

function* handleUpdateMasterLayerSettings({ chartId, layerId }) {
  const { layers } = yield select(selectChart(chartId))
  const layerSpec = layers[layerId]
  const type = layerSpec.type
  const layerName = getMultiLayerName(type, layerId)

  if (layerSpec.active === false || layerSpec.activeZoomLevel === false) {
    return
  }
  if (type === "backendChoropleth") {
    yield* handleUpdatePolySettings({ chartId, layerName, layerSpec })
  } else if (isWindbarbChartType(type)) {
    handleUpdateWindbarbSettings({ chartId, layerName, layerSpec })
  } else if (isRasterPointChart(type)) {
    handleUpdatePointmapSettings({ chartId, layerName, layerSpec })
  } else if (type === "geoheat") {
    yield* handleUpdateGeoHeatSettings({ chartId, layerName, layerSpec })
  } else if (type === "linemap") {
    yield* handleUpdateLinemapSettings({ chartId, layerName, layerSpec })
  } else if (type === CHART_TYPES.CONTOUR) {
    yield* handleUpdateContourSettings({ chartId, layerId })
  } else if (type === CHART_TYPES.CROSS_SECTION) {
    yield* handleUpdateCrossSectionSettings({ chartId, layerName, layerSpec })
  } else if (type === CHART_TYPES.CROSS_SECTION_TERRAIN) {
    yield* handleUpdateCrossSectionTerrainSettings({
      chartId,
      layerName,
      layerSpec
    })
  }
}

function* handleRemoveRasterChartMeasure({ chartId }) {
  const chartSpec = yield select(selectChart(chartId))
  const { dataError, type, currentLayer } = chartSpec
  // When there is a data error happened in raster chart from bad selector or agg selection,
  // there is no automatic recovery process to remove the bad data selection.
  // However, we can recover the chart when the bad selector gets removed. We need to run handleCreateRasterChart
  // since there is no valid raster chart to update.
  // During chart render trial, the renderVegaAsync will eventually clearChartDataError
  if (dataError && isLayerValid(chartSpec)) {
    yield* handleCreateRasterChart({ chartId, chartSpec })
  } else if (dataError === false && currentLayer !== "master") {
    if (type === "backendChoropleth") {
      yield* handleUpdatePolySettings({ chartId })
    } else if (isRasterPointChart(type)) {
      yield* handleUpdatePointmapSettings({ chartId })
    } else if (type === "geoheat") {
      yield* handleUpdateGeoHeatSettings({ chartId })
    } else if (type === "linemap") {
      yield* handleUpdateLinemapSettings({ chartId })
    } else if (type === CHART_TYPES.CONTOUR) {
      yield* handleUpdateContourSettings({ chartId })
    }
  }
}

// Used for add or remove dimension in Pointmap, BE scatter, and Linemap charts
// TODO[C]: do I need to do something here since contour has lat/lon dimensions?
function* handleRasterChartDimension({ chartId }) {
  const { type } = yield select(selectChart(chartId))

  if (isRasterPointChart(type)) {
    yield* handleUpdatePointmapAggTransition({ chartId }) // updates the Color measure when dimension is changed
    yield* isWindbarbChartType(type)
      ? handleUpdateWindbarbSettings({ chartId })
      : handleUpdatePointmapSettings({ chartId }) // updates the Pointmap and BE scatter
  } else if (type === "linemap") {
    yield* handleUpdateLinemapAggTransition({ chartId })
    yield* handleUpdateLinemapSettings({ chartId })
  } else {
    return
  }
}

function* handleAutoPopulateRasterChartMeasure({ chartId, columnMetaData }) {
  if (!columnMetaData) {
    return
  }

  const { type } = yield select(selectChart(chartId))
  function* setGeoSelector(geoCol, index = 0) {
    // If it's a join we need the full table.column qualifier
    // in the case of ambiguous columns
    const value = geoCol.is_join
      ? `${geoCol.table}.${geoCol.column}`
      : geoCol.column
    const geoMeasureOptions = {
      axisLabel: null,
      custom: false,
      value,
      label: geoCol.column,
      is_array: geoCol.is_array,
      is_dict: geoCol.is_dict,
      is_join: geoCol.is_join,
      name_is_ambiguous: geoCol.name_is_ambiguous,
      table: geoCol.table,
      type: geoCol.type
    }
    yield put(
      ChartActions.addSelector(
        ["geoheat", CHART_TYPES.CONTOUR].includes(type)
          ? "dimensions"
          : "measures"
      )(chartId, type, index, geoMeasureOptions)
    )
  }

  let geoCols = []
  if (type === "pointmap" || type === "geoheat") {
    geoCols = values(filter((col) => isPointOnlyGeo(col.type), columnMetaData))
  } else if (type === "linemap") {
    geoCols = values(filter((col) => isLineGeo(col.type), columnMetaData))
  } else if (type === "backendChoropleth") {
    geoCols = values(filter((col) => isPolyGeo(col.type), columnMetaData))
  }

  if (geoCols.length > 0) {
    yield setGeoSelector(geoCols[0])
    return
  } else if (
    ["pointmap", "geoheat", CHART_TYPES.CONTOUR, CHART_TYPE_WINDBARB].includes(
      type
    )
  ) {
    geoCols = values(filter((col) => isPointOtherGeo(col.type), columnMetaData))

    const lat = filter(
      (col) =>
        ["lat", "latitude", "raster_lat"].includes(col.column.toLowerCase()),
      geoCols
    )
    const lon = filter(
      (col) =>
        ["lon", "longitude", "raster_lon"].includes(col.column.toLowerCase()),
      geoCols
    )
    if (lat.length > 0 && lon.length > 0) {
      yield setGeoSelector(lon[0], 0)
      yield setGeoSelector(lat[0], 1)
      return
    }
  }

  // if we've made it here, there's no geo column that matches the current
  // chart type, so let's see if there's a better chart-type fit
  if (
    isGeoChart(type) &&
    getFeatureFlag(available_feature_flags.AUTO_CHANGE_MAP_CHART_TYPE)
  ) {
    geoCols = values(filter((col) => isGeo(col.type), columnMetaData))
    if (geoCols.length > 0) {
      if (isPointOnlyGeo(geoCols[0].type)) {
        yield put(updateChartType(chartId, "pointmap", true))
      } else if (isLineGeo(geoCols[0].type)) {
        yield put(updateChartType(chartId, "linemap", true))
      } else if (isPolyGeo(geoCols[0].type)) {
        yield put(updateChartType(chartId, "backendChoropleth", true))
      } else {
        return
      }

      yield put(
        RasterActions.maybeAutoPopulateRasterMeasure(chartId, columnMetaData)
      )
    }
  }
}

export function* handleDeleteRasterChartLegend({ chartId }) {
  const { dcFlag } = yield select(selectChart(chartId))
  const dc = Services.get("dc")
  const dcChart = dc.getChart(dcFlag)

  if (dcChart) {
    dcChart.destroyChartLegend(dcChart)
  }
}

function* getOmniFiltersForChart(chartId) {
  return (yield select(({ omnifilters }) => omnifilters) || []).filter(
    (f) => f.chartId === chartId && f.appliesTo === "CHART"
  )
}

const deleteOrShuffleChartFilters = (chartId, deleteLayerId) => (f) => {
  if (f.layerId === deleteLayerId) {
    store.dispatch(clearFilterByName(f.name, chartId))
  } else if (f.layerId > deleteLayerId) {
    store.dispatch(updateFilterLayerIdByName(f.name, f.layerId - 1))
  }
}

function* handleDeleteLayer({ chartId, deleteLayerId, prevLayerId }) {
  const omniFiltersForChart = yield getOmniFiltersForChart(chartId)
  omniFiltersForChart.forEach(
    deleteOrShuffleChartFilters(chartId, deleteLayerId)
  )
  const { dcFlag, ...chartSpec } = yield select(selectChart(chartId))
  const dc = Services.get("dc")
  const dcChart = dc.getChart(dcFlag)
  const currentLayer = chartSpec.currentLayer
  if (dcChart) {
    dcChart.deleteLayerLegend(currentLayer, deleteLayerId, prevLayerId)
    const layers = dcChart.getLayers()
    // layer.destroyLayer() destroys the filter associated for the layer
    if (layers.length > 1) {
      // deleting layer from Master layer tab
      layers[deleteLayerId].destroyLayer()
    } else {
      layers[0].destroyLayer()
    }
  }

  if (currentLayer === "master") {
    yield* handleCombineLayers({ chartId })
  }
}

export function* swapMeasures({
  chartId,
  selectorType,
  hoverIndex,
  dragIndex
}) {
  const { dcFlag, ...chartSpec } = yield select(selectChart(chartId))
  const dcChart =
    typeof dcFlag === "number" ? Services.get("dc").getChart(dcFlag) : null
  if (dcChart && !chartSpec.hasError && isRasterChart(chartSpec.type)) {
    // At this point, the dimensions/measures have been swapped. We need to
    // make the same swap in the hoverSelectedColumns. But, since the
    // dimensions/measures have been swapped, we need the name from one and the
    // value from the other, and vice versa, to find the appropriate
    // hoverSelectedColumns to swap.
    const hoverSelectedColumns = [...chartSpec.hoverSelectedColumns]
    const hoverSelector = chartSpec[selectorType][hoverIndex]
    const dragSelector = chartSpec[selectorType][dragIndex]
    const hoverHSCIdx = hoverSelectedColumns.findIndex(
      ({ name, value }) =>
        name === dragSelector.name && value === hoverSelector.value
    )
    const dragHSCIdx = hoverSelectedColumns.findIndex(
      ({ name, value }) =>
        name === hoverSelector.name && value === dragSelector.value
    )
    if (hoverHSCIdx >= 0 || dragHSCIdx >= 0) {
      // we only actually need to update the names to make this work
      if (hoverHSCIdx >= 0) {
        hoverSelectedColumns[hoverHSCIdx] = {
          ...hoverSelectedColumns[hoverHSCIdx],
          name: hoverSelector.name
        }
      }
      if (dragHSCIdx >= 0) {
        hoverSelectedColumns[dragHSCIdx] = {
          ...hoverSelectedColumns[dragHSCIdx],
          name: dragSelector.name
        }
      }

      // update
      yield put(RasterActions.updatePopupColumns(chartId, hoverSelectedColumns))
      chartSpec.hoverSelectedColumns = hoverSelectedColumns
    }

    yield* handleCreateRasterChart({ chartId, chartSpec })
  }
}

function* handleUpdateGeoJoinColumn({ chartId, column }) {
  const { type, dimensions, geoJoin } = yield select(selectChart(chartId))
  if (!geoJoin.column) {
    // Remove the geo measure in case it was from the dim table
    yield put(RasterActions.removeRasterChartMeasure(chartId, 0))
    return
  }
  if (column && geoJoin && geoJoin.table) {
    // GeoJoin, make sure we have a dimension to join against
    if (dimensions.length < 1 || dimensions[0].value === undefined) {
      return
    }

    const geoJoinTable = yield select(({ dashboard }) => dashboard.joinTable)
    const polyGeoCols = values(
      filter((col) => isGeo(col.type), geoJoinTable.columnMetadata)
    )
    if (polyGeoCols.length === 1) {
      const polyGeoCol = polyGeoCols[0]
      const geoMeasureOptions = {
        axisLabel: null,
        custom: false,
        ...polyGeoCol
      }
      yield put(
        ChartActions.addSelector("measures")(
          chartId,
          type,
          0,
          geoMeasureOptions
        )
      )
    }
  }
}

function* handleUpdateRasterMeasureAgg(chartSpec) {
  const { chartId, index } = chartSpec
  const { type } = yield select(selectChart(chartId))

  if (isRasterPointChart(type)) {
    yield* updatePointmapOrWindbarbMeasure({ chartId, index })
  } else if (type === CHART_TYPES.LINEMAP) {
    yield* updateLinemapMeasure({ chartId, index })
  } else if (type === CHART_TYPES.BACKEND_CHOROPLETH) {
    yield* updatePolyMeasure({ chartId, index })
  } else if (type === CHART_TYPES.CONTOUR) {
    yield* updateContourMeasure({ chartId, index })
  } else {
    return
  }
}

function* handleUpdateRasterPostFilter({
  chartId,
  index,
  selectorType = "postFilter"
}) {
  const { type } = yield select(selectChart(chartId))
  if (isRasterPointChart(type)) {
    yield* isWindbarbChartType(type)
      ? handleUpdateWindbarbSettings({ chartId, index, selectorType })
      : handleUpdatePointmapSettings({ chartId, index, selectorType })
  }
}

// Only needs to work for raster charts
const chartUsesPaletteMapping = (chart, paletteMappingId) => {
  return (
    chart.layers?.some((l) => l.color?.paletteMappingId === paletteMappingId) ||
    chart.color?.paletteMappingId === paletteMappingId
  )
}

function* handlePaletteMappingUpdated({ id }) {
  const state = yield select()
  for (const [chartId, chart] of Object.entries(state.charts)) {
    if (isRasterChart(chart.type) && chartUsesPaletteMapping(chart, id)) {
      if (chart.layers?.length > 1) {
        store.dispatch(RasterActions.combineRasterLayers(chartId))
      } else {
        yield* handleUpdateRasterLayerSettings({ chartId })
      }
    }
  }
}

export default function* root(): Generator {
  yield all([
    takeEvery(ActionTypes.DESTROY_GEOHEAT, handleDestroyRasterChart),
    takeEvery(ActionTypes.CREATE_GEOHEAT_CHART, handleCreateRasterChart),
    takeEvery(ActionTypes.UPDATE_GEOHEAT_CHART, handleUpdateRasterChartSize),
    takeEvery(
      ActionTypes.SET_GEOHEAT_MARK_TYPE,
      handleUpdateRasterLayerSettings
    ),
    takeEvery(ActionTypes.SET_GEOHEAT_MEASURE, handleUpdateGeoHeatSettings),
    takeEvery(ActionTypes.SET_GEOHEAT_DIMENSION, setGeoHeatDimension),
    takeEvery(
      ActionTypes.SET_GEOHEAT_COLOR_RANGE,
      handleUpdateRasterLayerSettings
    ),
    takeEvery(ActionTypes.SET_GEOHEAT_PIXEL_SIZE, handleUpdateGeoHeatSettings),
    takeEvery("SET_CONTOUR_DIMENSION", setContourDimension),
    takeEvery(RasterActions.COMBINE_RASTER_LAYERS, handleCombineLayers),
    takeEvery(RasterActions.DESTROY_RASTER_CHART, handleDestroyRasterChart),
    takeEvery(ActionTypes.RESET_RASTER_CHART, handleResetRasterChart),
    takeEvery(
      RasterActions.DELETE_RASTER_CHART_LEGEND,
      handleDeleteRasterChartLegend
    ),
    takeEvery(RasterActions.DELETE_RASTER_LAYER, handleDeleteLayer),
    takeEvery(RasterActions.SWAP_RASTER_LAYER, handleCombineLayers),
    // pointmap
    takeEvery(RasterActions.CREATE_RASTER_CHART, handleCreateRasterChart),
    takeEvery("ADD_CUSTOM_COLOR", handleUpdateRasterLayerSettings),
    takeEvery("SET_CUSTOM_COLOR", handleUpdateRasterLayerSettings),
    takeEvery(
      RasterActions.UPDATE_RASTER_CHART_COLOR_PALETTE,
      handleUpdateRasterLayerSettings
    ),
    takeEvery(UPDATE_PALETTE_MAPPING, handlePaletteMappingUpdated),
    takeEvery("REMOVE_CUSTOM_COLOR", handleUpdateRasterLayerSettings),
    takeEvery("TOGGLE_OTHER_RASTER", handleUpdateRasterLayerSettings),
    takeEvery("UPDATE_HIDE_OTHER", handleUpdateRasterLayerSettings),
    takeEvery(
      "SET_CUSTOM_DEFAULT_OTHER_COLOR",
      handleUpdateRasterLayerSettings
    ),
    takeEvery(
      RasterActions.UPDATE_RASTER_CHART,
      handleUpdateRasterLayerSettings
    ),
    takeEvery(
      RasterActions.UPDATE_DENSITY_ACCUMULATOR,
      handleUpdateRasterLayerSettings
    ),
    takeEvery(
      RasterActions.REMOVE_RASTER_CHART_MEASURE,
      handleRemoveRasterChartMeasure
    ),
    takeEvery(RasterActions.UPDATE_GEO_JOIN_COLUMN, handleUpdateGeoJoinColumn),
    takeEvery(
      RasterActions.SET_RASTER_CHART_MEASURE,
      handleSetRasterChartMeasure
    ),
    takeEvery(
      RasterActions.SET_RASTER_CHART_POST_FILTER,
      handleSetRasterChartPostFilter
    ),
    takeEvery(RasterActions.CLEAR_RASTER_CHART_FILTERS, handleClearFilters),
    takeEvery(RasterActions.SET_LAYER_OPACITY, handleUpdateMasterLayerSettings),
    takeEvery(
      RasterActions.SET_SINGLE_LAYER_OPACITY,
      handleUpdateRasterLayerSettings
    ),
    takeEvery(RasterActions.SET_LAYERS_VISIBILITY, handleCombineLayers),
    takeEvery("SWAP_SELECTORS", swapMeasures),

    takeEvery(
      RasterActions.UPDATE_RASTER_CHART_MEASURE_AGG,
      handleUpdateRasterMeasureAgg
    ),
    takeEvery(APPLY_SAVED_PALETTE_MAPPING, handleUpdateRasterLayerSettings),
    takeEvery(CLEAR_PALETTE_MAPPING, handleUpdateRasterLayerSettings),
    takeEvery(
      RasterActions.UPDATE_RASTER_CHART_POST_FILTER,
      handleUpdateRasterPostFilter
    ),
    takeEvery(
      RasterActions.REMOVE_RASTER_CHART_POST_FILTER,
      handleUpdateRasterPostFilter
    ),
    takeEvery(
      RasterActions.SET_RASTER_CHART_DIMENSION,
      handleRasterChartDimension
    ),
    takeEvery(
      RasterActions.REMOVE_RASTER_CHART_DIMENSION,
      handleRasterChartDimension
    ),
    takeEvery(
      RasterActions.AUTO_SET_RASTER_GEO_MEASURE,
      handleAutoPopulateRasterChartMeasure
    ),
    takeEvery(RasterActions.ADD_POPUP_COLUMN, handleUpdateRasterLayerSettings),
    takeEvery(
      RasterActions.REMOVE_POPUP_COLUMN,
      handleUpdateRasterLayerSettings
    ),
    takeEvery(
      RasterActions.UPDATE_POPUP_COLUMNS,
      handleUpdateRasterLayerSettings
    ),
    takeEvery(
      RasterActions.UPDATE_POPUP_COLUMN,
      handleUpdateRasterLayerSettings
    ),
    takeEvery(
      RasterActions.SET_PRIORITIZED_COLOR,
      handleUpdateRasterLayerSettings
    ),
    takeEvery(
      RasterActions.CONTOUR_MAJOR_INTERVAL_SETTINGS_CHANGED,
      handleUpdateRasterLayerSettings
    ),
    takeEvery(
      RasterActions.CONTOUR_MINOR_INTERVAL_SETTINGS_CHANGED,
      handleUpdateRasterLayerSettings
    ),
    takeEvery(
      RasterActions.CONTOUR_GRID_CELL_SETTINGS_CHANGED,
      handleUpdateRasterLayerSettings
    ),
    takeEvery(
      RasterActions.CONTOUR_INTERVALS_CHANGED,
      handleUpdateRasterLayerSettings
    ),
    takeEvery(
      RasterActions.REFRESH_RASTER_CHART_SETTINGS,
      handleUpdateRasterLayerSettings
    )
  ])
}
