// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getColors, HEAVYAI_TOPN_COLORS } from "services/colors"
import {
  VegaTopNOptions,
  VegaComboTopNQuerySpec,
  VegaCustomizableTopNOptions,
  VegaCustomizableTopNItem,
  VegaCustomizableTopNAllOther
} from "./types"
import {
  CUSTOM_SQL_SELECTOR_TYPE,
  DimensionExpression,
  MeasureExpression
} from "vega/constants/data-selection-types"
import {
  Filter,
  notInFilter,
  notNullFilter,
  andFilter,
  orFilter,
  nullFilter
} from "vega/constants/filter-types"
import { FilterAndCohort } from "vega/constants/filter-metadata-types"
import { createCountMeasure } from "vega/utils/data-selection"
import { determineColorByValue } from "utils/deterministic-coloring"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { PaletteMapping } from "components/shared-settings/types"
import { DEFAULT_CATEGORICAL_PALETTE } from "constants/colors"
import { getOrdinalOrSolidPalette } from "./color-utils"

const DEFAULT_TOPN_LIMIT = 5

export type TransformedTopNData = {
  key: string
  originalKey?: string
  color: string
  order: number
  locked?: boolean
  disabled?: boolean
}

/**
 * @param val The value
 * @param suffix A suffix to add to the key
 * @returns a key that is used to reference this top-n value
 */
export const buildKey = (val: any, suffix: string) => {
  return `${typeof val}-${val}-${suffix}`
}

export const hasCustomOptions = (
  options: VegaTopNOptions
): options is VegaCustomizableTopNOptions =>
  Boolean(
    (options as VegaCustomizableTopNOptions).staticValues ||
      (options as VegaCustomizableTopNOptions).dynamicValues
  )

/**
 * Return the number of top n group from the options
 * @param options The top-n options
 * @returns the number of groups
 */
export const countTopNGroups = (options: VegaCustomizableTopNOptions): number =>
  options.n +
  (options.staticValues?.reduce?.(
    (acc, { disabled }) => acc + (disabled ? 0 : 1),
    0
  ) || 0) +
  (options.allOthers?.disabled ? 0 : 1)

/**
 * Build query spec for top-n data
 * @param dataSource The table name to query
 * @param options Top-n options
 * @param appliedFilters Filters to apply to the query
 * @param measure Measure to rank for top-n
 * @param dimension Dimension to group by
 * @returns VagTopNQuerySpec which can be passed to buildQuery
 */
export const topNQuerySpec = (
  table: string,
  dataSource: string,
  options: VegaTopNOptions | VegaCustomizableTopNOptions,
  appliedFilters: FilterAndCohort[],
  measure: MeasureExpression,
  dimension: DimensionExpression
): VegaComboTopNQuerySpec => {
  let customValues = null

  if (hasCustomOptions(options)) {
    // Added to TopN spec purely to differentiate it when the static/dynamic values
    // are enabled or disabled, which isn't represented elsewhere but requires us
    // retrieving new data (so that those series get represented in All Others)
    customValues = [
      ...(options.staticValues?.map(({ key, disabled }) => ({
        key,
        disabled
      })) || []),
      ...(options.dynamicValues?.map(({ key, disabled }) => ({
        key,
        disabled
      })) || [])
    ]

    // This query is attempting to pull values for the "dynamic" top-n, so, we
    // need to filter out any values that are "static".
    if (options.staticValues && options.staticValues.length) {
      // We need to treat `null` specially...
      const staticValues = options.staticValues
        .map(({ key }) => key)
        .filter((key) => key !== null)

      const dataExpression =
        dimension.type === CUSTOM_SQL_SELECTOR_TYPE
          ? `(${dimension.sql})`
          : dimension.column?.value
      const dataType = dimension.column?.type

      // create a filter for static values
      let filter: Filter | null =
        staticValues.length > 0
          ? notInFilter(
              table,
              dataSource,
              dataExpression,
              dataType,
              staticValues
            )
          : null

      // handle `null`
      if (staticValues.length < options.staticValues.length) {
        // this would happen if `null` was added to the staticValues
        const filter2 = notNullFilter(
          table,
          dataSource,
          dataExpression,
          dataType
        )
        filter = filter === null ? filter2 : andFilter([filter, filter2])
      } else if (filter) {
        // In this case, `null` is not a static value, but adding the `NOT IN`
        // condition will automatically filter out all nulls, which may end up
        // being in our top-n. We need to explicitly return nulls
        filter = orFilter([
          filter,
          nullFilter(table, dataSource, dataExpression, dataType)
        ])
      }

      if (filter) {
        appliedFilters = [
          ...appliedFilters,
          {
            dataSources: [dataSource],
            filter
          }
        ]
      }
    }
  }

  return {
    type: "vega-combo-top-n" as const,
    table,
    dataSource,
    dimension,
    measure,
    customValues,
    appliedFilters,
    n: options.n,
    sort: options.sort,
    allOthers: options.allOthers && !options.allOthers.disabled,
    allowNullKeys: options.allowNullKeys,
    count: countTopNGroups(options)
  }
}

export const makeDefaultAllOthers = (
  dataSelectionIndex: number
): VegaCustomizableTopNAllOther => ({
  key: `others${dataSelectionIndex}`,
  color: HEAVYAI_TOPN_COLORS.allOthers,
  disabled: false,
  isAllOther: true
})

/** @returns default VegaCustomizableTopNOptions object */
export const buildDefaultCustomizableTopNOptions = (
  table: string,
  dataSelectionIndex: number,
  defaults?: Partial<VegaTopNOptions>
): VegaCustomizableTopNOptions => ({
  allOthers: makeDefaultAllOthers(dataSelectionIndex),
  n: defaults?.n ?? DEFAULT_TOPN_LIMIT,
  measure: createCountMeasure(table),
  sort: defaults?.sort ?? "DESC",
  showAllOthersInLegend: defaults?.showAllOthersInLegend ?? true,
  allowNullKeys: defaults?.allowNullKeys ?? true,
  defaultDeterministicColoring: getFeatureFlag(
    available_feature_flags.VEGA_DETERMINISTIC_COLORING
  ),
  palette: {
    key: DEFAULT_CATEGORICAL_PALETTE,
    name: DEFAULT_CATEGORICAL_PALETTE,
    type: "ordinal"
  }
})

/**
 * Given an array of color values and top-n options, any colors that are
 * explicitly used in the options will be moved to the front of the color array
 * so they will only be "reused" after all of the colors have been exhausted.
 * @param colorMap A map of color name to color
 * @param colors An array of colors
 * @param options Top-n options
 * @returns A new array of colors
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const reorderColorScale = (
  colorMap: Record<string, string>,
  colors: string[],
  options: VegaCustomizableTopNOptions
): string[] => {
  const newColors: string[] = []
  colors = [...colors]

  const moveColor = (datum: VegaCustomizableTopNItem) => {
    const idx = colors.indexOf(colorMap[datum.color] || datum.color)
    if (idx >= 0) {
      newColors.push(colors.splice(idx, 1)[0])
    }
  }
  if (options.staticValues) {
    options.staticValues.sort((a, b) => a.order - b.order).forEach(moveColor)
  }
  if (options.dynamicValues) {
    options.dynamicValues.forEach(moveColor)
  }

  return [...newColors, ...colors]
}

/**
 * Updates available color pool based on the assigned colors, static value colors and dynamic value's assigned color
 * @param colors
 * @param options
 */
export const getAvailableColorScale = (
  colors: string[],
  options: VegaCustomizableTopNOptions
): string[] => {
  const availableColors = [...colors]

  if (options.staticValues) {
    options.staticValues.forEach((datum) => {
      const assignedColorIndex = availableColors.indexOf(datum.color)
      delete availableColors[assignedColorIndex]
    })
  }

  if (options.dynamicValues) {
    options.dynamicValues.forEach((datum) => {
      const assignedColorIndex = availableColors.indexOf(datum.color)
      delete availableColors[assignedColorIndex]
    })
  }

  if (options.allOthers.color !== HEAVYAI_TOPN_COLORS.allOthers) {
    const assignedColorIndex = availableColors.indexOf(options.allOthers.color)
    delete availableColors[assignedColorIndex]
  }

  return availableColors
}

/**
 * Gets static colors object, then returns it as array of colors.
 * Also, creates key value pair for the assigned color values
 * @param colors - either a string key indicating which color palette to fetch,
 *  or an array of colors
 * @param colorMap
 */
export const getNewColors = (
  colors: string[] | string,
  colorMap: Record<string, string>,
  blueFirst = true
) => {
  if (!Array.isArray(colors)) {
    const scale: string[] | Record<string, string[]> = getColors(colors)
    if (Array.isArray(scale)) {
      colors = scale
    } else {
      // for historic reasons, "blue" is first, (unless deterministic coloring)
      const keys = Object.keys(scale)
      if (blueFirst) {
        const blueIdx = keys.indexOf("blue")
        if (blueIdx >= 0) {
          keys.splice(blueIdx, 1)
          keys.unshift("blue")
        }
      }

      colors = keys.map((name) => {
        const [color] = scale[name]
        colorMap[name] = color
        return color
      })
    }
  }
  return colors
}

export const getColorKey = (
  options: VegaCustomizableTopNOptions | undefined,
  paletteMapping?: PaletteMapping
) => {
  if (paletteMapping) {
    const paletteMappingPalette = paletteMapping?.mapping?.palette
    return paletteMappingPalette?.key ?? DEFAULT_CATEGORICAL_PALETTE
  }
  // custom palettes dont have name, only key
  return (
    options?.palette?.name ??
    options?.palette?.key ??
    DEFAULT_CATEGORICAL_PALETTE
  )
}

/* Does all the things to choose whether to use a palette mapping that's selected
 * use the dynamic values setup in measureTopNOptions, or fall back to determineColorByValue */
export const getSavedColorOrDefault = (
  val: string,
  topNOptions: VegaCustomizableTopNOptions,
  paletteMapping?: PaletteMapping
) => {
  const sharedSettingsEnabled = getFeatureFlag(
    available_feature_flags.ENABLE_SHARED_COLOR_SETTINGS
  )
  const colorKey = getColorKey(topNOptions, paletteMapping)
  if (paletteMapping && sharedSettingsEnabled) {
    const idx = paletteMapping?.mapping?.customDomain?.indexOf?.(val) ?? -1
    const paletteType = paletteMapping?.mapping?.palette?.type
    // How to handle values not in the saved domain in combo chart
    if (idx >= 0) {
      return paletteMapping.mapping.customRange[idx]
    }
    const colors = getOrdinalOrSolidPalette(colorKey, paletteType)
    return determineColorByValue(val, colors)
  } else if (topNOptions) {
    const dynamicValue = topNOptions?.dynamicValues?.find?.(
      (dv) => dv.key === val
    )
    if (dynamicValue?.color) {
      return dynamicValue.color
    }
    const staticValue = topNOptions?.staticValues?.find?.(
      (dv) => dv.key === val
    )
    if (staticValue?.color) {
      return staticValue.color
    }
  }
  const colors = getOrdinalOrSolidPalette(colorKey, topNOptions?.palette?.type)
  return determineColorByValue(val, colors)
}

/**
 * Combines custom "static" (ie, locked) values, custom colors, and other such
 * customizations to the data returned by the top-n query spec
 */
export const transformCustomTopNData = (
  data: Array<Record<string, any>> | null | undefined,
  options: VegaCustomizableTopNOptions,
  keySuffix = "",
  selectedPaletteMapping?: PaletteMapping
): TransformedTopNData[] | null => {
  if (!data) {
    return null
  }

  // get color scale
  const colorKey = getColorKey(options, selectedPaletteMapping)
  const paletteType =
    selectedPaletteMapping?.mapping?.palette?.type ?? options?.palette?.type
  const paletteColors = getOrdinalOrSolidPalette(colorKey, paletteType)

  // add static values to the top
  const transformedData: TransformedTopNData[] = []
  const keys = new Set<string>()
  let order = 0

  if (options.staticValues) {
    order = options.staticValues.length
    options.staticValues
      .sort((a, b) => a.order - b.order)
      .forEach((datum) => {
        const color = getSavedColorOrDefault(
          datum.key,
          options,
          selectedPaletteMapping
        )
        keys.add(datum.key)
        transformedData.push({
          ...datum,
          originalKey: datum.key,
          key: buildKey(datum.key, keySuffix),
          color,
          locked: true
        })
      })
  }

  // create a map of dynamic value customizations
  const customizedDynamicValues: Map<
    string | null,
    VegaCustomizableTopNItem
  > = new Map()
  if (options.dynamicValues) {
    options.dynamicValues.forEach((datum) =>
      customizedDynamicValues.set(datum.key, datum)
    )
  }

  // add dynamic values to the data
  data.forEach((datum) => {
    // it's possible, when a user has *just* locked an item, that the item will
    // be both in the static list and in this dynamic list. That causes some
    // problems, so we'll filter duplicates here. The problem corrects itself
    // once the new query is run and the dynamic values update.
    if (keys.has(datum.key)) {
      return
    }

    keys.add(datum.key)

    const newDatum: Omit<TransformedTopNData, "color"> & { color?: string } = {
      ...datum,
      originalKey: datum.key,
      key: buildKey(datum.key, keySuffix),
      order: order += 1
    }

    const customized = customizedDynamicValues.get(datum.key)

    if (selectedPaletteMapping) {
      newDatum.color = getSavedColorOrDefault(
        datum.key,
        options,
        selectedPaletteMapping
      )
      newDatum.disabled = customized?.disabled
    } else if (customized) {
      newDatum.color = customized.color
      newDatum.disabled = customized.disabled
    }

    if (!newDatum.color) {
      newDatum.color = determineColorByValue(datum.key, paletteColors)
    }

    transformedData.push(newDatum as TransformedTopNData)
  })

  // add "All Others" to the bottom
  const allOthers = {
    ...options.allOthers,
    order: order += 1
  }
  transformedData.push(allOthers)

  return transformedData
}

/**
 * Combines custom "static" (ie, locked) values, custom colors, and other such
 * customizations to the data returned by the top-n query spec
 */
export const transformBaseDimOrMeasureCustomTopNData = (
  data: Array<Record<string, any>> | null | undefined,
  options: VegaCustomizableTopNOptions | undefined,
  selectedPaletteMapping: PaletteMapping | undefined,
  isBaseDimension = false
): TransformedTopNData[] | null => {
  if (!data || !options) {
    return null
  }

  const dataKey = isBaseDimension ? "dimension0" : "measureColor"
  const keySuffix = ""

  const colorMap: Record<string, string> = {}
  const colorKey = getColorKey(options, selectedPaletteMapping)
  const paletteType =
    selectedPaletteMapping?.mapping?.palette?.type ?? options?.palette?.type
  const colors = getOrdinalOrSolidPalette(colorKey, paletteType)

  // add static values to the top
  const transformedData: TransformedTopNData[] = []
  const keys = new Set<string>()
  let order = 0

  // create a map of dynamic value customizations
  const customizedDynamicValues: Map<
    string | null,
    VegaCustomizableTopNItem
  > = new Map()
  if (options.dynamicValues) {
    options.dynamicValues.forEach((datum) =>
      customizedDynamicValues.set(datum.key, datum)
    )
  }

  // add dynamic values to the data
  data.forEach((datum) => {
    // it's possible, when a user has *just* locked an item, that the item will
    // be both in the static list and in this dynamic list. That causes some
    // problems, so we'll filter duplicates here. The problem corrects itself
    // once the new query is run and the dynamic values update.
    if (keys.has(datum[dataKey])) {
      return
    }

    keys.add(datum[dataKey])

    const newDatum: Omit<TransformedTopNData, "color"> & {
      color?: string
    } = {
      ...datum,
      originalKey: datum[dataKey],
      key: buildKey(datum[dataKey], keySuffix),
      order: order += 1
    }

    const customized = customizedDynamicValues.get(datum[dataKey])
    if (selectedPaletteMapping) {
      newDatum.color = getSavedColorOrDefault(
        datum[dataKey],
        options,
        selectedPaletteMapping
      )
      newDatum.disabled = customized?.disabled
    } else if (customized) {
      newDatum.color = colorMap[customized.color] || customized.color
      newDatum.disabled = customized.disabled
    }

    if (!newDatum.color) {
      newDatum.color = determineColorByValue(datum[dataKey], colors)
    }

    transformedData.push(newDatum as TransformedTopNData)
  })

  return transformedData
}

/**
 * Determines if top N values should be displayed bottom to top, in order to
 * visually match charts that place lower sorted values at bottom.
 */
export const shouldInvertTopNLegendOrder = (
  orientation: string,
  groupingMode: string
) => {
  return (
    orientation === "column" && ["stacked", "percent"].includes(groupingMode)
  )
}

/**
 * Comparison function for sorting top N values
 */
export const topNLegendSort = (invertSort: boolean) => {
  return function sort(a: { order: number }, b: { order: number }) {
    return invertSort ? b.order - a.order : a.order - b.order
  }
}
