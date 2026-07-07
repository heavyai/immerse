// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { CHART_RENDER_ERROR } from "constants/action-types"
import * as ActionTypes from "charts/raster-chart/raster-chart-actions"
import * as AppActions from "actions/app-action-creators"
import * as ChartActions from "actions/charts-action-creators"
import * as rasterUtils from "./raster-utils"
import * as rasterPopupUtils from "./raster-popup-utils"
import { updateChart } from "actions/update-chart-action-creator"
import { call, put, select } from "redux-saga/effects"
import {
  layerDefaultOpacity,
  SIZE_DOMAIN_DEFAULTS,
  STROKE_WIDTH_RANGE_DEFAULTS
} from "constants/magic-variables"
import {
  isEmpty,
  isSelectorUsable,
  toTransformAgg
} from "utils/selector-helpers"
import { mergeR } from "utils/ramda-helpers"
import Services from "services/immerse"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { isLineGeo } from "constants/data-types"
import { getDefaultFormat } from "utils/formatter-helper"
import { CHARTS_DEFAULT_COLORS, getColors } from "services/colors"
import { getDisplayOrParameterName } from "utils/get-display-or-parameter-name"
import { SELECTOR_ASSIGNMENTS } from "constants/selectors"
import {
  getDefaultCategoricalPalette,
  filterDefaultValuesFromDomainRange,
  calculateNewRangeWithAdditionalColors
} from "reducers/charts/helpers/color-helpers"

const { COLOR, SIZE, GEO } = SELECTOR_ASSIGNMENTS

function doJoin(layerSpec) {
  return (
    layerSpec.dimensions.length > 0 &&
    layerSpec.dimensions[0]?.value &&
    layerSpec.geoJoin?.column
  )
}

function getLineDataBlock(layerSpec) {
  const geoCol = layerSpec.measures.find((d) => d.name === GEO)

  if (doJoin(layerSpec)) {
    const factDim = layerSpec.dimensions[0]
    const customDim = layerSpec.dimensions.find((d) => d.custom === true)
    const factTable = customDim ? layerSpec.dataSource : factDim.table
    const factColumn = factDim.is_join ? factDim.label : factDim.value

    return [
      {
        table: factTable,
        attr: factColumn
      },
      {
        table: layerSpec.geoJoin.table,
        attr: layerSpec.geoJoin.column
      }
    ]
  } else {
    return [
      {
        table: geoCol.table,
        attr: "rowid"
      }
    ]
  }
}

/**
 * defines line strokeColor and corresponding type of legend based on color measure selection
 * strokeColor defaults to solid blue if there is no color measure selection
 * quantitative measure selection has gradient legend and the legend lock defaults to unlocked
 * @param color
 * @param colorMeasure
 * @param density
 * @param opacity
 * @param legendOpen
 * @param isAgg
 * @param colorDomain
 * @param legendLocked
 * @param groupby
 * @returns {*}
 */
function getLinemapColor(
  color,
  colorMeasure,
  density,
  opacity,
  legendOpen,
  isAgg = false,
  colorDomain,
  legendLocked,
  groupby,
  rasterShowOther,
  dataSource,
  fullColorHashing
) {
  legendOpen = typeof legendOpen === "undefined" ? true : legendOpen
  const colorMeasureValue = colorMeasure?.is_join
    ? colorMeasure?.label
    : colorMeasure?.value

  if (density && (!colorMeasure || !colorMeasure.value)) {
    return {
      type: "density",
      range: color.reverse ? [...color.val].reverse() : color.val,
      opacity
    }
  } else if (color.type === "solid" || !colorMeasure || !colorMeasure.value) {
    return { type: "solid", value: color.val[0], opacity }
  } else if (color.type === "custom" && !isAgg) {
    const palette = color.palette ?? getDefaultCategoricalPalette()
    const { domain, range } = filterDefaultValuesFromDomainRange(
      color.customDomain,
      color.customRange,
      palette.val
    )
    const newRange = calculateNewRangeWithAdditionalColors(range, palette.val)

    return {
      type: "ordinal",
      field: colorMeasureValue,
      label: colorMeasure.label,
      domain: fullColorHashing
        ? Array.from({ length: newRange.length }, (_, i) => i)
        : color.customDomain,
      originalDomain: color.customDomain,
      range: fullColorHashing ? newRange : color.customRange,
      originalRange: color.customRange,
      opacity,
      showOther: rasterShowOther, // flag that is controlled by Other category visibility toggle, defaults to true for all charts
      defaultOtherRange:
        color.defaultOtherRange ||
        getColors(CHARTS_DEFAULT_COLORS).custom.defaultOtherRange, // Other category color that will be used for Legend
      hideOther:
        colorMeasure.type === "BOOL" || fullColorHashing
          ? true
          : color.hideOther, // based on previous UX, Other is not available for Boolean, so keeping it the same way but limiting Other for bool type
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
        open: legendOpen
      },
      colorMeasureAggType: colorMeasure.aggType,
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

    const allNullCol = colorLegendBound?.every((clb) => clb === null)

    let colorVal = null
    if (color.type === "quantitative" && allNullCol) {
      // handles all null color measure column color
      colorVal = color.defaultOtherRange
        ? [color.defaultOtherRange]
        : color.val.slice(1)
    } else {
      colorVal = color.val
    }
    return {
      type: "quantitative",
      field: colorMeasureValue,
      ...(groupby.length
        ? {
            aggregate:
              colorMeasure.aggType === "Custom"
                ? colorMeasureValue
                : rasterUtils.toAggExpression(
                    colorMeasure.aggType,
                    `${colorMeasure.table}.${colorMeasureValue}`
                  )
          }
        : {}),
      label: colorMeasure.label,
      domain: colorDomain && legendLocked ? colorLegendBound : "auto", // we use auto when legend is not locked
      range: color.reverse ? [...color.val].reverse() : colorVal,
      opacity: opacity || layerDefaultOpacity("linemap"),
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
        open: legendOpen,
        locked: legendLocked
      },
      colorMeasureAggType: colorMeasure.aggType
    }
  }
}

/**
 * defines line strokeWidth
 * @param sizeMeasure
 * @param sizeRange
 * @param autoSize
 * @param sizeDomain
 * @param isAgg
 * @returns {*}
 */
function getLinemapSize(
  sizeMeasure,
  sizeRange,
  autoSize,
  sizeDomain,
  isAgg = false
) {
  if (autoSize) {
    return "auto"
  } else if (sizeMeasure && sizeMeasure.value) {
    return {
      type: sizeMeasure.aggType === "Custom" ? "custom" : "quantitative",
      field:
        sizeMeasure.aggType === "Custom"
          ? sizeMeasure.value
          : sizeMeasure.label,
      ...(isAgg ? { aggregate: toTransformAgg(sizeMeasure.aggType) } : {}),
      label: sizeMeasure.label,
      domain: sizeDomain
        ? sizeDomain
        : sizeMeasure.minMax || SIZE_DOMAIN_DEFAULTS,
      range: sizeRange || STROKE_WIDTH_RANGE_DEFAULTS,
      table: sizeMeasure.table
    }
  } else {
    return sizeRange ? sizeRange[0] : STROKE_WIDTH_RANGE_DEFAULTS[0]
  }
}

/**
 * Handles popup columns depending on groupby selection.
 * If groupby selected, we don't show Popup column selection component but include
 * grouped values in addition to dimension value If no groupby/no dimension, we
 * show the component and include what is selected as popup column in addition to rowid
 * @param groupby
 * @param LineLayer
 * @param dimensions
 * @param measures
 * @param hoverSelectedColumns
 */
function handlePopup(
  groupby,
  LineLayer,
  dimensions,
  measures,
  hoverSelectedColumns,
  chartId
) {
  const [columns, aliases] = rasterPopupUtils.reduceAggAndAliasMapPopupColumns(
    "linemap",
    hoverSelectedColumns,
    dimensions,
    measures,
    groupby.length,
    chartId
  )

  LineLayer.popupColumns(columns)
  LineLayer.popupColumnsMapped(aliases)
}

/**
 * Retrieves initial raster Linelayer properties from heavyai-charting,
 * then creates pre vega spec from current chart selection and sends it
 * using setState method which helps to build actual vega spec
 * @param chartId
 * @param layerIndex
 * @param layerSpec
 * @returns {object}
 */
export function* createLineLayer(layerSpec) {
  const dc = Services.get("dc")
  const cfManager = Services.get("crossfilter")
  const cf = yield call(
    cfManager.getCrossfilter,
    layerSpec.dataSource,
    layerSpec.chartId
  )

  const LineLayer = yield call(dc.rasterLayer, "lines")
  const {
    cap,
    color,
    measures,
    dimensions,
    sizeRange,
    autoSize,
    sizeDomain,
    opacity,
    hoverSelectedColumns = [],
    densityAccumulatorEnabled,
    mapZoomCenter = {
      bounds: {
        lonMin: measures[0].categories[0],
        lonMax: measures[0].categories[1],
        latMin: measures[0].categories[2],
        latMax: measures[0].categories[measures[0].categories.length - 1]
      }
    },
    legendOpen,
    colorDomain,
    legendLocked,
    currentLayer,
    dataSource,
    chartId,
    popupEnabled,
    rasterShowOther,
    fullColorHashing
  } = layerSpec

  const geoMeasure = measures.find((d) => d.name === GEO)
  const geocol = geoMeasure.is_join ? geoMeasure.label : geoMeasure.value
  const geoTable = geoMeasure.table

  let viewBoxDim = null
  if (doJoin(layerSpec)) {
    // the first dimension will be the group by dimension
    const joinDim = dimensions[0]
    // is_join refers to a join data source, not a geo join
    const joinKeyVal = joinDim.is_join ? joinDim.label : joinDim.value
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
    yield call(viewBoxDim.filterST_Min_ST_Max, mapZoomCenter.bounds)
  }

  yield call(LineLayer.dimension, viewBoxDim)
  yield call(LineLayer.crossfilter, cf)

  yield call(LineLayer.viewBoxDim, viewBoxDim)

  const tableSize = yield call(viewBoxDim.groupAll().valueAsync)

  const groupby = layerSpec.dimensions
    .filter(isSelectorUsable)
    .map((d) => d.value)

  if (geoMeasure?.is_join) {
    groupby.push(`rowid`)
  }

  const sizeSpec = yield call(
    getLinemapSize,
    measures.find((m) => m.name === SIZE),
    sizeRange,
    autoSize,
    sizeDomain,
    groupby.length
  )

  // Applying new props to old charts was dispatched before dispatching createGeoHeatChart, but the state is not updated here
  // Thus, getting updated chart again to retrieve the props
  const updatedChart = yield select(rasterUtils.selectChart(chartId))
  const updatedColor =
    color?.type === "custom" && !color.hasOwnProperty("hideOther")
      ? updatedChart.color
      : color
  const finalColor = yield rasterUtils.getChartColor(updatedColor)

  yield call(LineLayer.setState, {
    data: getLineDataBlock(layerSpec),
    transform: {
      sample: true,
      limit: cap,
      tableSize,
      ...(groupby.length ? { groupby } : {})
    },
    mark: {
      type: "lines",
      lineJoin: "bevel"
    },
    encoding: {
      size: sizeSpec,
      color: getLinemapColor(
        finalColor,
        measures.find((m) => m.name === COLOR),
        densityAccumulatorEnabled,
        opacity,
        legendOpen,
        groupby.length,
        colorDomain,
        legendLocked,
        groupby,
        rasterShowOther === undefined
          ? updatedChart.rasterShowOther
          : rasterShowOther,
        dataSource,
        fullColorHashing
      ),
      geocol,
      geoTable
    },
    // enableHitTesting flag depends not just on popupEnable toggle but also require to have a popup column
    // selection to avoid unnecessary hit testing call to rendering
    enableHitTesting:
      (hoverSelectedColumns.length > 0 || groupby.length > 0) && popupEnabled,
    currentLayer
  })

  handlePopup(
    groupby,
    LineLayer,
    dimensions,
    measures,
    hoverSelectedColumns,
    chartId
  )

  return LineLayer
}

/**
 * updates line layer and legend if applicable in same approach as createLineLayer function
 * @param chartId
 * @param layerName
 * @param layerSpec
 */
export function* handleUpdateLinemapSettings({
  chartId,
  layerName = null,
  layerSpec
}): Generator {
  const { dcFlag, ...chartStateSpec } = yield select(
    rasterUtils.selectChart(chartId)
  )
  const chartSpec = layerSpec ? layerSpec : chartStateSpec
  const dcChart =
    typeof dcFlag === "number" ? Services.get("dc").getChart(dcFlag) : null

  const {
    cap,
    color,
    measures,
    dimensions,
    densityAccumulatorEnabled,
    sizeRange,
    autoSize,
    hoverSelectedColumns = [],
    sizeDomain,
    opacity,
    currentLayer,
    popupEnabled,
    rasterShowOther,
    dataSource,
    fullColorHashing
  } = chartSpec

  if (dcChart && !chartSpec.hasError) {
    const groupby = dimensions.filter(isSelectorUsable).map((d) => d.value)
    const LineLayer = yield call(dcChart.getLayer, layerName || chartSpec.type)
    const geoMeasure = measures.find((d) => d.name === GEO)

    if (geoMeasure?.is_join) {
      groupby.push(`rowid`)
    }
    // Value contains table.column, label is just column
    const geocol = geoMeasure.is_join ? geoMeasure.label : geoMeasure.value

    if (LineLayer) {
      const finalColor = yield rasterUtils.getChartColor(color)
      LineLayer.setState((state) => ({
        ...state,
        data: getLineDataBlock(chartSpec),
        transform: {
          ...state.transform,
          limit: cap,
          groupby
        },
        mark: {
          ...state.mark
        },
        encoding: {
          ...state.encoding,
          color: getLinemapColor(
            finalColor,
            measures.find((d) => d.name === COLOR),
            densityAccumulatorEnabled,
            opacity,
            chartSpec.legendOpen,
            groupby.length,
            rasterUtils.rasterLegendConfig(chartSpec, "colorDomain"),
            rasterUtils.rasterLegendConfig(chartSpec, "legendLocked") || false,
            groupby,
            rasterShowOther,
            dataSource,
            fullColorHashing
          ),
          size: getLinemapSize(
            measures.find((m) => m.name === SIZE),
            sizeRange,
            autoSize,
            sizeDomain,
            groupby.length
          ),
          geocol
        },
        enableHitTesting:
          (hoverSelectedColumns.length > 0 || groupby.length > 0) &&
          popupEnabled,
        currentLayer
      }))

      handlePopup(
        groupby,
        LineLayer,
        dimensions,
        measures,
        hoverSelectedColumns,
        chartId
      )
    }
    yield call(dcChart.renderAsync)
  }
}

function* getSelectorMetaData(action) {
  const { dimensions, measures } = yield select(
    rasterUtils.selectChart(action.chartId)
  )
  const targetMeasure = measures[action.index]

  const { dataSource } = yield select(rasterUtils.selectChart(action.chartId))
  if (isLineGeo(action.selector.type)) {
    try {
      const domain = yield call(
        Services.get("crossfilter").getCrossfilter(
          // This will grab the wrong source if the geo table is a join source
          action.selector.is_join ? dataSource : action.selector.table,
          action.chartId
        ).getPolyGeoDomain,
        action.selector
      )

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
  } else if (isEmpty(dimensions) && targetMeasure.name !== GEO) {
    const domain = yield call(
      Services.get("crossfilter").getCrossfilter(dataSource, action.chartId)
        .getDomain,
      action.selector
    )
    const { ...rest } = action
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

export function* setLinemapMeasure(action) {
  try {
    yield put(ActionTypes.addMeasure(action))

    yield* getSelectorMetaData(action)

    // New measures auto populate as popup columns except geo column
    if (
      !["LINESTRING", "MULTILINESTRING"].includes(action.selector.type) &&
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

    yield* handleUpdateLinemapSettings({
      ...action,
      chartId: action.chartId
    })
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

export function* updateLinemapMeasure({ chartId, index }) {
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
    yield* handleUpdateLinemapSettings({
      chartId
    })
  }
}

export function* handleUpdateLinemapAggTransition(action) {
  const chartSpec = yield select(rasterUtils.selectChart(action.chartId))
  const colorMeasureIndex = chartSpec.measures.findIndex(
    (measure) => measure.name === COLOR
  )

  const colorMeasure = chartSpec.measures.find((m) => m.name === COLOR)

  if (isSelectorUsable(colorMeasure)) {
    yield* setLinemapMeasure({
      ...action,
      index: colorMeasureIndex,
      selector: colorMeasure
    })
  }
}
