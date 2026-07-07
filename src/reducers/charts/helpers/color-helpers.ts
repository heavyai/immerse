// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  CHARTS,
  CHART_TYPES,
  DENSITY_ACCUMULATION_CHARTS
} from "constants/charts"
import {
  COLOR_PALETTE_TYPES,
  DEFAULT_CATEGORICAL_PALETTE,
  DEFAULT_OTHER_DOMAIN
} from "constants/colors"
import { Measure } from "constants/prop-types"
import { compose, keys, map } from "ramda"
import {
  CUSTOM_COLORS,
  CHARTS_DEFAULT_COLORS,
  MEASURE_DEFAULT_COLORS,
  getColors,
  HEAVYAI_TOPN_COLORS,
  ALL_OTHERS_LABEL
} from "services/colors"
import { determineColorByValue } from "utils/deterministic-coloring"
import { ChartState, ColorDefinition } from "../charts-reducer-types"
import { getLayerById, getLayerIndex } from "vega/utils/data-selection"
import { getLatestBeatData } from "vega/utils/data"
import {
  buildDefaultCustomizableTopNOptions,
  getColorKey,
  transformCustomTopNData,
  transformBaseDimOrMeasureCustomTopNData
} from "vega/charts/top-n-utils"
import { cloneDeep, unzip } from "lodash"
import { PaletteMapping } from "components/shared-settings/types"
import { importableServices as Services } from "services/immerse-importable"
import { getOrdinalOrSolidPalette } from "vega/charts/color-utils"

const ALL_OTHERS_DOMAIN_VALUES = [ALL_OTHERS_LABEL, DEFAULT_OTHER_DOMAIN]

export const isD3ChartWithCustomDomainRange = (chart: ChartState = {}) => {
  const activeDimensions = chart.dimensions?.filter(
    (d) => !d.inactive && d.value
  )
  return (
    [CHART_TYPES.PIE, CHART_TYPES.SCATTER].includes(chart.type) &&
    activeDimensions.length === 1
  )
}

function getColorSelector({ measures, dimensions }) {
  const selectors = measures.concat(dimensions)
  return selectors.filter(({ name, value }) => name === "color" && value)[0]
}

// Combo needs to retain custom color series
// with capitalized name "Color", such as from line
function getColorSelectorForCombo({ measures, dimensions }) {
  const selectors = measures.concat(dimensions)
  return selectors.filter(
    ({ name, value }) => name && name.toLowerCase() === "color" && value
  )[0]
}

function customColor(chart) {
  return {
    customDomain: [],
    customKey: "key0",
    customPalette: getColors(CUSTOM_COLORS),
    customRange: [],
    isCustom: true,
    key: "custom",
    type: "custom",
    val: keys(getColors(CUSTOM_COLORS)).map(
      (key) => getColors(CUSTOM_COLORS)[key][0]
    ),
    column: chart.measures.filter(({ name }) => name === "color")[0].value,
    defaultOtherDomain: DEFAULT_OTHER_DOMAIN,
    defaultOtherRange:
      chart.color.defaultOtherRange ||
      getColors(CHARTS_DEFAULT_COLORS).custom.defaultOtherRange
  }
}

export const createChartColor = (chart, type, isMultiSource = null) => {
  const { allowedColorTypes, colorTypesFromColumnType } = CHARTS[type]

  if (isMultiSource === null) {
    isMultiSource = !chart.dataSource && chart.multiSources
  }

  const colorSelector =
    !isMultiSource &&
    (type === "line2"
      ? getColorSelectorForCombo(chart)
      : getColorSelector(chart))

  const currentColor = isMultiSource ? {} : chart.color || {}
  const isAccumulationEnabled =
    chart.densityAccumulatorEnabled && DENSITY_ACCUMULATION_CHARTS[type]

  let nextColor = null

  const validColorType =
    colorSelector && colorTypesFromColumnType[colorSelector.type]

  // Specifically retain colors when switching from line or histogram,
  // otherwise fall through to the original defaulting logic
  if (
    validColorType &&
    type === "line2" &&
    validColorType === currentColor.type
  ) {
    nextColor = { ...currentColor }
    if (!nextColor.lineStyles && nextColor.customDomain) {
      nextColor.lineStyles = nextColor.customDomain.map(() => "solid")
    }
    nextColor.domainIsDirty = true
  } else if (validColorType && type !== "line2") {
    if (validColorType === currentColor.type) {
      nextColor = { ...currentColor }
    } else if (validColorType === "custom") {
      chart.measures.filter(({ name }) => name === "color")[0].colorType =
        "ordinal"
      nextColor = currentColor.paletteMappingId
        ? { ...currentColor }
        : customColor(chart)
    } else {
      nextColor =
        (chart.savedColors && chart.savedColors[validColorType]) ||
        getColors(MEASURE_DEFAULT_COLORS)[validColorType]
    }
  } else if (isAccumulationEnabled) {
    // Note: Density accumulation only supports quantitative scales
    const nextColorType = "quantitative"
    nextColor =
      // VDF NOTE: isMultiSource check not strictly necessary here yet, this
      // branch is only for backend scatter and pointmap
      (!chart.isMultiSource &&
        chart.savedColors &&
        chart.savedColors[nextColorType]) ||
      getColors(CHARTS_DEFAULT_COLORS).defaultQuantitative
  } else if (
    !chart.isMultiSource &&
    chart.savedColors &&
    allowedColorTypes[currentColor.type]
  ) {
    if (chart.colorByDimension) {
      nextColor = chart.savedColors[`custom_${chart.colorByDimension}`]
    } else if (chart.savedColors[currentColor.type]) {
      nextColor = chart.savedColors[currentColor.type]
    } else if (
      chart.savedColors.quantitative &&
      allowedColorTypes.quantitative
    ) {
      nextColor = chart.savedColors.quantitative
    } else if (chart.savedColors.ordinal && allowedColorTypes.ordinal) {
      nextColor = chart.savedColors.ordinal
    } else if (chart.savedColors.solid && allowedColorTypes.solid) {
      nextColor = chart.savedColors.solid
    } else {
      const nextColorType = getColors(CHARTS_DEFAULT_COLORS)[type].type
      nextColor =
        chart.savedColors[nextColorType] ||
        getColors(CHARTS_DEFAULT_COLORS)[type]
    }
  } else {
    const nextColorType = getColors(CHARTS_DEFAULT_COLORS)[type].type
    nextColor =
      (chart.savedColors && chart.savedColors[nextColorType]) ||
      getColors(CHARTS_DEFAULT_COLORS)[type]
    if ([CHART_TYPES.PIE, CHART_TYPES.SCATTER].includes(type)) {
      nextColor.val = getOrdinalOrSolidPalette()
      nextColor.key = getColors(CHARTS_DEFAULT_COLORS)[chart.type]?.key
    }
  }

  return nextColor
}

export const getDefaultCategoricalPalette = (): {
  type: string
  val: string[]
} => ({
  type: "ordinal",
  val: getOrdinalOrSolidPalette()
})

const generateDeterministicColors = (
  domain: string[],
  colors: string[]
): string[] =>
  domain.map((value) => {
    if ([ALL_OTHERS_LABEL, DEFAULT_OTHER_DOMAIN].includes(value)) {
      return HEAVYAI_TOPN_COLORS.allOthers
    }
    return determineColorByValue(value, colors)
  })

const isDefaultHashColor = (
  val: string,
  color: string,
  palette: string[]
): boolean =>
  palette.length > 0 ? determineColorByValue(val, palette) === color : false

// filters out default hash-assigned colors from domain and range
// leaving us with just colors they user manually customized
export const filterDefaultValuesFromDomainRange = (
  customDomain: string[],
  customRange: string[],
  palette: string[]
): { domain: string[]; range: string[] } => {
  const filtered = customDomain
    .map((item, index) => ({
      domain: item,
      range: customRange[index] ?? determineColorByValue(item, palette)
    }))
    .filter(({ domain, range }) => !isDefaultHashColor(domain, range, palette))

  return {
    domain: filtered.map((item) => item.domain),
    range: filtered.map((item) => item.range)
  }
}

// returns a new range, optionally including any additional colors
// added by the user
export const calculateNewRangeWithAdditionalColors = (
  range: string[],
  palette: string[]
): string[] => {
  // if range has colors not in palette, append to palette and use as range
  const additionalColors = range.filter((r) => !palette.includes(r))
  return additionalColors.length > 0
    ? palette.concat(additionalColors)
    : palette
}

export const customOrdinalColor = ({
  value,
  categories,
  type,
  hideOther,
  initMinMax
}) => {
  const firstKeys = compose(
    map((key) => getColors(CUSTOM_COLORS)[key][0]),
    keys
  )
  const customDomainCategories = categories || []
  const customPalette = getColors(CUSTOM_COLORS)
  const firstKeysCustomPalette = firstKeys(customPalette)
  return {
    customDomain: customDomainCategories.slice(),
    customKey: "key0",
    customPalette,
    customRange: generateDeterministicColors(
      customDomainCategories,
      firstKeysCustomPalette
    ),
    isCustom: true,
    key: "custom",
    type: "custom",
    val: firstKeysCustomPalette,
    column: value,
    defaultOtherDomain: type === "BOOL" ? null : DEFAULT_OTHER_DOMAIN, // having boolean value in the domain array, we can't support "Other". NOTE: we will refactor to remove "Other" completely
    defaultOtherRange:
      type === "BOOL"
        ? null
        : getColors(CHARTS_DEFAULT_COLORS).custom.defaultOtherRange,
    hideOther,
    initialDomain: initMinMax
  }
}

export const customCategoricalColor = ({
  value,
  categories,
  type,
  hideOther,
  initMinMax,
  color,
  customRange
}) => {
  const customDomainCategories = categories || []
  const colorKey =
    color?.color?.key ??
    color?.color?.palette?.key ??
    DEFAULT_CATEGORICAL_PALETTE
  const palette = {
    type: "ordinal",
    key: colorKey,
    val: getOrdinalOrSolidPalette(colorKey)
  }
  return {
    customDomain: customDomainCategories.slice(),
    customKey: "key0",
    palette,
    customRange:
      customRange ??
      generateDeterministicColors(customDomainCategories, palette.val),
    isCustom: false,
    key: colorKey,
    type: "custom",
    val: palette.val,
    column: value,
    defaultOtherDomain: type === "BOOL" ? null : DEFAULT_OTHER_DOMAIN, // having boolean value in the domain array, we can't support "Other". NOTE: we will refactor to remove "Other" completely
    defaultOtherRange:
      type === "BOOL"
        ? null
        : getColors(CHARTS_DEFAULT_COLORS).custom.defaultOtherRange,
    hideOther,
    initialDomain: initMinMax
  }
}

export const categoricalColorFromMeasure = (
  measure: Measure = {},
  colorKey = DEFAULT_CATEGORICAL_PALETTE
) => {
  const { value, categories, type, hideOther, initMinMax } = measure
  const palette = {
    type: "ordinal",
    key: colorKey,
    val: getOrdinalOrSolidPalette(colorKey)
  }
  return {
    customDomain: categories,
    customKey: "key0",
    palette,
    customRange: generateDeterministicColors(categories, palette.val),
    isCustom: false,
    key: colorKey,
    type: "custom",
    val: palette.val,
    column: value,
    defaultOtherDomain: type === "BOOL" ? null : DEFAULT_OTHER_DOMAIN, // having boolean value in the domain array, we can't support "Other". NOTE: we will refactor to remove "Other" completely
    defaultOtherRange:
      type === "BOOL"
        ? null
        : getColors(CHARTS_DEFAULT_COLORS).custom.defaultOtherRange,
    hideOther,
    initialDomain: initMinMax
  }
}

export const chartHasCategoricalColoring = ({
  chartType,
  colorType,
  colorMeasure,
  chart
}: {
  chartType: string
  colorType: string
  colorMeasure?: Measure | undefined
  chart?: ChartState | undefined
}): boolean => {
  if (chartType === CHART_TYPES.VEGA_COMBO) {
    return colorMeasure?.aggregate === "Mode"
  } else if ([CHART_TYPES.PIE, CHART_TYPES.SCATTER].includes(chart.type)) {
    // d3 charts only support custom cat. coloring if they have a single dimension
    // multi-dimension custom coloring not supported for 8.3 release
    return (
      [COLOR_PALETTE_TYPES.ORDINAL, COLOR_PALETTE_TYPES.CUSTOM].includes(
        colorType
      ) && isD3ChartWithCustomDomainRange(chart)
    )
  } else {
    return (
      chartType !== CHART_TYPES.GAUGE &&
      colorType === COLOR_PALETTE_TYPES.ORDINAL
    )
  }
}

export const isD3ChartWithCategoricalColoring = (chart: ChartState): boolean =>
  chart.color?.paletteMappingId
    ? true
    : chart &&
      isD3ChartWithCustomDomainRange(chart) &&
      chartHasCategoricalColoring({
        chartType: chart.type,
        colorType: chart.color?.type,
        chart
      })

export const createD3CategoricalColor = (
  chart: ChartState,
  colorKey = DEFAULT_CATEGORICAL_PALETTE
) => {
  const dcChart = Services.get("dc").getChart(chart.dcFlag)
  const palette = {
    type: "ordinal",
    key: colorKey,
    val: getOrdinalOrSolidPalette(colorKey)
  }
  const dimension = chart?.dimensions[0]

  const categories = dcChart?.customDomain() ?? []

  dcChart?.customRange([])
  // This has gotta change it uses defaults for all others + hashes colors
  return customCategoricalColor({
    value: dimension.value,
    categories,
    type: dimension.type,
    hideOther: !chart.showAllOthers,
    initMinMax: categories,
    color: palette
  })
}

const vegaComboCategoricalColor = (
  chart: ChartState,
  selectedPaletteMapping: PaletteMapping | undefined,
  layerId: string,
  isMeasure = false
): ColorDefinition => {
  const layerIndex = getLayerIndex(chart.dataSelections, layerId)
  const layer = getLayerById(chart.dataSelections, layerId)
  let colorOptions = isMeasure ? layer?.measureTopNOptions : layer?.topNoptions
  const isBaseDimension =
    !chart.dataSelections.dimensions?.color &&
    !chart.dataSelections.measures?.color

  // Old charts will not have measure top n options, create it fresh here
  if (!colorOptions) {
    colorOptions = buildDefaultCustomizableTopNOptions(layer?.table, layerIndex)
  }

  const customDomainMapping = {} as Record<string, string>
  const beatData = getLatestBeatData(chart.data?.focus[layerIndex])
  // TODO[C]: This will only pick up data for box plot, need to handle violin as well
  const data =
    isMeasure || isBaseDimension ? beatData?.table : beatData?.groupByDimension

  let topNData = []
  if (isBaseDimension || isMeasure) {
    topNData = transformBaseDimOrMeasureCustomTopNData(
      data,
      colorOptions,
      selectedPaletteMapping,
      isBaseDimension
    )
  } else {
    topNData = transformCustomTopNData(
      data,
      colorOptions,
      "",
      selectedPaletteMapping
    )
  }
  let allOtherColor = null
  topNData?.forEach((topNDataValue) => {
    // Not sure why sometimes this has the flag set and sometimes it doesn't...
    if (topNDataValue.isAllOther) {
      allOtherColor = topNDataValue.color
    } else {
      const dataKey = isMeasure ? "measureColor" : "originalKey"
      customDomainMapping[topNDataValue[dataKey]] = topNDataValue.color
    }
  })

  colorOptions?.dynamicValues?.forEach((dv) => {
    if (dv.color) {
      customDomainMapping[dv.key] = dv.color
    }
  })
  colorOptions?.staticValues?.forEach((dv) => {
    if (dv.color) {
      customDomainMapping[dv.key] = dv.color
    }
  })
  const [customDomain, customRange] = unzip(Object.entries(customDomainMapping))
  const colorKey = getColorKey(colorOptions, selectedPaletteMapping)
  const paletteType = colorOptions?.palette?.type
  return {
    customDomain,
    customRange,
    customKey: "key0",
    // This stinks, we need to consolidate where we're storing palette
    val: getOrdinalOrSolidPalette(colorKey, paletteType),
    ...colorOptions.palette,
    type: "custom",
    key: colorKey,
    palette: {
      type: paletteType ?? COLOR_PALETTE_TYPES.ORDINAL,
      val: getOrdinalOrSolidPalette(colorKey, paletteType),
      ...colorOptions.palette,
      key: colorKey
    },
    defaultOtherDomain: DEFAULT_OTHER_DOMAIN,
    defaultOtherRange:
      allOtherColor ??
      getColors(CHARTS_DEFAULT_COLORS).custom.defaultOtherRange,
    hideOther: false,
    column: isMeasure
      ? layer?.measures?.color?.column?.column
      : layer?.dimensions?.color?.column?.column
  }
}
/**
 * This takes any chart, and returns a valid and standard color definition.
 *
 * @param chart Chart to generate a standard color object
 * @param mappings
 * @param layerId
 * @param isMeasure
 */
export const categoricalColorFromChart = (
  chart: ChartState,
  selectedPaletteMapping: PaletteMapping,
  layerId: string,
  isMeasure = false
): ColorDefinition => {
  if ([CHART_TYPES.VEGA_COMBO, CHART_TYPES.BOX_PLOT].includes(chart.type)) {
    return vegaComboCategoricalColor(
      chart,
      selectedPaletteMapping,
      layerId,
      isMeasure
    )
  } else if (isD3ChartWithCategoricalColoring(chart)) {
    const color = cloneDeep(chart.color)
    // Handle all others. D3 stores this value in domain/range arrays
    // We need to pull it out and store in the defaultOtherDomain/Range properties
    // of the palette mapping
    const allOthersIdx = color.customDomain.findIndex((domainVal: string) =>
      [ALL_OTHERS_LABEL, DEFAULT_OTHER_DOMAIN].includes(domainVal)
    )
    if (allOthersIdx >= 0) {
      color.customDomain.splice(allOthersIdx, 1)
      const allOtherColor = color.customRange[allOthersIdx]
      color.customRange.splice(allOthersIdx, 1)
      color.defaultOtherDomain = DEFAULT_OTHER_DOMAIN
      color.defaultOtherRange = allOtherColor
    }
    return color
  } else {
    return chart.color
  }
}

export const getD3ChartColorDomain = (chart: ChartState) => {
  const dcChart = Services.get("dc").getChart(chart.dcFlag)
  if (dcChart) {
    return dcChart?.customDomain()
  } else {
    return []
  }
}

export const getD3ChartColorRange = (chart: ChartState) => {
  const dcChart = Services.get("dc").getChart(chart.dcFlag)
  if (dcChart) {
    return dcChart?.customRange()
  } else {
    return []
  }
}

export const setD3MappingDomainRange = ({
  chart,
  mapping
}: {
  chart: ChartState
  mapping: ColorDefinition
}) => {
  const { customDomain, customRange } = mapping
  const dcChart = Services.get("dc").getChart(chart.dcFlag)

  if (
    !mapping.hideOther &&
    !ALL_OTHERS_DOMAIN_VALUES.some((o) => mapping.customDomain.includes(o)) &&
    chart.type !== CHART_TYPES.SCATTER
  ) {
    customDomain.push(ALL_OTHERS_LABEL)
    customRange.push(mapping.defaultOtherRange)
  }

  dcChart.colorMappingDomain(customDomain)
  dcChart.colorMappingRange(customRange)
}

export const appendD3DomainRange = (
  domain: string[],
  range: string[],
  d3Domain: string[],
  d3Range: string[]
): { domain: string[]; range: string[] } => {
  const newDomain = [...domain]
  const newRange = [...range]
  d3Domain.forEach((val, index) => {
    const existingIndex = newDomain.indexOf(val)

    if (existingIndex === -1) {
      newDomain.push(val)
      newRange.push(d3Range[index])
    } else {
      newRange[existingIndex] = d3Range[index]
    }
  })

  return { domain: newDomain, range: newRange }
}

export const resetD3ChartDomainRange = (chart: ChartState): void => {
  const dcChart = Services.get("dc").getChart(chart.dcFlag)
  if (dcChart) {
    dcChart.customDomain([])
    dcChart.customRange([])
  }
}

export const resetD3ChartMappingDomainRange = (chart: ChartState): void => {
  const dcChart = Services.get("dc").getChart(chart.dcFlag)
  if (dcChart) {
    dcChart.colorMappingDomain([])
    dcChart.colorMappingRange([])
  }
}

export const isBaseDimCategoricalColoringChart = (type: string): boolean =>
  [CHART_TYPES.BOX_PLOT].includes(type)
