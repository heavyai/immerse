// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  adjust,
  compose,
  dissoc,
  has,
  isNil,
  lensIndex,
  lensProp,
  map,
  over,
  set,
  values
} from "ramda"

import * as ActionTypes from "constants/action-types"
import { DESTROY_LINE_CHART } from "charts/line/line-chart-action-creators"
import {
  NONCUSTOM_NUMERICAL_TYPES,
  TEXT_AND_BOOL_TYPES,
  isNumericType,
  isTimeType
} from "constants/data-types"
import {
  CHARTS,
  LINE_STYLES,
  BASE_LINE2_DIMENSIONS,
  BASE_LINE2_MEASURES,
  CHART_TYPES
} from "constants/charts"

import {
  CLEAR_LAST_PALETTE_MAPPING_ID,
  SET_LAST_PALETTE_MAPPING_ID
} from "components/shared-settings/palette-mapping-actions"
import GeoHeatReducer from "charts/raster-chart/geoheat-reducer"
import Line2Reducer from "charts/combo/line-chart2/line2-reducer"
import BarChartReducer from "charts/bar-chart/bar-reducer"
import LineChartReducer from "charts/line/line-chart-reducer"
import RasterChartReducer from "charts/raster-chart/raster-chart-reducer"
import TextReducer from "charts/text/text-reducer"
import TimeLagSettingsReducer from "vega/reducers/time-lag-settings-reducer"
import BinSettingsReducer from "vega/reducers/bin-settings-reducer"
import DataSelectionReducer from "vega/reducers/data-selection-reducer"
import MarkSettingsReducer from "vega/reducers/mark-settings-reducer"
import PresentationSettingsReducer from "vega/reducers/presentation-settings-reducer"
import LegendReducer from "vega/reducers/legend-reducer"
import TopNReducer from "vega/reducers/top-n-reducer"
import VegaDataReducer from "vega/reducers/vega-data-reducer"
import VegaRasterReducer from "vega/reducers/raster-reducer"
import {
  createChartColor,
  customCategoricalColor,
  isBaseDimCategoricalColoringChart
} from "reducers/charts/helpers/color-helpers"
import { getOrdinalOrSolidPalette } from "vega/charts/color-utils"
import {
  getColorDimension,
  getColorDimensionIndex,
  isChartMultiSource
} from "reducers/charts/helpers/multi-source-helpers"
import {
  getNextColorObjectForColorSet,
  getUsedColorSetCountsForChart,
  setChartNextColor
} from "reducers/charts/charts-reducer-helpers"
import { SET_CHART_DATA_ERROR } from "actions/chart-error-state-action-creators"
import {
  Domain,
  ColorDefinition,
  ColorKeysList,
  ChartState,
  MultiSource
} from "./charts-reducer-types"
import {
  CUSTOM_COLORS,
  CHARTS_DEFAULT_COLORS,
  getColors
} from "services/colors"
import { mergeR } from "utils/ramda-helpers"
import createReducer from "utils/redux/create-reducer"
import addDimensionReducer from "./add-dimension-reducer"
import addMeasureReducer from "./add-measure-reducer"
import clearSelectorReducer from "./clear-selector-reducer"
import removeSelectorReducer, {
  restrictedDimensionTypeKey
} from "./remove-selector-reducer"
import swapSelectorsReducer from "./swap-selectors-reducer"
import updateChartReducer from "./update-chart-reducer"
import updateChartTypeReducer from "./update-chart-type-reducer"
import updateSelectorReducer from "./update-selector-reducer"
import errorCheckingReducer from "./error-checking-reducer/error-checking-reducer"
import {
  getBinParams,
  getNumOfBins,
  mergeSavedColorWithColor,
  setCustomColorDefaultOtherDomainAndRange,
  setCustomColorDomainAndRange,
  setCustomColorValue,
  updateMeasure
} from "./charts-reducer-helpers"
import { initialChart } from "reducers/charts/helpers/initialChart"

import ScalesSettingsReducer from "vega/reducers/scales-settings-reducer"
import ChartsAnnotationsReducer from "./charts-annotations-reducer"
import { Dimension } from "../../constants/prop-types"
import { outOfBounds } from "../../utils/helpers"
import { SET_PARAMETER_VALUE } from "../../components/parameters/constants"
import produce from "immer"
import { getLayerById } from "vega/utils/data-selection"
import { clearPaletteMapping } from "components/shared-settings/palette-mapping-helpers"
import { determineColorByValue } from "utils/deterministic-coloring"
import { cloneDeep } from "lodash"

export const initialState = {}

export const RestrictedDimension = {
  Numeric: "Numeric",
  Time: "Time"
}

export function resetRangeFilter(newValues, [min_val, max_val], filters) {
  if (Array.isArray(filters[0])) {
    const min = newValues.currentLowValue || min_val
    const max = newValues.currentHighValue || max_val
    const [[lower, higher]] = filters
    return lower < min || higher > max ? [] : filters
  } else {
    return []
  }
}

export const NumericRestriction = "Numeric"
export const DateTimeRestriction = "Time"
export const computeRestricton = (type: string) => {
  if (isNumericType(type)) {
    return NumericRestriction
  } else if (isTimeType(type)) {
    return DateTimeRestriction
  } else {
    return null
  }
}

const calculateCustomRange = (
  chart: ChartState,
  domain: Domain,
  colorObj: ColorDefinition,
  colorKeys: ColorKeysList
) => {
  const customColorsSet = getColors(CUSTOM_COLORS)
  let customRange = (colorObj && colorObj.customRange) || []
  customRange = customRange.slice(0, domain.length)
  if (
    !isChartMultiSource(chart) &&
    colorObj &&
    !colorObj.customRange &&
    colorObj.val
  ) {
    // Charts are initialized with a non-custom blue color. So, the first time
    // we enter here, we need to pretend that color *is* our custom range,
    // otherwise, getNextColorObjectForColorSet will end up decided that blue
    // is already used and it will pick red as the color of our first measure.
    // The second measure will then end up with blue.
    customRange = [colorObj.val[0]]
  }

  const newColors = []
  while (customRange.length < domain.length) {
    const usedColorCounts = getUsedColorSetCountsForChart(
      chart,
      customColorsSet,
      newColors
    )
    const newColor = getNextColorObjectForColorSet(
      chart,
      customColorsSet,
      colorKeys,
      usedColorCounts
    ).val[0]
    customRange.push(newColor)
    newColors.push(newColor)
  }
  return customRange
}

function addCustomColorDomainReducer(
  charts,
  {
    chartId,
    domain,
    column,
    defaultOtherDomain,
    multiSourceIndex
  }: {
    chartId: number
    domain?: Domain
    column: string
    defaultOtherDomain: Domain
    multiSourceIndex?: string
  }
) {
  const activeChart = charts[chartId]
  if (!activeChart) {
    // can happen if the chart is removed while loading, ex: canceling out
    return charts
  }

  const defaultOtherColor = getColors(CHARTS_DEFAULT_COLORS).custom
    .defaultOtherRange
  const customColorSet = getColors(CUSTOM_COLORS)
  const colorKeys = Object.keys(customColorSet)
  const color = isNil(multiSourceIndex)
    ? activeChart.color
    : activeChart.color[multiSourceIndex]
  const colorDimension = getColorDimension(
    activeChart.dimensions,
    multiSourceIndex
  )
  const hasColorDimension = Boolean(colorDimension && colorDimension.value)

  if (activeChart.type === "line2" && !hasColorDimension) {
    // move blue to top of the list for line2 because line1 default color was blue
    const idx = colorKeys.indexOf(defaultOtherColor)
    colorKeys.splice(0, 0, colorKeys.splice(idx, 1)[0])
  }

  const columnVal = column || activeChart.column
  const defaultOtherRange = color?.defaultOtherRange ?? defaultOtherColor
  const customDomain = domain || activeChart.customDomain
  const { lineStyles } = color || {}

  return over(
    lensProp(String(chartId)),
    compose(
      setCustomColorDefaultOtherDomainAndRange(
        defaultOtherDomain,
        defaultOtherRange,
        multiSourceIndex
      ),
      setCustomColorDomainAndRange(
        columnVal,
        customDomain,
        calculateCustomRange(activeChart, domain, color, colorKeys),
        lineStyles,
        multiSourceIndex
      )
    )
  )(charts)
}

const isQuantitative = (measure) =>
  measure.value !== "*" && Boolean(measure.type in NONCUSTOM_NUMERICAL_TYPES)

const isOrdinal = (measure) =>
  measure.value !== "*" && Boolean(measure.type in TEXT_AND_BOOL_TYPES)

const augmentSelectorsWithMultiSourceIndex = (selectors, multiSourceIndex) =>
  selectors.map((selector) => ({
    ...selector,
    multiSourceIndex
  }))

const removeMultiSourceIndexFromSelectors = (selectors) =>
  selectors.map((selector) => {
    const { multiSourceIndex: _, ...newSelector } = selector
    return newSelector
  })

const filterMultiSourceFromMarkTypes = (
  markTypes,
  measures,
  multiSourceIndex
) =>
  // markTypes may be "sparse", ex: ["line",, "line"] - index 1 is a "hole".
  // filter() will skip holes entirely, removing them from the result. The
  // spread operator will fill holes with undefined to fix the problem.
  markTypes && Array.isArray(markTypes)
    ? [...markTypes].filter(
        (_markType, i) => measures[i].multiSourceIndex !== multiSourceIndex
      )
    : markTypes

const keepOnlyMultiSourceInMarkTypes = (
  markTypes,
  measures,
  multiSourceIndex
) =>
  // markTypes may be "sparse", ex: ["line",, "line"] - index 1 is a "hole".
  // filter() will skip holes entirely, removing them from the result. The
  // spread operator will fill holes with undefined to fix the problem.
  markTypes && Array.isArray(markTypes)
    ? [...markTypes].filter(
        (_markType, i) => measures[i].multiSourceIndex === multiSourceIndex
      )
    : markTypes

const setInitDomainReducer = (
  charts,
  { chartId, domain, dimensionAxisName }
) => {
  const chart = charts[chartId]
  const dimensionIndex = chart.dimensions.findIndex(
    (d) => d.name === dimensionAxisName
  )
  const dimension = chart.dimensions[dimensionIndex]
  dimension.initDomain = domain
  const dimensions = [...chart.dimensions]
  dimensions[dimensionIndex] = dimension
  return {
    ...charts,
    [chartId]: {
      ...chart,
      dimensions
    }
  }
}

const chartReducers = {
  [ActionTypes.REMOVE_COUNT_CHART](state, { key }) {
    return dissoc(key, state)
  },
  [DESTROY_LINE_CHART](state, { chartId }) {
    if (state[chartId]) {
      return {
        ...state,
        [chartId]: {
          ...state[chartId],
          filters: [],
          rangeFilter: []
        }
      }
    } else {
      return state
    }
  },
  [ActionTypes.CREATE_CHART](state, { chartId, dataSource, defaults }) {
    return {
      ...state,
      [chartId]: {
        ...initialChart(defaults),
        ...(dataSource ? { dataSource } : {})
      }
    }
  },

  [ActionTypes.DUPLICATE_CHART](state, { chartId, newChartId }) {
    const oldChart = state[chartId]
    const newChart = {
      ...oldChart,
      copyNumber: oldChart.copyNumber ? oldChart.copyNumber + 1 : 1
    }
    delete newChart.dcFlag
    delete newChart.addon

    return {
      ...state,
      [newChartId]: newChart
    }
  },

  [ActionTypes.DELETE_CHART](state, { chartId }) {
    return dissoc(chartId, state)
  },

  [ActionTypes.CLEAR_CHARTS]() {
    return Object.assign({}, initialState)
  },

  [ActionTypes.CLEAR_CHART_FILTERS](state, { id, filters }) {
    return {
      ...state,
      [id]: {
        ...state[id],
        filters
      }
    }
  },

  [ActionTypes.CLEAR_CHART_FILTERS](state, { id }) {
    return state[id]
      ? compose(
          over(lensProp(id), set(lensProp("filters"), [])),
          over(lensProp(id), set(lensProp("rangeFilter"), [])),
          over(lensProp(id), set(lensProp("areFiltersInverse"), false))
        )(state)
      : state
  },

  [ActionTypes.CLEAR_CHART_FILTERS_FOR_ALL_CHARTS](state) {
    return compose(
      map(set(lensProp("filters"), [])),
      map(set(lensProp("rangeFilter"), [])),
      map(set(lensProp("areFiltersInverse"), false))
    )(state)
  },

  [ActionTypes.SET_SELECTOR_ERROR](state, { chartId, index, selectorType }) {
    return over(
      lensProp(chartId),
      over(
        lensProp(selectorType),
        adjust(set(lensProp("isError"), true), index)
      )
    )(state)
  },

  // These are errors set by ConnectorWithQueue's query methods
  [SET_CHART_DATA_ERROR](state, { chartId, error }) {
    if (!state[chartId]) {
      return state
    }
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataError: error
      }
    }
  },

  [ActionTypes.SET_CHART_HAS_ERROR](state, { chartId, error }) {
    return over(lensProp(chartId), set(lensProp("hasError"), error))(state)
  },

  [ActionTypes.CLEAR_CHART_HAS_ERROR](state, { chartId }) {
    const { hasError: _, ...chartState } = state[chartId]
    return {
      ...state,
      [chartId]: chartState
    }
  },

  [ActionTypes.SET_CHART_DC_FLAG](state, { chartId, dcFlag }) {
    return over(lensProp(chartId), () =>
      Object.assign({}, state[chartId], { dcFlag })
    )(state)
  },
  [ActionTypes.DISCARD_INACTIVE_SELECTORS](state, { chartId }) {
    const chartType = state[chartId].type
    if (chartType === "line2") {
      // Don't discard default dimensions like Color and placeholder measures when turned inactive by multi-measure
      const dimensionNames = CHARTS[state[chartId].type].dimensions.map(
        (d) => d.name
      )
      const dimensions = state[chartId].dimensions.filter(
        (selector) =>
          !selector.inactive || dimensionNames.indexOf(selector.name) >= 0
      )

      return {
        ...state,
        [chartId]: {
          ...state[chartId],
          dimensions
        }
      }
    } else {
      const dimensions = state[chartId].dimensions.filter(
        (selector) => !selector.inactive
      )
      const measures = state[chartId].measures.filter(
        (selector) => !selector.inactive
      )

      return {
        ...state,
        [chartId]: {
          ...state[chartId],
          dimensions,
          measures
        }
      }
    }
  },
  [ActionTypes.ADD_CUSTOM_COLOR_DOMAIN]: addCustomColorDomainReducer,
  [ActionTypes.ADD_CUSTOM_COLOR]: produce(
    (charts, { chartId, value, savedPaletteMapping }) => {
      const activeChart = charts[chartId]
      const colorSet = savedPaletteMapping
        ? cloneDeep(savedPaletteMapping.mapping)
        : activeChart.color

      const paletteColors =
        colorSet?.val ?? colorSet?.palette?.val ?? getOrdinalOrSolidPalette()

      colorSet.customDomain.push(value)
      if (colorSet.customRange) {
        colorSet.customRange.push(determineColorByValue(value, paletteColors))
      }

      if (colorSet.lineStyles) {
        colorSet.lineStyles.push(LINE_STYLES[0])
      }
      // when adding a topN category from custom color widget dropdown,
      // that category now needs to removed from Other category and placed as own category
      colorSet.hideOther =
        colorSet.initialDomain?.length < 10
          ? Boolean(
              colorSet.customDomain.length === colorSet.initialDomain.length
            )
          : false

      colorSet.domainIsDirty = true
      if (savedPaletteMapping) {
        colorSet.lastPaletteMappingId = savedPaletteMapping.id
        colorSet.paletteMappingId = null
      }

      activeChart.savedColors = mergeSavedColorWithColor()(activeChart)
      activeChart.color = colorSet
    }
  ),
  [ActionTypes.ADD_CUSTOM_COLOR_MULTI_SOURCE]: produce(
    (charts, { chartId, value, multiSourceIndex, savedPaletteMapping }) => {
      const activeChart = charts[chartId]
      const multiSourceColor = activeChart.color[multiSourceIndex]
      const colorSet = savedPaletteMapping
        ? cloneDeep(savedPaletteMapping.mapping)
        : multiSourceColor

      colorSet.customDomain.push(value)
      if (colorSet.lineStyles) {
        colorSet.lineStyles.push(LINE_STYLES[0])
      }
      if (colorSet.customRange) {
        colorSet.customRange.push(
          determineColorByValue(value, colorSet.val ?? colorSet.palette.val)
        )
      }
      colorSet.domainIsDirty = true
      if (savedPaletteMapping) {
        colorSet.lastPaletteMappingId = savedPaletteMapping.id
      }
      colorSet.paletteMappingId = null

      activeChart.color[multiSourceIndex] = colorSet

      const { savedColors: newSavedColors } = mergeSavedColorWithColor(
        multiSourceIndex
      )(activeChart)

      activeChart.savedColors = newSavedColors
    }
  ),
  [ActionTypes.REMOVE_CUSTOM_COLOR]: produce(
    (charts, { chartId, index, savedPaletteMapping }) => {
      const activeChart = charts[chartId]
      const colorSet = savedPaletteMapping
        ? cloneDeep(savedPaletteMapping.mapping)
        : activeChart.color

      colorSet.customRange = colorSet.customRange.filter(
        (_: unknown, i: number) => i !== index
      )
      colorSet.customDomain = colorSet.customDomain.filter(
        (_: unknown, i: number) => i !== index
      )
      if (Array.isArray(colorSet.lineStyles)) {
        colorSet.lineStyles = colorSet.lineStyles.filter(
          (_: unknown, i: number) => i !== index
        )
      }
      colorSet.domainIsDirty = true
      if (savedPaletteMapping) {
        colorSet.lastPaletteMappingId = savedPaletteMapping.id
      }
      colorSet.paletteMappingId = null

      // when one of the topN category removed, that category now belongs to Other category
      colorSet.hideOther =
        colorSet.initialDomain && colorSet.initialDomain.length < 10
          ? Boolean(
              colorSet.customDomain.length === colorSet.initialDomain.length
            )
          : false

      activeChart.color = colorSet
      const { savedColors: newSavedColors } = mergeSavedColorWithColor()(
        activeChart
      )
      activeChart.savedColors = newSavedColors
    }
  ),
  [ActionTypes.REMOVE_CUSTOM_COLOR_MULTI_SOURCE]: produce(
    (charts, { chartId, index, multiSourceIndex, savedPaletteMapping }) => {
      const activeChart = charts[chartId]
      const multiSourceColor = activeChart.color[multiSourceIndex]
      const colorSet = savedPaletteMapping
        ? cloneDeep(savedPaletteMapping.mapping)
        : multiSourceColor
      colorSet.customRange = colorSet.customRange.filter(
        (_: unknown, i: number) => i !== index
      )
      colorSet.customDomain = colorSet.customDomain.filter(
        (_: unknown, i: number) => i !== index
      )
      if (Array.isArray(colorSet.lineStyles)) {
        colorSet.lineStyles = colorSet.lineStyles.filter(
          (_: unknown, i: number) => i !== index
        )
      }
      colorSet.domainIsDirty = true
      if (savedPaletteMapping) {
        colorSet.lastPaletteMappingId = savedPaletteMapping.id
      }
      colorSet.paletteMappingId = null
    }
  ),
  [ActionTypes.SET_CUSTOM_COLOR]: produce(
    (
      charts,
      { chartId, value, index, key, multiSourceIndex, savedPaletteMapping }
    ) => {
      let chart = charts[chartId]
      if (savedPaletteMapping?.mapping) {
        if (multiSourceIndex) {
          chart.color[multiSourceIndex] = cloneDeep(savedPaletteMapping.mapping)
        } else {
          chart.color = cloneDeep(savedPaletteMapping.mapping)
        }
      }
      chart = mergeSavedColorWithColor(multiSourceIndex)(chart)

      if (multiSourceIndex) {
        chart.color[multiSourceIndex] = mergeR(
          setCustomColorValue(value, index, key, chart.color[multiSourceIndex])
        )(chart.color[multiSourceIndex])

        if (savedPaletteMapping) {
          chart.color[multiSourceIndex].lastPaletteMappingId =
            savedPaletteMapping.id
        }
      } else {
        chart.color = mergeR(
          setCustomColorValue(value, index, key, chart.color)
        )(chart.color)

        if (savedPaletteMapping) {
          chart.color.lastPaletteMappingId = savedPaletteMapping.id
        }
      }
      charts[chartId] = chart
    }
  ),
  [ActionTypes.SET_CUSTOM_DEFAULT_OTHER_COLOR]: produce(
    (
      state,
      { chartId, value, key, noSave, multiSourceIndex, savedPaletteMapping }
    ) => {
      // Count chart doesn't have color property, no action needed
      let chart = state[chartId]
      if (!chart.color) {
        return
      }

      if (!noSave) {
        state[chartId] = mergeSavedColorWithColor(multiSourceIndex)(chart)
      }
      chart = state[chartId]
      // Copy the mapping to the color property (multisource or not) if its passed in
      if (savedPaletteMapping?.mapping) {
        if (multiSourceIndex) {
          chart.color[multiSourceIndex] = cloneDeep(savedPaletteMapping.mapping)
        } else {
          chart.color = cloneDeep(savedPaletteMapping.mapping)
        }
      }
      if (multiSourceIndex) {
        const multiSourceColor = chart.color[multiSourceIndex]
        multiSourceColor[key] = value
        if (multiSourceColor.paletteMappingId) {
          multiSourceColor.lastPaletteMappingId =
            multiSourceColor.paletteMappingId
        }
        multiSourceColor.paletteMappingId = null
      } else {
        chart.color[key] = value
        if (savedPaletteMapping) {
          chart.color.lastPaletteMappingId = savedPaletteMapping.id
        }
        chart.color.paletteMappingId = null
      }
      state[chartId] = chart
    }
  ),
  [ActionTypes.TOGGLE_OTHER]: (charts, { chartId }) => {
    const activeDimensions = [...charts[chartId].dimensions]
    const colorDimensionIndex = getColorDimensionIndex(activeDimensions)
    activeDimensions[colorDimensionIndex] = {
      ...activeDimensions[colorDimensionIndex],
      showOther: !activeDimensions[colorDimensionIndex].showOther
    }
    return {
      ...charts,
      [chartId]: {
        ...charts[chartId],
        dimensions: [...activeDimensions],
        color: {
          ...charts[chartId].color,
          defaultOtherRange:
            charts[chartId].color.defaultOtherRange ||
            getColors(CHARTS_DEFAULT_COLORS).custom.defaultOtherRange
        },
        showOther: !charts[chartId].showOther
      }
    }
  },
  [ActionTypes.TOGGLE_OTHER_MULTI_SOURCE](
    state,
    { chartId, multiSourceIndex }
  ) {
    const chart = state[chartId]

    const isMulti = !isNil(multiSourceIndex)

    const colorDimensionIndex = getColorDimensionIndex(
      chart.dimensions,
      multiSourceIndex
    )

    const dimensions = over(
      lensIndex(colorDimensionIndex),
      (dimension) => ({
        ...dimension,
        showOther: !dimension.showOther
      }),
      chart.dimensions
    )

    const ensureDefaultOtherRange = (color) =>
      has("defaultOtherRange", color)
        ? color
        : {
            ...color,
            defaultOtherRange: getColors(CHARTS_DEFAULT_COLORS).custom
              .defaultOtherRange
          }

    const color = isMulti
      ? {
          ...chart.color,
          [multiSourceIndex]: ensureDefaultOtherRange(
            chart.color[multiSourceIndex]
          )
        }
      : ensureDefaultOtherRange(chart.color)

    return {
      ...state,
      [chartId]: {
        ...chart,
        dimensions,
        color
      }
    }
  },
  [ActionTypes.TOGGLE_OTHER_RASTER]: produce((charts, { chartId }) => {
    const chart = charts[chartId]
    if (!chart.color.defaultOtherRange) {
      chart.color.defaultOtherRange = getColors(
        CHARTS_DEFAULT_COLORS
      ).custom.defaultOtherRange
    }
    chart.rasterShowOther = !chart.rasterShowOther
  }),
  [ActionTypes.SET_ELASTICX](state, { chartId, value }) {
    return over(lensProp(chartId), set(lensProp("elasticX"), value))(state)
  },
  [ActionTypes.SET_ELASTICY](state, { chartId, value }) {
    return over(lensProp(chartId), set(lensProp("elasticY"), value))(state)
  },
  [ActionTypes.SET_INIT_X_DOMAIN]: setInitDomainReducer,
  [ActionTypes.SET_INIT_Y_DOMAIN]: setInitDomainReducer,
  [ActionTypes.UPDATE_MEASURE_DOMAINS](state, { chartId, ...domains }) {
    const COLOR_MEASURE_INDEX = 3
    const SIZE_MEASURE_INDEX = 2

    return Object.keys({ ...domains }).reduce((accumState, key) => {
      const domain = { ...domains }[key]
      if (domain) {
        if (key === "color") {
          const colorMeasure = state[chartId].measures[COLOR_MEASURE_INDEX]
          if (isOrdinal(colorMeasure)) {
            return compose(
              updateMeasure(
                chartId,
                COLOR_MEASURE_INDEX,
                mergeR({ categories: domain })
              ),
              (s) =>
                addCustomColorDomainReducer(s, {
                  chartId,
                  domain,
                  column: colorMeasure.value,
                  defaultOtherDomain: "Default"
                })
            )(accumState)
          } else if (isQuantitative(colorMeasure)) {
            return updateMeasure(
              chartId,
              COLOR_MEASURE_INDEX,
              mergeR({ minMax: domain })
            )(accumState)
          } else {
            return accumState
          }
        } else if (key === "size") {
          return updateMeasure(
            chartId,
            SIZE_MEASURE_INDEX,
            mergeR({ minMax: domain })
          )(accumState)
        } else {
          return accumState
        }
      } else {
        return accumState
      }
    }, state)
  },
  [ActionTypes.TOGGLE_PERCENTAGE_VIEW](state, { chartId, shouldBeOn }) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        percentageViewEnabled: shouldBeOn
      }
    }
  },
  [ActionTypes.UPDATE_BIN_PARAMS](
    state,
    {
      chartId,
      minMaxValues,
      cardinality,
      selectorIndex,
      dimension,
      chartType,
      elasticX,
      elasticY
    }
  ) {
    const binParams = getBinParams(
      minMaxValues,
      cardinality,
      chartType,
      dimension.type
    )
    if (chartType === CHART_TYPES.HEAT && dimension.isBinned) {
      binParams.isBinned = dimension.isBinned
    }
    const numOfBins = getNumOfBins(dimension.type, chartType)
    const setter = (selector: Dimension) => {
      const newSelector =
        chartType === CHART_TYPES.HEAT && selector.newHeatMapDimension
          ? {
              ...selector,
              ...binParams,
              minMax: [binParams.min_val, binParams.max_val],
              initDomain: [binParams.min_val, binParams.max_val]
            }
          : { ...selector, ...binParams }
      delete newSelector.newHeatMapDimension
      return {
        ...newSelector,
        ...{
          numOfBins:
            chartType === CHART_TYPES.HEAT &&
            selector.timeBin !== "auto" &&
            (selector.numOfBins || selector.numOfBins === 0)
              ? selector.numOfBins
              : numOfBins,
          loading: false,
          inactive: false
        }
      }
    }

    return updateSelectorReducer(state, {
      chartId,
      selectorType: "dimensions",
      trueIndex: selectorIndex,
      setter,
      multiSourceIndex: dimension.multiSourceIndex,
      elasticX,
      elasticY
    })
  },
  [ActionTypes.SET_BASEMAP](state, { chartId, value }) {
    return over(lensProp(chartId), set(lensProp("basemap"), value))(state)
  },
  [ActionTypes.UPDATE_CHART]: updateChartReducer,
  [ActionTypes.UPDATE_CHART_COLORS](state, { chartId }) {
    return setChartNextColor(chartId)(state)
  },
  [ActionTypes.ADD_DIMENSION]: addDimensionReducer,
  [ActionTypes.ADD_MEASURE]: addMeasureReducer,
  [ActionTypes.REMOVE_SELECTOR]: removeSelectorReducer,
  [ActionTypes.CLEAR_SELECTOR]: clearSelectorReducer,
  [ActionTypes.UPDATE_SELECTOR]: updateSelectorReducer,
  [ActionTypes.UPDATE_CHART_TYPE]: updateChartTypeReducer,
  [ActionTypes.SET_CHART_STATE](state, { chartId, payload }) {
    return {
      ...state,
      [chartId]: {
        ...payload
      }
    }
  },
  [ActionTypes.SWAP_SELECTORS]: swapSelectorsReducer,
  [ActionTypes.SET_DIMENSION_EXTENTS_SET]: (state, extentsSet: boolean) => ({
    ...state,
    extentsSet
  }),
  // This action generally gets fired on a chart's initial load, as well as
  // during refresh events (when the user clicks the "refresh" button or when
  // the dashboard is set to refresh periodically)
  [ActionTypes.UPDATE_CHART_BIN_EXTENT](
    state,
    {
      chartId,
      index,
      min_val,
      max_val,
      currentLowValue: newCurrentLowValue,
      currentHighValue: newCurrentHighValue
    }
  ) {
    const chart = state[chartId]
    const dimensions = [...chart.dimensions]
    const dimension = dimensions[index]
    const { LINE, LINE2, HEAT, HISTOGRAM } = CHART_TYPES
    const isCoordinate = [LINE, HISTOGRAM, LINE2, HEAT].includes(chart.type)
    const {
      currentLowValue: prevCurrentLowValue,
      currentHighValue: prevCurrentHighValue
    } = dimension

    // If a chart is a coordinate type (line, histogram, combo) and has
    // a fixed x-axis, then keep the currentLow/High values the same (assuming
    // they're valid dates). Otherwise, update
    //
    // but, only set combo's currentLowValue/currentHighValue to the
    // filtered min/max. Set everything else to the min_val/max_val as before.
    // prevCurrent, newCurrent, nextCurrent?
    const nextLowValue =
      [CHART_TYPES.LINE2, CHART_TYPES.HEAT].includes(chart.type) &&
      !outOfBounds(min_val, newCurrentLowValue, newCurrentHighValue)
        ? newCurrentLowValue
        : min_val
    const nextHighValue =
      [CHART_TYPES.LINE2, CHART_TYPES.HEAT].includes(chart.type) &&
      !outOfBounds(max_val, newCurrentLowValue, newCurrentHighValue)
        ? newCurrentHighValue
        : max_val
    dimensions[index] = {
      ...dimension,
      min_val,
      max_val,
      currentLowValue:
        (isCoordinate && !chart.elasticX) ||
        (!isCoordinate && dimension.extentsSet === false)
          ? prevCurrentLowValue
          : nextLowValue,
      currentHighValue:
        (isCoordinate && !chart.elasticX) ||
        (!isCoordinate && dimension.extentsSet === false)
          ? prevCurrentHighValue
          : nextHighValue
    }

    return {
      ...state,
      [chartId]: {
        ...chart,
        dimensions,
        filters: isCoordinate
          ? resetRangeFilter(
              dimensions[index],
              [min_val, max_val],
              chart.filters
            )
          : []
      }
    }
  },
  [ActionTypes.ENTER_MULTI_SOURCE_MODE](state, { chartId }) {
    const chart = state[chartId] || {}
    const currentSingleDataSource = chart.dataSource || null
    const initialMultiSourceIndex = 0
    const nextMultiSourceIndex = initialMultiSourceIndex + 1

    const currentRestriction =
      currentSingleDataSource && !isNil(chart.dimensions[0].type)
        ? computeRestricton(chart.dimensions[0].type)
        : chart[restrictedDimensionTypeKey]
    const multiSources = {
      [initialMultiSourceIndex]: {
        table: currentSingleDataSource,
        index: initialMultiSourceIndex
      },
      [nextMultiSourceIndex]: {
        table: null,
        index: nextMultiSourceIndex
      }
    }

    const dimensions = [
      ...augmentSelectorsWithMultiSourceIndex(
        chart.dimensions,
        initialMultiSourceIndex
      ),
      ...augmentSelectorsWithMultiSourceIndex(
        BASE_LINE2_DIMENSIONS,
        nextMultiSourceIndex
      )
    ]

    const measures = [
      ...augmentSelectorsWithMultiSourceIndex(
        chart.measures,
        initialMultiSourceIndex
      ),
      ...augmentSelectorsWithMultiSourceIndex(
        BASE_LINE2_MEASURES,
        nextMultiSourceIndex
      )
    ]

    const color = {
      [initialMultiSourceIndex]: chart.color,
      [nextMultiSourceIndex]: createChartColor(chart, chart.type, true)
    }

    const savedColors = {
      [initialMultiSourceIndex]: chart.savedColors,
      [nextMultiSourceIndex]: {}
    }

    return {
      ...state,
      [chartId]: {
        ...chart,
        dataSource: null,
        multiSources,
        dimensions,
        measures,
        color,
        savedColors,
        percentageViewEnabled: false,
        [restrictedDimensionTypeKey]: currentRestriction
      }
    }
  },
  [ActionTypes.ADD_MULTI_SOURCE](state, { chartId, multiSourceIndex }) {
    const chart = state[chartId] || {}
    const currentMultiSources = chart.multiSources || {}

    const multiSources = {
      ...currentMultiSources,
      [multiSourceIndex]: {
        table: null,
        index: multiSourceIndex
      }
    }

    const dimensions = [
      ...chart.dimensions,
      ...augmentSelectorsWithMultiSourceIndex(
        BASE_LINE2_DIMENSIONS,
        multiSourceIndex
      )
    ]

    const measures = [
      ...chart.measures,
      ...augmentSelectorsWithMultiSourceIndex(
        BASE_LINE2_MEASURES,
        multiSourceIndex
      )
    ]

    const color = {
      ...chart.color,
      [multiSourceIndex]: createChartColor(chart, chart.type)
    }

    const savedColors = {
      ...chart.savedColors,
      [multiSourceIndex]: {}
    }

    return {
      ...state,
      [chartId]: {
        ...chart,
        multiSources,
        dimensions,
        measures,
        color,
        savedColors
      }
    }
  },
  [ActionTypes.DELETE_MULTI_SOURCE](state, { chartId, multiSourceIndex }) {
    const chart = state[chartId] || {}
    const multiSources = dissoc(multiSourceIndex)(chart.multiSources)
    const noMultiSources = values(multiSources).length === 0

    const dimensions = noMultiSources
      ? [...BASE_LINE2_DIMENSIONS]
      : chart.dimensions.filter(
          (dimension) => dimension.multiSourceIndex !== multiSourceIndex
        )

    const measures = noMultiSources
      ? [...BASE_LINE2_MEASURES]
      : chart.measures.filter(
          (measure) => measure.multiSourceIndex !== multiSourceIndex
        )

    const color = chart.color
      ? {
          ...chart.color,
          [multiSourceIndex]: {}
        }
      : chart.color

    const savedColors = chart.savedColors
      ? {
          ...chart.savedColors,
          [multiSourceIndex]: {}
        }
      : chart.savedColors

    const markTypes = filterMultiSourceFromMarkTypes(
      chart.markTypes,
      chart.measures,
      multiSourceIndex
    )

    const filterString = chart.filterString
      ? {
          ...chart.filterString,
          [multiSourceIndex]: ""
        }
      : chart.filterString

    const data = chart.data
      ? {
          ...chart.data,
          [multiSourceIndex]: []
        }
      : chart.data

    return {
      ...state,
      [chartId]: {
        ...chart,
        multiSources,
        dimensions,
        measures,
        color,
        savedColors,
        markTypes,
        filterString,
        data,
        [restrictedDimensionTypeKey]: noMultiSources
          ? null
          : chart[restrictedDimensionTypeKey]
      }
    }
  },
  [ActionTypes.CLEAR_MULTI_SOURCE](state, { chartId, multiSourceIndex }) {
    const chart = state[chartId] || {}

    const dimensions = [
      ...chart.dimensions.filter(
        (dimension) => dimension.multiSourceIndex !== multiSourceIndex
      ),
      ...augmentSelectorsWithMultiSourceIndex(
        BASE_LINE2_DIMENSIONS,
        multiSourceIndex
      )
    ]

    const measures = [
      ...chart.measures.filter(
        (measure) => measure.multiSourceIndex !== multiSourceIndex
      ),
      ...augmentSelectorsWithMultiSourceIndex(
        BASE_LINE2_MEASURES,
        multiSourceIndex
      )
    ]

    const color = {
      ...chart.color,
      [multiSourceIndex]: createChartColor(chart, chart.type)
    }

    const savedColors = {
      ...chart.savedColors,
      [multiSourceIndex]: {}
    }

    const markTypes = filterMultiSourceFromMarkTypes(
      chart.markTypes,
      chart.measures,
      multiSourceIndex
    )

    const filterString = chart.filterString
      ? {
          ...chart.filterString,
          [multiSourceIndex]: ""
        }
      : chart.filterString

    return {
      ...state,
      [chartId]: {
        ...chart,
        dimensions,
        measures,
        color,
        savedColors,
        markTypes,
        filterString
      }
    }
  },
  [ActionTypes.LEAVE_MULTI_SOURCE_MODE](state, { chartId, keepSourceIndex }) {
    const chart = state[chartId] || {}
    const dataSources: MultiSource[] = Object.values(chart.multiSources)
    const keepDataSource = dataSources.find((s) => s.index === keepSourceIndex)
    const dataSource = keepDataSource && keepDataSource.table
    const multiSources = {}

    const dimensions = removeMultiSourceIndexFromSelectors(
      chart.dimensions.filter(
        (dimension) => dimension.multiSourceIndex === keepSourceIndex
      )
    )

    const measures = removeMultiSourceIndexFromSelectors(
      chart.measures.filter(
        (measure) => measure.multiSourceIndex === keepSourceIndex
      )
    )

    const color = chart.color[keepSourceIndex]
    const savedColors = chart.savedColors[keepSourceIndex]

    const markTypes = keepOnlyMultiSourceInMarkTypes(
      chart.markTypes,
      chart.measures,
      keepSourceIndex
    )

    const filterString = chart.filterString
      ? {
          0: chart.filterString[keepSourceIndex]
        }
      : chart.filterString

    const data = chart.data
      ? {
          0: chart.data[keepSourceIndex]
        }
      : chart.data

    return {
      ...state,
      [chartId]: {
        ...chart,
        dataSource,
        multiSources,
        dimensions,
        measures,
        color,
        savedColors,
        markTypes,
        filterString,
        data
      }
    }
  },
  [ActionTypes.TOGGLE_CHART_LEGEND](state, { chartId }) {
    const chart = state[chartId] || {}
    // chart.legendCollapsed has a good chance of being `undefined`, which will be coerced to
    // `false` here (i.e. default to being uncollapsed), then flipped to collapsed with the `!`.
    const legendCollapsed = !chart.legendCollapsed

    return {
      ...state,
      [chartId]: {
        ...chart,
        legendCollapsed
      }
    }
  },
  [ActionTypes.HIGHLIGHT_CHARTS](state, { payload: chartIds }) {
    const isHighlighted = new Set(chartIds)
    return Object.keys(state).reduce((newState, chartId) => {
      if (isHighlighted.has(chartId)) {
        newState[chartId] = { ...state[chartId], highlighted: true }
      } else {
        newState[chartId] = state[chartId]
      }
      return newState
    }, {})
  },
  [ActionTypes.DEHIGHLIGHT_CHARTS](state, { payload: chartIds }) {
    const isHighlighted = new Set(chartIds)
    return Object.keys(state).reduce((newState, chartId) => {
      if (isHighlighted.has(chartId)) {
        newState[chartId] = { ...state[chartId], highlighted: false }
      } else {
        newState[chartId] = state[chartId]
      }
      return newState
    }, {})
  },
  [ActionTypes.TOGGLE_QUICK_FILTERS_EXPANDED](state, { chartId }) {
    const quickFiltersExpanded =
      typeof state[chartId].quickFiltersExpanded === "boolean"
        ? !state[chartId].quickFiltersExpanded
        : false
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        quickFiltersExpanded
      }
    }
  },
  [ActionTypes.UPDATE_HIDE_OTHER](charts, { chartId, value, layerId }) {
    const chart = {
      ...charts[chartId]
    }
    // hideOther is used to handle availability of Other option in color widget and legend on the map for categorical color
    if (chart.layers?.length > 1 && typeof layerId === "number") {
      const color = {
        ...chart.layers[layerId].color
      }
      color.hideOther = value
      return {
        ...charts,
        [chartId]: {
          ...chart,
          layers: adjust((l) => ({ ...l, color }), layerId, chart.layers)
        }
      }
    } else {
      const colorSet = {
        ...chart.color
      }

      colorSet.hideOther = value

      const resultChart = {
        ...chart,
        color: {
          ...colorSet
        }
      }
      return {
        ...charts,
        [chartId]: resultChart
      }
    }
  },
  [ActionTypes.CLEAR_SAVED_COLORS_BY_DIMENSION](
    charts,
    { chartId, dimension }
  ) {
    const savedColorKey = `custom_${dimension}`
    const newSavedColors = { ...charts[chartId].savedColors }
    delete newSavedColors[savedColorKey]

    return {
      ...charts,
      [chartId]: {
        ...charts[chartId],
        savedColors: newSavedColors
      }
    }
  },

  [SET_PARAMETER_VALUE](charts, { payload }) {
    const { name } = payload
    const newCharts = { ...charts }

    Object.keys(newCharts).forEach((id) => {
      newCharts[id] = { ...charts[id] }

      // It's possible that a custom dimension parameter's current data type has changed.
      // Binning recalculation happens a bit down the line, so attempt to
      // prevent firing off any bad queries until then.
      if (charts[id].dimensions) {
        newCharts[id].dimensions = charts[id]?.dimensions?.map((d) => {
          return (d.sharedCustom || d.globalCustom) && d.value === `\${${name}}`
            ? { ...d, isBinnable: false, isBinned: false }
            : d
        })
      }
    })

    return newCharts
  },

  [ActionTypes.INITIALIZE_COLOR_RAMPS](state, { chartId, colorRamps }) {
    const chart = state[chartId] || {}
    return {
      ...state,
      [chartId]: {
        ...chart,
        colorRamps
      }
    }
  },

  [ActionTypes.UPDATE_COLOR_RAMPS](state, { chartId, position, newBounds }) {
    const chart = state[chartId] || {}
    const newColorRamps = [...chart.colorRamps]

    newColorRamps[position] = newBounds
    if (newColorRamps[position - 1]) {
      newColorRamps[position - 1][1] = newBounds[0]
    }
    // check to see if in second-to-last array, if so automatically fill in the last one
    if (position + 2 === newColorRamps.length) {
      newColorRamps[position + 1] = [newBounds[1], "max"]
    }

    return {
      ...state,
      [chartId]: {
        ...chart,
        colorRamps: newColorRamps
      }
    }
  },
  [ActionTypes.APPLY_SAVED_PALETTE_MAPPING]: produce(
    (state, { chartId, paletteMapping, layerId, isMeasure }) => {
      const chart = state[chartId]

      if (
        [CHART_TYPES.VEGA_COMBO, CHART_TYPES.BOX_PLOT].includes(chart.type) &&
        layerId
      ) {
        const layer = chart.dataSelections.find((ds) => ds.layerId === layerId)
        if (isMeasure) {
          layer.measures.color.paletteMappingId = paletteMapping.id
        } else if (layer.dimensions.color) {
          layer.dimensions.color.paletteMappingId = paletteMapping.id
        } else {
          // if we have a box plot with no color by dim and no color measure,
          // it is being colored by base dim, so apply pmId directly to layer obj
          layer.paletteMappingId = paletteMapping.id
        }
      } else {
        // For raster charts this is the index of the layer to update
        if (chart.layers && layerId >= 0) {
          chart.layers[layerId].color = {
            paletteMappingId: paletteMapping.id
          }
        }
        chart.color = {
          paletteMappingId: paletteMapping.id
        }
      }
    }
  ),
  [ActionTypes.CLEAR_PALETTE_MAPPING]: produce(
    (state, { chartId, layerId, isMeasure }) => {
      const chart = state[chartId]
      clearPaletteMapping({ chart, layerId, isMeasure })
    }
  ),
  [ActionTypes.REMOVE_CUSTOM_DOMAIN_RANGE]: produce((state, { chartId }) => {
    const chart = state[chartId]
    chart.color.customDomain = null
    chart.color.customRange = null
    if (chart?.savedColors?.ordinal?.customDomain) {
      chart.savedColors.ordinal.customDomain = null
    }
    if (chart?.savedColors?.ordinal?.customRange) {
      chart.savedColors.ordinal.customRange = null
    }
  }),
  [SET_LAST_PALETTE_MAPPING_ID]: produce((state, action) => {
    const { chartId, layerId, paletteMappingId, isMeasure } = action
    const chart = state[chartId]
    if ([CHART_TYPES.VEGA_COMBO, CHART_TYPES.BOX_PLOT].includes(chart.type)) {
      const layer = getLayerById(chart.dataSelections, layerId)
      if (!layer) {
        // eslint-disable-next-line no-console
        console.warn(`Layer not found: ${layerId}, for chart id: ${chartId}`)
        return
      }
      if (isMeasure && layer.measures.color) {
        layer.measures.color.lastPaletteMappingId = paletteMappingId
      } else if (layer.dimensions.color) {
        layer.dimensions.color.lastPaletteMappingId = paletteMappingId
      } else if (isBaseDimCategoricalColoringChart(chart.type)) {
        layer.lastPaletteMappingId = paletteMappingId
      }
    } else {
      if (chart.layers && chart.currentLayer) {
        const currentLayer = chart.layers[chart.currentLayer]
        currentLayer.color.lastPaletteMappingId = paletteMappingId
      }
      chart.color.lastPaletteMappingId = paletteMappingId
    }
  }),
  [CLEAR_LAST_PALETTE_MAPPING_ID]: produce((state, action) => {
    const { chartId, layerId, isMeasure = false } = action
    const chart = state[chartId]
    if ([CHART_TYPES.VEGA_COMBO, CHART_TYPES.BOX_PLOT].includes(chart.type)) {
      const layer = getLayerById(chart.dataSelections, layerId)
      if (!layer) {
        // eslint-disable-next-line no-console
        console.warn(`Layer not found: ${layerId}, for chart id: ${chartId}`)
        return
      }
      if (isMeasure && layer.measures.color) {
        layer.measures.color.lastPaletteMappingId = null
      } else if (layer.dimensions.color) {
        layer.dimensions.color.lastPaletteMappingId = null
      } else if (isBaseDimCategoricalColoringChart(chart.type)) {
        layer.lastPaletteMappingId = null
      }
    } else {
      chart.layers?.forEach((layer) => {
        layer.color.lastPaletteMappingId = null
      })
      chart.color.lastPaletteMappingId = null
    }
  }),
  [ActionTypes.UPDATE_D3_CHART_COLOR_PALETTE]: produce(
    (state, { chartId, color, chartColor }) => {
      const chart = state[chartId]
      const dimension = chart?.dimensions[0]
      chart.color = {
        ...customCategoricalColor({
          value: dimension.value,
          categories: chartColor.customDomain,
          type: dimension.type,
          hideOther: chartColor.hideOther,
          initMinMax: chartColor.initialDomain,
          color
        }),
        lastPaletteMappingId: chartColor.lastPaletteMappingId
      }
    }
  ),
  [ActionTypes.CLEAR_D3_CHART_COLOR]: produce((state, { chartId }) => {
    const chart = state[chartId]
    chart.color = {}
  })
}

export default createReducer(
  Object.assign(
    {},
    chartReducers,
    LineChartReducer,
    RasterChartReducer,
    TextReducer,
    GeoHeatReducer,
    Line2Reducer,
    BarChartReducer,
    TimeLagSettingsReducer,
    BinSettingsReducer,
    DataSelectionReducer,
    MarkSettingsReducer,
    PresentationSettingsReducer,
    LegendReducer,
    TopNReducer,
    VegaDataReducer,
    VegaRasterReducer,
    ScalesSettingsReducer,
    ChartsAnnotationsReducer
  ),
  initialState,
  errorCheckingReducer
)
