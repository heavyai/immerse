// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { call, put, select } from "redux-saga/effects"
import { path } from "ramda"
import { CHART_RENDER_ERROR } from "constants/action-types"
import * as ActionTypes from "charts/raster-chart/raster-chart-actions"
import * as AppActions from "actions/app-action-creators"
import * as ChartActions from "actions/charts-action-creators"
import * as rasterUtils from "./raster-utils"
import * as rasterPopupUtils from "./raster-popup-utils"
import { layerDefaultOpacity } from "constants/magic-variables"
import Services from "services/immerse"
import { importableStore as store } from "store/importableStore"
import { isEmpty, isSelectorUsable } from "utils/selector-helpers"
import { mergeR } from "utils/ramda-helpers"
import { updateChart } from "actions/update-chart-action-creator"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { getDisplayOrParameterName } from "utils/get-display-or-parameter-name"
import { isPolyGeo } from "../../constants/data-types"
import { getDefaultFormat } from "../../utils/formatter-helper"
import { CHARTS_DEFAULT_COLORS, getColors } from "../../services/colors"
import {
  DEFAULT_POLY_BORDER_COLOR,
  DEFAULT_POLY_BORDER_WIDTH
} from "./raster-chart-consts"
import {
  getDefaultCategoricalPalette,
  filterDefaultValuesFromDomainRange,
  calculateNewRangeWithAdditionalColors
} from "reducers/charts/helpers/color-helpers"

function createFilterListener(chartId, layerIndex) {
  return (_layer, filters) => {
    store.dispatch(ActionTypes.updateLayerFilters(chartId, layerIndex, filters))
  }
}

function doJoin(layerSpec) {
  return (
    layerSpec.dimensions &&
    layerSpec.dimensions.filter(isSelectorUsable).map((d) => d.value) &&
    path(["geoJoin", "column"], layerSpec)
  )
}

function getPolyColorBlock(
  color,
  colorMeasure,
  groupby,
  opacity,
  type,
  colorDomain,
  legendOpen,
  legendLocked,
  rasterShowOther,
  dataSource,
  fullColorHashing
) {
  if (color.type === "solid") {
    return {
      type: "solid",
      value: color.val[0],
      opacity
    }
  } else if (color.type === "custom") {
    const palette = color.palette ?? getDefaultCategoricalPalette()
    const { domain, range } = filterDefaultValuesFromDomainRange(
      color.customDomain,
      color.customRange,
      palette.val
    )
    const newRange = calculateNewRangeWithAdditionalColors(range, palette.val)

    return {
      type: "ordinal",
      field: colorMeasure.value,
      label: colorMeasure.label,
      domain: fullColorHashing
        ? Array.from({ length: newRange.length }, (_, i) => i)
        : color.customDomain,
      originalDomain: color.customDomain,
      range: fullColorHashing ? newRange : color.customRange,
      originalRange: color.customRange,
      default: color.defaultOtherRange,
      opacity,
      showOther: rasterShowOther,
      defaultOtherRange:
        color.defaultOtherRange ||
        getColors(CHARTS_DEFAULT_COLORS).custom.defaultOtherRange,
      hideOther:
        colorMeasure.type === "BOOL" || fullColorHashing
          ? true
          : color.hideOther,
      legend: {
        title: `${
          colorMeasure.label
            ? process(colorMeasure.label, { useDisplayName: true })
            : colorMeasure.label
        } ${
          colorMeasure.custom
            ? "[custom]"
            : `[${getDisplayOrParameterName(dataSource)}]`
        }`,
        open: typeof legendOpen === "undefined" ? true : legendOpen
      },
      palette,
      fullColorHashing,
      customColors: {
        domain,
        range
      }
    }
  } else {
    const colorLegendBound = colorDomain || colorMeasure.minMax // changing the color legend bounds updates colorDomain,
    // if user sets colorDomain, it will regard the value. If not, it will take color measure minMax

    const aggregate = groupby.length
      ? {
          aggregate: rasterUtils.toAggExpression(
            colorMeasure.aggType,
            colorMeasure.value
          )
        }
      : {}
    return {
      type: "quantitative",
      field: colorMeasure.value,
      label: colorMeasure.label,
      domain: colorDomain && legendLocked ? colorLegendBound : "auto", // we use auto when legend is not locked
      range: color.val,
      opacity,
      legend: {
        title: `${
          colorMeasure.label
            ? process(colorMeasure.label, { useDisplayName: true })
            : colorMeasure.label
        } ${
          colorMeasure.custom
            ? "[custom]"
            : `[${getDisplayOrParameterName(dataSource)}]`
        }`,
        open: typeof legendOpen === "undefined" ? true : legendOpen,
        locked: legendLocked
      },
      ...aggregate
    }
  }
}

function getPolyDataBlock(layerSpec) {
  const geoCol = layerSpec.measures[0]

  if (doJoin(layerSpec)) {
    const joinDimension = layerSpec.dimensions[0]
    const table = geoCol.is_join
      ? process(layerSpec.dataSource)
      : joinDimension.table
    const dimValue = joinDimension.is_join
      ? joinDimension.label
      : joinDimension.value
    return [
      {
        table,
        attr: dimValue
      },
      {
        table: layerSpec.geoJoin.table,
        attr: layerSpec.geoJoin.column
      }
    ]
  } else {
    const table = geoCol.is_join ? process(layerSpec.dataSource) : geoCol.table

    return [
      {
        table,
        attr: "rowid"
      }
    ]
  }
}

function* handlePopups(chartId: string, PolyLayer, spec) {
  const { measures, dimensions, hoverSelectedColumns = [] } = spec
  if (doJoin(spec)) {
    const popupColumns = ["key0"]
    const popupColumnsMapped = {
      key0: dimensions[0].label
    }
    // Color measure, add if exists
    if (measures?.[1]?.value) {
      popupColumns.push("color")
      popupColumnsMapped.color = measures[1].label
    }
    yield call(PolyLayer.popupColumns, popupColumns)
    yield call(PolyLayer.popupColumnsMapped, popupColumnsMapped)
  } else {
    // Is this a join datasource
    const geoMeasure = measures[0]
    const grouped = geoMeasure?.is_join
    const [
      popupColumns,
      popupAliases
    ] = rasterPopupUtils.reduceAggAndAliasMapPopupColumns(
      "poly",
      hoverSelectedColumns,
      dimensions,
      measures,
      grouped,
      chartId
    )
    yield call(PolyLayer.popupColumns, popupColumns)
    yield call(PolyLayer.popupColumnsMapped, popupAliases)
  }
}

export function* createPolyLayer({ chartId, ...layerSpec }) {
  const {
    type,
    polyCap,
    color,
    measures,
    dimensions,
    filters,
    borderWidth,
    borderColor = DEFAULT_POLY_BORDER_COLOR,
    hasBorderColorFromFill,
    opacity,
    legendOpen,
    currentLayer,
    dataSource,
    rasterShowOther,
    fullColorHashing
  } = layerSpec

  const geoMeasure = measures.find((d) => d.name === "geo")
  const geocol = geoMeasure.is_join ? geoMeasure.label : geoMeasure.value
  const geoTable = geoMeasure.table
  const dc = Services.get("dc")
  const cfManager = Services.get("crossfilter")
  const cf = yield call(cfManager.getCrossfilter, dataSource, chartId)
  const PolyLayer = yield call(dc.rasterLayer, "polys")
  const finalColor = yield rasterUtils.getChartColor(color)

  let mapZoomCenter = layerSpec.mapZoomCenter
  if (geoMeasure.categories) {
    mapZoomCenter = {
      bounds: {
        lonMin: geoMeasure.categories[0],
        lonMax: geoMeasure.categories[1],
        latMin: geoMeasure.categories[2],
        latMax: geoMeasure.categories[geoMeasure.categories.length - 1]
      }
    }
  }

  let viewBoxDim = null

  if (doJoin(layerSpec)) {
    const joinKeyVal = dimensions[0].value
    viewBoxDim = rasterUtils.getLayerCrossfilterDimension(
      chartId,
      dataSource,
      joinKeyVal,
      cf
    )
  } else {
    viewBoxDim = rasterUtils.getLayerCrossfilterDimension(
      chartId,
      dataSource,
      geocol,
      cf
    )

    if (mapZoomCenter && filters && !filters.length) {
      yield call(viewBoxDim.filterST_Min_ST_Max, mapZoomCenter.bounds)
    }
  }
  yield call(PolyLayer.dimension, viewBoxDim)

  yield call(PolyLayer.crossfilter, cf)
  yield call(PolyLayer.viewBoxDim, viewBoxDim)

  const tableSize = yield call(viewBoxDim.groupAll().valueAsync)
  const colorMeasure = measures.find((m) => m.name === "color")

  let groupby = dimensions.filter(isSelectorUsable).map((d) => d.value)
  if (geoMeasure?.is_join) {
    groupby = [`${geoTable}.rowid`]
  }

  yield call(
    PolyLayer.on,
    "filtered",
    createFilterListener(
      chartId,
      currentLayer === "master" ? layerSpec.layerIndex : currentLayer
    )
  )
  // Applying new props to old charts was dispatched before dispatching createGeoHeatChart, but the state is not updated here
  // Thus, getting updated chart again to retrieve the props
  const updatedChart = yield select(rasterUtils.selectChart(chartId))

  yield call(PolyLayer.setState, {
    data: getPolyDataBlock(layerSpec),
    transform: {
      sample: true,
      limit: polyCap,
      tableSize
    },
    mark: {
      type: "poly",
      strokeColor: hasBorderColorFromFill ? "fillColor" : borderColor,
      strokeWidth: borderWidth || DEFAULT_POLY_BORDER_WIDTH,
      lineJoin: "miter",
      miterLimit: 10
    },
    encoding: {
      color: getPolyColorBlock(
        color?.type === "custom" && !color.hasOwnProperty("hideOther")
          ? updatedChart.color
          : finalColor,
        colorMeasure,
        groupby,
        opacity || layerDefaultOpacity(type),
        type,
        rasterUtils.rasterLegendConfig(layerSpec, "colorDomain"),
        legendOpen,
        rasterUtils.rasterLegendConfig(layerSpec, "legendLocked"),
        rasterShowOther === undefined
          ? updatedChart.rasterShowOther
          : rasterShowOther,
        dataSource,
        fullColorHashing
      ),
      geocol,
      geoTable
    },
    enableHitTesting: true,
    currentLayer
  })

  // If this is a join datasource (crossfilter has > 1 table) click filtering queries
  // are broken: https://heavyai.atlassian.net/browse/QE-1000
  // Once QE-1000 is fixed we can enable click filtering for join datasources
  if (cf.getTables().length > 1) {
    yield call(PolyLayer.setOnClickFiltering, false)
  }

  yield handlePopups(chartId, PolyLayer, layerSpec)

  if (filters) {
    const filterKey = doJoin(layerSpec) ? "key0" : "rowid"
    filters.forEach((f) => PolyLayer.filter(f, false, filterKey))
  }

  if (PolyLayer.setCustomFetchColorAggregate) {
    PolyLayer.setCustomFetchColorAggregate((aggregate) => process(aggregate))
  }

  if (PolyLayer.setCustomColorProjectionPostProcessor) {
    PolyLayer.setCustomColorProjectionPostProcessor(
      (aggregate, projections) => {
        if (typeof aggregate === "string" && aggregate.includes("${")) {
          projections.factProjections = [aggregate]
        }
        return projections
      }
    )
  }

  return PolyLayer
}

export function* handleUpdatePolySettings({
  layerName,
  chartId,
  layerSpec
}: {
  layerName: string
  chartId: string
  layerSpec: any
}): Generator {
  const { dcFlag, ...chartStateSpec } = yield select(
    rasterUtils.selectChart(chartId)
  )
  const chartSpec = layerSpec ? layerSpec : chartStateSpec
  const {
    type,
    polyCap,
    color,
    measures,
    dimensions,
    borderWidth,
    borderColor = DEFAULT_POLY_BORDER_COLOR,
    hasBorderColorFromFill,
    opacity,
    currentLayer,
    legendOpen,
    legendLocked,
    rasterShowOther,
    dataSource,
    fullColorHashing
  } = chartSpec

  if (!path(["measures", 0, "value"], chartSpec)) {
    // No need to update on geo col removal
    return
  }

  const finalColor = yield rasterUtils.getChartColor(color)

  const geoMeasure = measures.find((d) => d.name === "geo")
  const geocol = geoMeasure.is_join ? geoMeasure.label : geoMeasure.value
  const geoTable = geoMeasure.table

  let groupBy: Array<string> = dimensions
    .filter(isSelectorUsable)
    .map((d) => d.value)
  if (geoMeasure?.is_join) {
    groupBy = [`${geoTable}.rowid`]
  }
  const dcChart = yield call(Services.get("dc").getChart, dcFlag)
  if (dcChart) {
    try {
      const PolyLayer = yield call(dcChart.getLayer, layerName || type)
      if (PolyLayer) {
        PolyLayer.setState((state) => ({
          data: getPolyDataBlock(chartSpec),
          transform: {
            ...state.transform,
            limit: polyCap
          },
          mark: {
            ...state.mark,
            strokeColor: hasBorderColorFromFill ? "fillColor" : borderColor,
            strokeWidth: borderWidth || DEFAULT_POLY_BORDER_WIDTH
          },
          encoding: {
            color: getPolyColorBlock(
              finalColor,
              measures.find((m) => m.name === "color"),
              groupBy,
              opacity,
              type,
              rasterUtils.rasterLegendConfig(chartSpec, "colorDomain"),
              legendOpen,
              legendLocked,
              rasterShowOther,
              dataSource,
              fullColorHashing
            ),
            geocol,
            geoTable
          },
          enableHitTesting: true,
          currentLayer
        }))
        // If this is a join datasource (crossfilter has > 1 table) click filtering queries
        // are broken: https://heavyai.atlassian.net/browse/QE-1000
        // Once QE-1000 is fixed we can enable click filtering for join datasources
        if (PolyLayer.crossfilter().getTables().length > 1) {
          yield call(PolyLayer.setOnClickFiltering, false)
        }

        yield handlePopups(chartId, PolyLayer, chartSpec)
      }
      yield call(dcChart.renderAsync)
    } catch (e) {
      yield put(AppActions.setAppError(CHART_RENDER_ERROR, e))
    }
  }
}

function* getSelectorMetaData(action) {
  const { dimensions, dataSource: chartDataSource, measures } = yield select(
    rasterUtils.selectChart(action.chartId)
  )
  if (isPolyGeo(action.selector.type)) {
    try {
      // If it's a join we want to get the crossfilter for the datasource
      // not the selectors table (which will not be the join datasource)
      const cf = Services.get("crossfilter").getCrossfilter(
        action.selector.is_join ? chartDataSource : action.selector.table,
        action.chartId
      )
      const domain = yield call(cf.getPolyGeoDomain, action.selector)
      yield put(
        ActionTypes.updateMeasure({
          ...action,
          domain,
          type: action.selector.type
        })
      )
    } catch (e) {
      yield put(AppActions.setAppError(CHART_RENDER_ERROR, e))
    }
  } else if (isEmpty(dimensions) && !measures[0]?.is_join) {
    // This isn't a join in any way (old style or no code join)
    const { dataSource } = yield select(rasterUtils.selectChart(action.chartId))
    const domain = yield call(
      Services.get("crossfilter").getCrossfilter(dataSource, action.chartId)
        .getDomain,
      action.selector
    )
    const { type, ...rest } = action
    const result = { ...rest, domain }

    result.initMinMax = result.domain
    result.hideOther = true
    yield put(ActionTypes.updateMeasure(result))
  } else {
    yield put(
      ActionTypes.updateMeasure({ ...action, type: action.selector.type })
    )
  }
}

export function* setPolyMeasure(action) {
  try {
    yield put(ActionTypes.addMeasure(action))
    yield* getSelectorMetaData(action)

    // New measures auto populate as popusp columns except geo column
    if (
      action.selector.type !== "MULTIPOLYGON" &&
      action.selector.type !== "POLYGON" &&
      action.index !== 0
    ) {
      // need to get updated measures here after the addMeasure and updateMeasure updated redux state
      const updatedChart = yield select(rasterUtils.selectChart(action.chartId))
      const { measures } = updatedChart
      const newMeasure = measures[action.index]

      yield put(ActionTypes.addPopupColumn(action.chartId, newMeasure))

      // Apply default format for the new popup column
      yield put(
        ActionTypes.setPopupColumnFormat(
          action.chartId,
          action.selector,
          getDefaultFormat(newMeasure.type)
        )
      )
    }

    yield* handleUpdatePolySettings({ chartId: action.chartId })
  } catch (e) {
    yield put(AppActions.setAppError("CHART_RENDER_ERROR", e))
    yield put(
      ChartActions.updateSelector(
        action.chartId,
        "measures",
        action.index,
        mergeR({ loading: false, isError: true })
      )
    )
    yield put(updateChart(action.chartId, { loading: false }))
  }
}

export function* updatePolyMeasure({ chartId, index }) {
  const { measures } = yield select(rasterUtils.selectChart(chartId))

  yield* getSelectorMetaData({
    chartId,
    index,
    selector: measures[index]
  })

  yield put(ActionTypes.updatePopupColumn(chartId, measures[index]))

  const { dcFlag } = yield select(rasterUtils.selectChart(chartId))
  const dcChart =
    typeof dcFlag === "number" ? Services.get("dc").getChart(dcFlag) : null

  if (dcChart) {
    yield* handleUpdatePolySettings({
      chartId
    })
  }
}
