// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  ALWAYS_BINNED_TYPES,
  DIFF_TO_AUTOBIN,
  NONCUSTOM_NUMERICAL_TYPES,
  NUM_BINS_FOR_HEATMAP,
  NUM_BINS_FOR_NOT_TIME,
  NUM_BINS_FOR_TIME,
  TEXT_AND_BOOL_TYPES,
  TIME_UNITS
} from "constants/data-types"
import { CHART_TYPES, CHARTS, LINE_STYLES } from "constants/charts"
import {
  compose,
  cond,
  curry,
  identity,
  ifElse,
  isNil,
  lensIndex,
  lensPath,
  lensProp,
  over,
  set,
  view
} from "ramda"
import { mergeR } from "utils/ramda-helpers"
import { MAX_BIN_SIZE } from "constants/magic-variables"
import {
  CHARTS_DEFAULT_COLORS,
  MEASURE_DEFAULT_COLORS,
  getColors,
  CUSTOM_COLORS
} from "services/colors"
import {
  getColorDimension,
  isChartMultiSource
} from "./helpers/multi-source-helpers"
import {
  ChartState,
  ColorHexList,
  ColorKey,
  ColorKeysList
} from "./charts-reducer-types"
import { percentageEnabledForPieMeasure } from "charts/pie/pie-chart"
import { getOrdinalOrSolidPalette } from "vega/charts/color-utils"

export const updateChart = curry((id, key, setter) =>
  over(lensPath([id, key]), setter)
)

export const setChart = curry((id, key, value) =>
  set(lensPath([id, key]), value)
)

export function updateMeasures(id, setter) {
  return updateChart(id, "measures", setter)
}

export function updateDimensions(id, setter) {
  return updateChart(id, "dimensions", setter)
}

export function updateMeasure(id, index, setter) {
  return updateMeasures(id, over(lensIndex(index), setter))
}

export function updatePostFilters(id, setter) {
  return updateChart(id, "postFilters", setter)
}

export function setMeasure(id, index, value) {
  return updateMeasures(id, set(lensIndex(index), value))
}

export function updateDimension(id, index, setter) {
  return updateDimensions(id, over(lensIndex(index), setter))
}

export function setDimension(id, index, value) {
  return updateDimensions(id, set(lensIndex(index), value))
}

export function setChartColor(chartId, value) {
  return setChart(chartId, "color", value)
}

export function removeColor(id) {
  return setChartColor(id, null)
}

export function resetColorDomain(id) {
  return setChart(id, "colorDomain", null)
}

export function maybeResetColorDomain(chartId, selectorType, index) {
  return (charts) =>
    ifElse(
      () =>
        selectorType === "measures" &&
        charts[chartId].measures[index].name === "color",
      resetColorDomain(chartId),
      identity
    )(charts)
}

export function maybeResetColorByDimension(chartId) {
  return (charts) => {
    const chart = charts[chartId]
    const hasColorMeasure = chart.measures.some(
      (measure) => measure.name === "color" && measure.value
    )
    // If the user selected "color by dimension" (in the color palette)
    // and then they decide to add a color measure, the color measure should
    // take precedence - and the colorByDimension should be cleared.
    if (chart.colorByDimension && hasColorMeasure) {
      return {
        ...charts,
        [chartId]: {
          ...chart,
          colorByDimension: null,
          color: {
            ...chart.color,
            isCustom: false
          }
        }
      }
    }
    return charts
  }
}

export function addSelector(selector, index) {
  return compose(set(lensProp("originIndex"), index), mergeR(selector))
}

export function maybeOffsetSorting(
  incOrDec,
  index,
  selType,
  chartId,
  { type, sortColumn, dimensions }
) {
  if (type === "table" && sortColumn) {
    const updateName = (name) =>
      name.substr(0, name.length - 1) + incOrDec(Number(name[name.length - 1]))

    if (selType === "dimensions" && index <= sortColumn.index) {
      if (sortColumn.col.name.includes("col")) {
        return over(lensPath([chartId, "sortColumn", "index"]), incOrDec)
      } else {
        return compose(
          over(lensPath([chartId, "sortColumn", "col", "name"]), updateName),
          over(lensPath([chartId, "sortColumn", "index"]), incOrDec)
        )
      }
    } else if (
      selType === "measures" &&
      index + dimensions.length <= sortColumn.index
    ) {
      return compose(
        over(lensPath([chartId, "sortColumn", "col", "name"]), updateName),
        over(lensPath([chartId, "sortColumn", "index"]), incOrDec)
      )
    }
  }

  return identity
}

const getLastSelector = (selectors, multiSourceIndex) => {
  if (isNil(multiSourceIndex)) {
    return selectors[selectors.length - 1]
  } else {
    const selectorsForSource = selectors.filter(
      (selector) => selector.multiSourceIndex === multiSourceIndex
    )
    return selectorsForSource[selectorsForSource.length - 1]
  }
}

export function maybeAddEmptySelector(
  selectorType,
  chartId,
  chartType,
  multiSourceIndex
) {
  const MAX = {
    dimensions: CHARTS[chartType || "table"].maxDimensions,
    measures: CHARTS[chartType || "table"].maxMeasures
  }

  const max = MAX[selectorType]
  const selectorPrototype = {
    ...CHARTS[chartType || "table"][`${selectorType}_proto`],
    ...(!isNil(multiSourceIndex) && { multiSourceIndex })
  }

  return updateChart(chartId, selectorType, (selectors) => {
    const lastSelector = getLastSelector(selectors, multiSourceIndex)

    const lastSelectorValue = lastSelector.value
    const lastSelectorCustom = lastSelector.custom
    return max === Infinity && (lastSelectorValue || lastSelectorCustom)
      ? [...selectors, ...[selectorPrototype]]
      : selectors
  })
}

export function isLineAndColorDimension(chart) {
  return (
    (chart.type === "line" || chart.type === "line2") &&
    Boolean(chart.dimensions[1] && chart.dimensions[1].value)
  )
}

export function isBarAndColorDimension(chart) {
  return (
    chart.type === "bar" &&
    Boolean(chart.dimensions[1] && chart.dimensions[1].value)
  )
}

export function getColorType(chart) {
  const colorMeasure = chart.measures.filter(
    (measure) => measure.name === "color" && measure.value
  )[0]

  if (isLineAndColorDimension(chart) || isBarAndColorDimension(chart)) {
    return `custom_${chart.dimensions[1].value}`
  } else if (colorMeasure) {
    return selectorColorType(colorMeasure)
  } else if (
    chart.color &&
    chart.color.type !== "none" &&
    chart.color.type !== "quantitative"
  ) {
    return chart.color.type
  } else {
    return getColors(CHARTS_DEFAULT_COLORS)[chart.type].type
  }
}

function getDefaultColor(chart) {
  const colorType = getColorType(chart)
  const colorMeasure = chart.measures.filter(
    (measure) => measure.name === "color" && measure.value
  )[0]

  if (
    [CHART_TYPES.PIE, CHART_TYPES.SCATTER].includes(chart.type) &&
    colorType === "ordinal"
  ) {
    const key = getColors(CHARTS_DEFAULT_COLORS)[chart.type]?.key
    return {
      type: "ordinal",
      val: getOrdinalOrSolidPalette(key)
    }
  } else {
    return colorMeasure
      ? getColors(MEASURE_DEFAULT_COLORS)[colorType]
      : getColors(CHARTS_DEFAULT_COLORS)[chart.type]
  }
}

export const colorKeyToHexMapInvert = (keyToHexMap) =>
  Object.keys(keyToHexMap).reduce(
    (map, k) => ({
      ...map,
      [keyToHexMap[k]]: k
    }),
    {}
  )

export const getColorHexsUsedInChart = (chart: ChartState) =>
  chart.multiSources && Object.keys(chart.multiSources).length
    ? Object.keys(chart.color)
        .filter((msi) => chart.color[msi].isCustom)
        .reduce((colorHexs, msi) => {
          const colorObj = chart.color[msi]
          const colorsUsedInSource = colorObj.customRange || colorObj.val || []
          return [...colorHexs, ...colorsUsedInSource]
        }, [])
    : chart.color.customRange || chart.color.val || []

export const getUsedColorSetCountsForChart = (
  chart: ChartState,
  colorSet: Record<string, any>,
  addlUsedHexs: ColorHexList = []
) => {
  const colorHexsToKeysMap = colorKeyToHexMapInvert(colorSet)
  const usedColorHexs: ColorHexList = [
    ...getColorHexsUsedInChart(chart),
    ...addlUsedHexs
  ]
  const usedColorKeys = usedColorHexs.map((hex) => colorHexsToKeysMap[hex])
  return usedColorHexs.reduce(
    (colorCounts, hex) => {
      const colorKey = colorHexsToKeysMap[hex]
      const colorCount = (colorCounts[colorKey] || 0) + 1
      return {
        ...colorCounts,
        [colorKey]: colorCount,
        maxColorCount:
          colorCount >= colorCounts.maxColorCount
            ? colorCount
            : colorCounts.maxColorCount,
        maxColor:
          colorCount >= colorCounts.maxColorCount
            ? colorKey
            : colorCounts.maxColor,
        usedColorHexs,
        usedColorKeys
      }
    },
    {
      maxColor: null,
      maxColorCount: 0,
      usedColorHexs: [],
      usedColorKeys: []
    }
  )
}

export const getUnusedColorKeysFromSet = (
  colorSetKeys: ColorKeysList,
  usedColorKeys: ColorKeysList
) => colorSetKeys.filter((colorKey) => !usedColorKeys.includes(colorKey))

export const getNextLeastUsedColorSetKeysIndex = (
  colorSetKeys: ColorKeysList,
  maxColor: ColorKey
) => {
  const maxColorKeyIndex = colorSetKeys.indexOf(maxColor)
  const isLastColorKeyIndex = maxColorKeyIndex === colorSetKeys.length - 1
  return isLastColorKeyIndex ? 0 : maxColorKeyIndex + 1
}

export const getNextColorObjectForColorSet = (
  chart: ChartState,
  colorSet: Record<string, any>,
  colorSetKeys: ColorKeysList = Object.keys(colorSet),
  usedColorCounts: Record<string, any> = getUsedColorSetCountsForChart(
    chart,
    colorSet
  )
) => {
  const notAllColorKeysUsed =
    usedColorCounts.usedColorHexs.length < colorSetKeys.length
  const newColorKey = notAllColorKeysUsed
    ? getUnusedColorKeysFromSet(colorSetKeys, usedColorCounts.usedColorKeys)[0]
    : colorSetKeys[
        getNextLeastUsedColorSetKeysIndex(
          colorSetKeys,
          usedColorCounts.maxColor
        )
      ]
  return {
    type: "solid",
    key: newColorKey,
    val: colorSet[newColorKey]
  }
}

export const resetCustomColors = (id: string) => (state) => ({
  ...state,
  [id]: {
    ...state[id],
    color: {
      ...state[id].color,
      customDomain: [],
      isCustom: false
    }
  }
})

export const clearColorByDimension = (id) => (state) => {
  const newChartState = { ...state[id] }
  delete newChartState.colorByDimension
  return {
    ...state,
    [id]: newChartState
  }
}

export function setChartNextColor(id, multiSourceIndex) {
  const multi = !isNil(multiSourceIndex)

  return (charts) => {
    const chart = charts[id]
    const dimensions = chart.dimensions
    const measures = chart.measures
    const savedColors = multi
      ? chart.savedColors[multiSourceIndex]
      : chart.savedColors
    const color = multi ? chart.color[multiSourceIndex] : chart.color

    if (
      chart.type === "pointmap" ||
      chart.type === "backendScatter" ||
      chart.type === "geoheat" ||
      chart.type === "linemap" ||
      chart.type === "backendChoropleth" ||
      !(dimensions && measures && savedColors)
    ) {
      return charts
    }

    const colorType = getColorType(chart)
    const defaultColor = getDefaultColor(chart)
    let nextColor = null
    if (
      colorByDimensionActive(chart.colorByDimension, dimensions) &&
      colorType !== "quantitative" &&
      !isLineAndColorDimension(chart)
    ) {
      nextColor =
        savedColors[`custom_${chart.colorByDimension}`] ||
        Object.assign({}, getColors(CHARTS_DEFAULT_COLORS).custom, {
          column: chart.colorByDimension
        })
    } else if (savedColors[colorType]) {
      nextColor = Object.assign({}, savedColors[colorType], {
        defaultOtherDomain: color.defaultOtherDomain
      }) // always use the current defaultOtherDomain
    } else if (colorType === "ordinal" && savedColors.solid) {
      // allow ordinal to pick up solid colors
      nextColor = savedColors.solid
    } else if (/^custom_.+/.test(colorType) || (color && color.isCustom)) {
      nextColor = color.type !== "custom" ? defaultColor : color
    } else {
      nextColor = defaultColor
    }

    return multi
      ? {
          ...charts,
          [id]: {
            ...chart,
            color: {
              ...chart.color,
              [multiSourceIndex]: nextColor
            }
          }
        }
      : {
          ...charts,
          [id]: {
            ...chart,
            color: nextColor
          }
        }
  }
}

function selectorColorType(selector) {
  return selector.categories && selector.colorType !== "quantitative"
    ? `custom_${selector.value}`
    : cond([
        [(type) => TEXT_AND_BOOL_TYPES[type], () => "ordinal"],
        [(type) => NONCUSTOM_NUMERICAL_TYPES[type], () => "quantitative"],
        [(type) => TIME_UNITS[type], () => "quantitative"],
        [() => true, () => "solid"]
      ])(selector.type)
}

export function colorByDimensionActive(colorByDimension, dimensions) {
  const colorByDimensions = dimensions.filter(
    (d) => d.value && d.value === colorByDimension
  )
  return (
    colorByDimensions.length &&
    !view(lensPath([0, "inactive"]), colorByDimensions)
  )
}

export const savedColorKey = (color) =>
  color.column ? `custom_${color.column}` : color.type

export const mergeSavedColorWithColorImmer = (chart, multiSourceIndex) => {
  const isMulti = !isNil(multiSourceIndex)
  const color = isMulti ? chart.color[multiSourceIndex] : chart.color
  const savedColorK = savedColorKey(color)
  if (isMulti) {
    chart.savedColors = {
      ...(chart.savedColors || {}),
      [multiSourceIndex]: {
        ...(chart.savedColors[multiSourceIndex] || {}),
        [savedColorK]: color
      }
    }
  } else {
    chart.savedColors[savedColorK] = color
  }
}

export const mergeSavedColorWithColor = (multiSourceIndex) => (chart) => {
  const isMulti = !isNil(multiSourceIndex)
  const newChart = {
    ...chart
  }
  const color = isMulti ? newChart.color[multiSourceIndex] : newChart.color
  const savedColorK = savedColorKey(color)
  if (isMulti) {
    newChart.savedColors = {
      ...(newChart.savedColors || {}),
      [multiSourceIndex]: {
        ...(newChart.savedColors[multiSourceIndex] || {}),
        [savedColorK]: color
      }
    }
  } else {
    newChart.savedColors = { ...newChart.savedColors, [savedColorK]: color }
  }
  return newChart
}

export const setCustomColorDomainAndRange = (
  value,
  domain = [],
  range = [],
  lineStyles = [],
  multiSourceIndex
) => (chart) => {
  const colorRef = isNil(multiSourceIndex)
    ? chart.color
    : chart.color[multiSourceIndex]

  const reconciledLineStyles = domain.map((d, i) =>
    colorRef.customDomain && colorRef.customDomain[i] === d && lineStyles[i]
      ? lineStyles[i]
      : "solid"
  )

  const newColor = {
    ...colorRef,
    column: value,
    customKey: "key1",
    isCustom: true,
    type: "custom",
    customDomain: domain,
    customRange: range,
    lineStyles: reconciledLineStyles
  }

  return mergeSavedColorWithColor(multiSourceIndex)({
    ...chart,
    color: isNil(multiSourceIndex)
      ? { ...newColor }
      : {
          ...chart.color,
          [multiSourceIndex]: { ...newColor }
        }
  })
}

export const setCustomColorValue = (value, index, key, color) => ({
  [key]: set(
    lensIndex(index),
    value,
    key === "lineStyles" &&
      (!color[key] || color[key].length !== color.customDomain.length)
      ? color.customDomain.map(() => LINE_STYLES[0])
      : color[key]
  ),
  // Keep domainIsDirty around if it was already true
  domainIsDirty: color.domainIsDirty || key === "customDomain",
  paletteMappingId: null
})

export const setCustomColorDefaultOtherDomainAndRange = (
  defaultOtherDomain,
  defaultOtherRange,
  multiSourceIndex
) =>
  compose(
    mergeSavedColorWithColor(multiSourceIndex),
    over(
      isNil(multiSourceIndex)
        ? lensProp("color")
        : lensPath(["color", multiSourceIndex]),
      mergeR({
        defaultOtherDomain,
        defaultOtherRange
      })
    )
  )

export const getBinParams = (
  { min_val, max_val },
  cardinality,
  chartType,
  columnType
) => {
  const isBinnable =
    chartType !== CHART_TYPES.POINTMAP &&
    chartType !== CHART_TYPES.BACKEND_SCATTER
  const autobin = Boolean(
    isBinnable &&
      (cardinality > DIFF_TO_AUTOBIN || ALWAYS_BINNED_TYPES[columnType])
  )
  return {
    min_val,
    max_val,
    currentLowValue: min_val,
    currentHighValue: max_val,
    cardinality,
    isBinned: autobin,
    isBinnable,
    autobin,
    maxBinSize: MAX_BIN_SIZE
  }
}

export function getNumOfBins(dimType, chartType) {
  let numOfBins = NUM_BINS_FOR_NOT_TIME
  const isTimeUnit = dimType in TIME_UNITS
  const isHeatMap = chartType === CHART_TYPES.HEAT
  if (isTimeUnit && isHeatMap) {
    numOfBins = NUM_BINS_FOR_HEATMAP
  } else if (isTimeUnit && !isHeatMap) {
    numOfBins = NUM_BINS_FOR_TIME
  }
  return numOfBins
}

export function maybeSetCustomColor(selectorIndex, selectorType, chartId) {
  return (charts) => {
    const activeChart = charts[chartId]
    const selector = activeChart[selectorType][selectorIndex]
    const chartIsCustomColorable = !(
      (activeChart.type === "pointmap" ||
        activeChart.type === "backendScatter") &&
      activeChart.dimensions.filter((d) => d.value).length
    )
    const shouldUpdate =
      selectorType === "measures" &&
      selector.value &&
      selector.name === "color" &&
      selector.categories
    const customColors = getColors(CUSTOM_COLORS)

    if (shouldUpdate && chartIsCustomColorable) {
      const customColorsWithDefault = Object.keys(customColors).map(
        (key) => customColors[key][0]
      )
      activeChart.color = {
        customDomain: selector.categories.slice(),
        customKey: "key0",
        customPalette: customColors,
        customRange: customColorsWithDefault.slice(
          0,
          selector.categories.length
        ),
        isCustom: true,
        key: "custom",
        type: "custom",
        val: customColorsWithDefault,
        column: selector.value,
        defaultOtherDomain: "Default",
        defaultOtherRange:
          activeChart.color.defaultOtherRange ||
          getColors(CHARTS_DEFAULT_COLORS).custom.defaultOtherRange
      }
    }
    return charts
  }
}

const updateMeasureInactiveState = (firstIndex) => (measure, index) => {
  // The first measure always remains active
  if (index === firstIndex) {
    return {
      ...measure,
      inactive: false
    }
  } else if (typeof measure.value === "undefined") {
    return {
      ...measure,
      inactive: true
    }
  } else {
    return measure
  }
}

export function maybeSetMeasureState(chartId, multiSourceIndex) {
  return (charts) => {
    const chart = charts[chartId]
    const colorDimension = getColorDimension(chart.dimensions, multiSourceIndex)
    const hasColorDimension = Boolean(colorDimension && colorDimension.value)

    const updateOnlyForSource = (updater) => (measure, index) => {
      if (measure.multiSourceIndex === Number(multiSourceIndex)) {
        return updater(measure, index)
      } else {
        return measure
      }
    }

    if (chart.type === "line2" && hasColorDimension) {
      if (isChartMultiSource(chart)) {
        const firstMeasureIndexForSource = chart.measures.findIndex(
          (measure) => measure.multiSourceIndex === Number(multiSourceIndex)
        )

        return {
          ...charts,
          [chartId]: {
            ...chart,
            measures: chart.measures.map(
              updateOnlyForSource(
                updateMeasureInactiveState(firstMeasureIndexForSource)
              )
            )
          }
        }
      } else {
        const firstMeasureIndex = CHARTS.line2.minMeasures - 1

        return {
          ...charts,
          [chartId]: {
            ...chart,
            measures: chart.measures.map(
              updateMeasureInactiveState(firstMeasureIndex)
            )
          }
        }
      }
    } else {
      return charts
    }
  }
}

export const maybeSetDateFormatForTable = (
  chartId,
  chartType,
  selector,
  selectorType,
  selectorIndex
) => {
  return (state) => {
    if (chartType === "table" && ["DATE", "TIME"].includes(selector.type)) {
      const dateFormat = selector.type === "DATE" ? "%B %d, %Y" : "%H:%M:%S"
      return {
        ...state,
        [chartId]: {
          ...state[chartId],
          [selectorType]: state[chartId][selectorType].map((s, i) =>
            selectorIndex === i
              ? {
                  ...s,
                  [selectorType === "dimensions"
                    ? "dateFormat"
                    : "numberFormat"]: dateFormat
                }
              : { ...s }
          )
        }
      }
    }
    return state
  }
}

// Disable the 'All Others' slice and percent value labels for Pie chart, when
// it has a size measure (index 0) that is not 'summable' - that is, for which
// a summed total is not meaningful.
export const setSummableStateForPie = (
  chartId,
  chartType,
  selector,
  selectorType,
  selectorIndex
) => {
  if (
    chartType === "pie" &&
    selectorType === "measures" &&
    selectorIndex === 0
  ) {
    return (state) => {
      if (percentageEnabledForPieMeasure(selector)) {
        return {
          ...state,
          [chartId]: {
            ...state[chartId],
            showPercentValuesInPopup: true
          }
        }
      } else {
        return {
          ...state,
          [chartId]: {
            ...state[chartId],
            showAllOthers: false,
            showPercentValues: false,
            showPercentValuesInPopup: false
          }
        }
      }
    }
  } else {
    return identity
  }
}
