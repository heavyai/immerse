// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defaultMemoize } from "reselect"
import { batch, connect } from "react-redux"
import { bindActionCreators } from "redux"
import { debounce, isEqual, throttle, zipObject } from "lodash"
import { shallowEqualArrays } from "shallow-equal"
import moment, { unitOfTime } from "moment"
import * as vega from "vega"
import { determineColorByValue } from "utils/deterministic-coloring"

// components
import VegaChartComponent from "vega/charts/vega-chart-component"

// utilities
import { importableStore as store } from "store/importableStore"
import { comboChartToChartQuerySpec } from "./query-spec"
import {
  buildDefaultCustomizableTopNOptions,
  buildKey,
  countTopNGroups,
  getColorKey,
  getSavedColorOrDefault,
  shouldInvertTopNLegendOrder,
  topNQuerySpec,
  transformCustomTopNData,
  TransformedTopNData,
  transformBaseDimOrMeasureCustomTopNData
} from "vega/charts/top-n-utils"
import {
  getColorsForScheme,
  getOrdinalOrSolidPalette
} from "vega/charts/color-utils"
import {
  getAppropriateTimeFormat,
  getAutoBinUnit,
  getMaxTimeBins
} from "vega/utils/binning"
import {
  extentByAxis,
  getComputedMinMax,
  getLatestBeatData,
  toEpochIfDate
} from "vega/utils/data"
import {
  getDimensionLabel,
  getMeasureLabel,
  measureToExprStr
} from "vega/utils/data-selection"
import { getUserConfigurableUISettings } from "reducers/user-configurable-ui-reducer"
import { buildAnnotationKey } from "utils/annotation-helpers"
import { focusChartFilterName, rangeChartFilterName } from "vega/utils/filter"
import { getSelectedFilterSetId } from "components/new-filters/filter-sets-selectors"
import ForwardSelect from "vega/utils/forward-select"
import VegaChannel from "vega/components/Vega/VegaChannel"
import { parametersInValue } from "components/parameters/utils"
import { buildCrossLinkFilters } from "utils/crosslink-utils"
import { isGridEnabled, isLegendEnabled } from "vega/utils/presentation"

// action creators / thunks
import { updateChart } from "actions/update-chart-action-creator"
import { fetchData } from "vega/actions/vega-data-thunks"
import {
  clearBinningManualMax,
  clearBinningManualMin,
  setBinningManualMax,
  setBinningManualMin
} from "vega/actions/bin-settings-action-creators"
import {
  clearManualPrimaryMeasureDomainMax,
  clearManualPrimaryMeasureDomainMin,
  clearManualSecondaryMeasureDomainMax,
  clearManualSecondaryMeasureDomainMin,
  setBaseDimensionTitle,
  setManualPrimaryMeasureDomainMax,
  setManualPrimaryMeasureDomainMin,
  setManualSecondaryMeasureDomainMax,
  setManualSecondaryMeasureDomainMin,
  setPrimaryMeasureTitle,
  setSecondaryMeasureTitle
} from "vega/actions/presentation-settings-action-creators"
import {
  clearFilterByName,
  setCrossFilter,
  toggleFilterByName
} from "vega/actions/filter-action-creators"
import {
  topnResetOptions,
  topnSetColor,
  topnToggle,
  topnToggleAllOthers
} from "vega/actions/top-n-action-creators"
import { toggleLegendPinning } from "vega/actions/legend-action-creators"
import {
  clearColorDomain,
  setColorDomain
} from "vega/actions/scale-settings-action-creators"

// types
import {
  ComboDataSelection,
  CUSTOM_SQL_SELECTOR_TYPE,
  DimensionExpression,
  MarkSettings,
  TIME_LAG_EXPRESSION_TYPE
} from "vega/constants/data-selection-types"
import {
  AxisOrientation,
  BaseDimensionScaleSettings,
  BinnedNumericDimensionScaleSettings,
  BinnedTimeUnit,
  ComputedMinMax,
  GetChartBodySizeAndPosition,
  TimeLagSettings,
  VegaComboChart,
  VegaComboData,
  VegaComboLayerBeatData,
  VegaComboQuerySpec,
  VegaCustomizableTopNOptions
} from "vega/charts/types"
import {
  andFilter,
  betweenFilter,
  Filter,
  isMultiSourceFilter,
  multiSourceFilter,
  notNullFilter,
  nullFilter,
  orFilter,
  simpleFilter,
  SimpleOperator
} from "vega/constants/filter-types"
import {
  ChartFilterMetadata,
  FilterMetadata,
  getFiltersAppliedToChart
} from "vega/constants/filter-metadata-types"
import { CrossLink } from "constants/crosslink-types"
import { TooltipData } from "vega/components/ChartTooltip/ChartTooltip"
import {
  AnnotationKey,
  CalcDefaultSettingsFunc,
  ChartDataSelection,
  PreprocessAnnotationFunc,
  SerializedAnnotationKey
} from "constants/annotations"
import { process as processParameters } from "utils/ImmerseSQLPlusPlus/parser"
import { DEFAULT_STROKEWIDTH } from "constants/magic-variables"

import {
  DEFAULT_DARK_MODE_AXIS_COLOR,
  DEFAULT_DARK_MODE_GRID_AXIS_COLOR,
  DEFAULT_DATABASE_STYLES,
  DEFAULT_GRID_AXIS_COLOR,
  DEFAULT_LIGHT_MODE_AXIS_COLOR,
  STYLE_PROPERTY_FONT_SIZE,
  STYLE_PROPERTY_FONT_WEIGHT,
  UI_CONFIG_AXIS_TICK_LABEL,
  UI_CONFIG_AXIS_TITLE
} from "components/ui-config-panel/constants"

// feature flags
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"
// vega specs
import { buildSpec, SpecOptions } from "./row-spec"
import { transformRowSpecToColumn } from "./column-spec"

import {
  FILTER_TYPE_AND,
  FILTER_TYPE_BETWEEN,
  FILTER_TYPE_ISNOTNULL,
  FILTER_TYPE_ISNULL,
  FILTER_TYPE_OR,
  FILTER_TYPE_SIMPLE
} from "vega/constants/filter-type-constants"
import { getDisplayOrParameterName } from "utils/get-display-or-parameter-name"
import { getJoinFilters } from "services/ImmerseCrossFilter/ImmerseCrossFilterJoin"
import { getTablesForDataSource } from "components/join-manager/utils"
import { chartHasCategoricalColoring } from "reducers/charts/helpers/color-helpers"
import { CHART_TYPES } from "constants/chart-types"
import { PaletteMapping } from "components/shared-settings/types"
import { SCALE_TYPES, ScaleType } from "constants/scale-types"
import { buildMeasureDomain } from "vega/utils/scales"
import {
  CUSTOM_FORMATTER_TYPE,
  immerseAutoFormatter
} from "utils/auto-formatter"
import { isThemeDark } from "utils/theme/use-immerse-ui-theme"

const { COMBO_QUERY_THROTTLE, START_OF_WEEK } = available_feature_flags

const SET_SIGNAL_DEBOUNCE = 250

type ValueType = string | number | Date | null

type RangeValues = {
  start: NonNullable<ValueType>
  end: NonNullable<ValueType>
}

type MeasureDomain = {
  min: number
  max: number
  minLocked: boolean
  maxLocked: boolean
}

export type SelectedValue = {
  value: string
  negated?: boolean
}

type RangeFilterValue = {
  /** values */
  values: NonNullable<ValueType>[]
}

type ZoomFilterValue = {
  start: NonNullable<ValueType>
  end: NonNullable<ValueType>
}

export type ValueWithOp = {
  value: ValueType
  op: SimpleOperator
}

export type TransformedDatum = {
  dataSelectionIndex: number
  measureIndex: number
  dimension: string
  dimensions: ValueType[]
  dimensionFormatted: string
  measureKey: string
  measure: number
  rawMeasure: number
  measureColor?: number
  categoricalColor?: string
  categoricalMeasureValue?: string | number
  annotationKey: SerializedAnnotationKey
  sortableVal?: number
}

type Datum = TransformedDatum & {
  gap?: boolean
  measureMin: number
  measureMax: number
  axis: string
}

type DataByVisualization = {
  bar?: Array<Datum>
  line?: Array<Datum>
  area?: Array<Datum>
}

type DataByAxisAndVisualization = {
  primary?: DataByVisualization
  secondary?: DataByVisualization
}

type MeasureSettings = {
  dataSelectionIndex: number
  measureIndex: number
  key: string
  label: string
  color?: string
  applyColorMeasure: boolean
  axis: NonNullable<MarkSettings["axis"]>
  visualizeAs: NonNullable<MarkSettings["markType"]>
  hideLine: NonNullable<MarkSettings["hideLine"]>
  lineStyle: MarkSettings["lineStyle"]
  lineThickness: NonNullable<MarkSettings["lineThickness"]>
  lineShadow: NonNullable<MarkSettings["lineShadow"]>
  order: number
  disabled?: boolean
}

type ExtentsByAxis = {
  primary?: [number, number]
  secondary?: [number, number]
}

/**
 * There are several places where values need to be stringified. We need to
 * handle Dates as a special case because simply coercing to string will not
 * include milliseconds - we need to explicitly call toISOString.
 * @param val The value to stringify
 * @returns the value stringified
 */
export function stringify(val: ValueType | ValueType[]) {
  if (val instanceof Date) {
    return val.toISOString()
  }
  return String(val)
}

/**
 * Given the crossfilter produced by this chart, extract and rebuild the
 * `selectedValues` so that we can visually show the crossfilter on the chart.
 * @param ourCrossfilter The crossfilter created by this chart
 * @param bins From the binsSelector
 * @param binsScaled From the binsSelector
 * @returns the `selectedValues` to feed into the vega spec
 */
export function selectedValuesFromCrossfilter(
  ourCrossfilter: ChartFilterMetadata | undefined,
  {
    bins,
    scaled: binsScaled
  }: {
    bins?: (number | Date)[]
    scaled?: (number | Date)[]
  }
) {
  if (!ourCrossfilter) {
    return {
      selectedValues: [],
      negativeSelectedValues: [],
      rangeValues: []
    }
  }

  const selectedValuesSet = new Set<string>()
  const negativeSelectedStoreSet = new Set<string>()
  const rangeValues: RangeValues[] = []

  const binLookup: Record<string, number | Date> =
    bins && binsScaled ? zipObject(binsScaled.map(stringify), bins) : {}

  // used to take an array of simple or null filters to create the final filter
  // value for the vega spec
  const filtersToValue = (filters: Filter[], onlyNegated: boolean): string => {
    const simpleOp = onlyNegated ? "<>" : "="
    const inequalityOp = onlyNegated ? "<" : ">="
    const inequalityConnective = onlyNegated ? FILTER_TYPE_OR : FILTER_TYPE_AND
    const nullOp = onlyNegated ? FILTER_TYPE_ISNOTNULL : FILTER_TYPE_ISNULL
    const values = filters.flatMap((f) => {
      if (f.filterType === FILTER_TYPE_SIMPLE && f.operator === simpleOp) {
        return [f.value]
      } else if (f.filterType === nullOp) {
        return [null]
      } else if (f.filterType === inequalityConnective) {
        // If the dimension is binned, but not continuous (ie, sorted by
        // something other than the dimension), the filter will be either dim
        // >= X AND dim < Y for positive filters, or dim < X OR dim >= Y for
        // negated filters. We're only interested in X for both cases.
        const val = f.filters.flatMap((f2) =>
          f2.filterType === FILTER_TYPE_SIMPLE && f2.operator === inequalityOp
            ? [binLookup[stringify(f2.value)]]
            : []
        )[0]
        return val ? [val] : []
      }
      return []
    })
    return JSON.stringify(values)
  }

  // The crossfilter always starts with a multiSourceFilter - each source will
  // then have an andFilter of:
  //   - orFilters of andFilters of either a simple "=" filter or an "and" of
  //     two simple filters: one >= and one < - positive filters
  //   - andFilters of orFilters of either a simple "<>" filter or an "or" of
  //     two simple filters: one < and one >= - negative filters
  //   - betweenFilters
  //
  // The cases above with an anded pair of simple inequality filters happens
  // when the dimension is binned, but not continuous (which happens when the
  // chart is not sorted by the dimension) and a user clicks on a bar.
  //
  // If any part of the filter doesn't fit these rules, they're ignored.
  //
  // Unfortunately, this logic is kind of complex - I can't think of any other
  // way to do it at the moment since the filters can be edited outside of the
  // vega combo chart (ie, in the filter panel). Would be nice if we could just
  // store some metadata on the filter, but that would get out-of-sync if the
  // filter is edited in the filter panel.
  if (isMultiSourceFilter(ourCrossfilter.filter)) {
    Object.values(ourCrossfilter.filter.filtersByDataSource).forEach(
      (mainFilter) => {
        if (mainFilter.filterType === FILTER_TYPE_AND) {
          mainFilter.filters.forEach((filter) => {
            if (filter.filterType === FILTER_TYPE_BETWEEN) {
              // range filter
              rangeValues.push({
                start: filter.start,
                end: filter.end
              })
            } else if (filter.filterType === FILTER_TYPE_OR) {
              filter.filters.forEach((positiveFilter) => {
                if (positiveFilter.filterType === FILTER_TYPE_AND) {
                  selectedValuesSet.add(
                    filtersToValue(positiveFilter.filters, false)
                  )
                }
              })
            } else if (filter.filterType === FILTER_TYPE_AND) {
              filter.filters.forEach((negativeFilter) => {
                if (negativeFilter.filterType === FILTER_TYPE_OR) {
                  negativeSelectedStoreSet.add(
                    filtersToValue(negativeFilter.filters, true)
                  )
                }
              })
            }
          })
        }
      }
    )
  }

  const selectedValues: ValueType[] = Array.from(selectedValuesSet)
  const negativeSelectedValues: ValueType[] = Array.from(
    negativeSelectedStoreSet
  )

  const enabled = ourCrossfilter.enabled
  return {
    enabled,
    selectedValues,
    negativeSelectedValues,
    rangeValues
  }
}

/**
 * @param expr A DimensionExpression object
 * @returns either the custom sql or the column name
 */
function dimExprToStr(expr: DimensionExpression): string {
  if (expr.type === CUSTOM_SQL_SELECTOR_TYPE) {
    return expr.sql
  } else {
    return expr.column.value
  }
}

/**
 * We do a little transform here to simplify the vega spec(s):
 * * Combine multiple dimensions (dimension0, dimension1, etc) into a single
 *   "dimension" field;
 * * Calculate a key into the groupByDimension table;
 * * Calculate which value to sort on;
 * * Copy dataSelectionIndex and measureIndex into the table.
 *
 * This function is run on the data per-layer.
 *
 * @param numDimensions The number of non-group-by dimensions
 * @param numMeasures The number of size measures
 * @param groupBy True if a group-by dimension is enabled
 * @param data The data to transform
 * @param dataSelectionIndex
 * @param sortColumn How to sort the data
 * @param isBinned True if binning is enabled
 * @returns a new data array, transformed as above
 */
export function transformData(
  dataSelection: ComboDataSelection,
  dataSelectionIndex: number,
  data: Array<Record<string, any>>,
  measureSettingsLookup: Record<string, MeasureSettings>,
  allOthers: boolean,
  allOthersSentinel: any,
  dimensionFormatter: (v: any) => string,
  dimensionScaler: (v: any) => any,
  paletteMappings: Array<any> = [],
  measureTopNOptions: VegaCustomizableTopNOptions[] = []
): TransformedDatum[] {
  const numDimensions = dataSelection.dimensions.xAxis.length
  const numMeasures = dataSelection.measures.size.length
  const keySuffix = String(dataSelectionIndex)
  const hasCategoricalColoring = chartHasCategoricalColoring({
    chartType: CHART_TYPES.VEGA_COMBO,
    colorType: "",
    colorMeasure: dataSelection.measures?.color
  })

  const transformedData = []

  for (const d of data) {
    // All others can be represented two different ways: if allOthersSentinel
    // is undefined, then "All Others" is when dimensionColor is null and
    // !dimensionColorIsNotAllOthers is true. Otherwise, if allOthersSentinel
    // is not undefined, then "All Others" is when dimensionColor ===
    // allOthersSentinel
    const hasDimensionColor = "dimensionColor" in d
    const belongsInAllOthers =
      allOthers &&
      (hasDimensionColor
        ? allOthersSentinel === undefined
          ? d.dimensionColor === null && !d.dimensionColorIsNotAllOthers
          : d.dimensionColor === allOthersSentinel
        : true) // corner case: top-n with all series disabled

    const annotationKeyObj: AnnotationKey = {
      dataSource: dataSelection.table?.name || "",
      dimensions: {
        [dimExprToStr(dataSelection.dimensions.xAxis[0])]: dimensionScaler(
          d.dimension0
        )
      }
    }
    const dimensions = [d.dimension0]
    let dimensionFormatted = dimensionFormatter(d.dimension0)

    for (let i = 1; i < numDimensions; i += 1) {
      const dim = d[`dimension${i}`]
      dimensions.push(dim)
      dimensionFormatted += ` / ${dimensionFormatter(dim)}`
      annotationKeyObj.dimensions[
        dimExprToStr(dataSelection.dimensions.xAxis[i])
      ] = dimensionScaler(dim)
    }

    if (dataSelection.dimensions.color) {
      annotationKeyObj.dimensions[
        dimExprToStr(dataSelection.dimensions.color)
      ] = belongsInAllOthers ? { allOthers: true } : d.dimensionColor
    }

    const dimension = JSON.stringify(dimensions)
    for (let i = 0; i < numMeasures; i += 1) {
      // the annotation helpers accomodate an undefined measure property.
      // generating the same measure expression here as the query builder is difficult
      // That code is found in query-building.ts (buildTimeLagExpr)
      // after glancing through the annotation code, the measure doesn't seem
      // to be of consequence. I apologize if that proves wrong
      annotationKeyObj.measure =
        dataSelection.measures.size[i].type === TIME_LAG_EXPRESSION_TYPE
          ? undefined
          : measureToExprStr(dataSelection.measures.size[i])
      const annotationKey = buildAnnotationKey(annotationKeyObj)

      const measure = d[`measure${i}`]
      const rawMeasure = measure

      const measureKey = belongsInAllOthers
        ? `others${keySuffix}`
        : hasDimensionColor
        ? buildKey(d.dimensionColor, keySuffix)
        : `measure${i}_${keySuffix}`
      const measureSettings = measureSettingsLookup[measureKey]

      const colorMeasureSettings =
        measureTopNOptions[dataSelectionIndex]?.dynamicValues?.find(
          (dv) => dv.key === d.measureColor
        ) ?? {}

      if (
        measureSettings &&
        !measureSettings.disabled &&
        !colorMeasureSettings.disabled
      ) {
        const paletteMapping = paletteMappings.find(
          (pm) => pm.id === dataSelection.measures?.color?.paletteMappingId
        )
        transformedData.push({
          ...d,
          categoricalColor: hasCategoricalColoring
            ? getSavedColorOrDefault(
                d.measureColor,
                measureTopNOptions[dataSelectionIndex],
                paletteMapping
              )
            : null,
          categoricalMeasureValue: hasCategoricalColoring
            ? d.measureColor
            : null,
          measureColor: hasCategoricalColoring ? null : d.measureColor,
          dimension,
          dimensionFormatted,
          dimensions,
          measure,
          rawMeasure,
          measureKey,
          measureIndex: i,
          dataSelectionIndex,
          annotationKey
        })
      }
    }
  }

  return transformedData
}

/**
 * Calculate cumulative and/or percentage distributions
 * @param data The complete dataset from transformData()
 * @param primaryCumulativeDistributionEnabled True for CDF on primary axis
 * @param secondaryCumulativeDistributionEnabled True for CDF on secondary
 * @param primaryPercentageDistributionEnabled True for PDF on primary axis
 * @param secondaryPercentageDistributionEnabled True for PDF on secondary
 * @returns data with recalculated measure values for cdf/pdf
 */
export function calculateCdfPdf(
  data: TransformedDatum[],
  dataSelections: ComboDataSelection[],
  dimensionScaler: (v: any) => any,
  sortedDimensions: string[],
  formattedDimensions: Record<string, string>,
  measureSettingsLookup: Record<string, MeasureSettings>,
  primaryCumulativeDistributionEnabled: boolean,
  secondaryCumulativeDistributionEnabled: boolean,
  primaryPercentageDistributionEnabled: boolean,
  secondaryPercentageDistributionEnabled: boolean
): TransformedDatum[] {
  // this simplifies code below
  const cdfByAxis = {
    primary: primaryCumulativeDistributionEnabled,
    secondary: secondaryCumulativeDistributionEnabled
  }
  const pdfByAxis = {
    primary: primaryPercentageDistributionEnabled,
    secondary: secondaryPercentageDistributionEnabled
  }

  // Cumulative sum per measure - initialize to zeros
  const sums = Object.fromEntries(
    Object.keys(measureSettingsLookup).map((key) => [key, 0])
  )

  // calculate cdf
  if (cdfByAxis.primary || cdfByAxis.secondary) {
    // map sorted dimensions to their index
    const sortedDimensionLookup = zipObject(
      sortedDimensions,
      Array.from(sortedDimensions.keys())
    )

    // data will be our output - initialize to an empty array
    const originalData = data
    data = []

    // Organize data by measure and dimension for the axes that we're applying
    // cdf to. Any data for non-cdf axes goes straight into the new data array
    const dataByMeasure = Object.fromEntries(
      Object.values(measureSettingsLookup).flatMap(({ key, axis }) =>
        cdfByAxis[axis] ? [[key, new Array(sortedDimensions.length)]] : []
      )
    )
    originalData.forEach((datum) => {
      const key = datum.measureKey
      const measureSettings = measureSettingsLookup[key]
      if (measureSettings && cdfByAxis[measureSettings.axis]) {
        const dimIdx = sortedDimensionLookup[datum.dimension]
        dataByMeasure[key][dimIdx] = datum
      } else {
        sums[key] += datum.measure
        data.push(datum)
      }
    })

    // Calculate the cumulative sum, filling in gaps, for the data that we're
    // applying cdf to
    Object.keys(dataByMeasure).forEach((key) => {
      const dataForMeasure = dataByMeasure[key]
      let sum = 0
      for (let i = 0; i < sortedDimensions.length; i += 1) {
        if (dataForMeasure[i]) {
          // data exists - sum it and modify
          sum += dataForMeasure[i].measure
          dataForMeasure[i] = {
            ...dataForMeasure[i],
            measure: sum
          }
        } else {
          // Gap in data: fill gap. We use the previous datum (or the first
          // non-undefined datum if i = 0) as the basis for our fill
          const prev =
            i === 0
              ? dataForMeasure.find((d) => Boolean(d))
              : dataForMeasure[i - 1]
          if (!prev) {
            // No valid data for this measure at all? Bail ¯\_(ツ)_/¯
            delete dataByMeasure[key]
            break
          }

          // XXX: what should we do if a color measure is enabled? Should we
          // set measureColor to zero?
          const dimension = sortedDimensions[i]
          const dimensions = JSON.parse(dimension)
          const dataSelection = dataSelections[prev.dataSelectionIndex]
          const annotationDimensions = JSON.parse(
            prev.annotationKey.annotationDimensions
          )
          dataSelection.dimensions.xAxis.forEach((dim, dimidx) => {
            annotationDimensions[dimExprToStr(dim)] = dimensionScaler(
              dimensions[dimidx]
            )
          })
          const annotationKey = {
            ...prev.annotationKey,
            annotationDimensions: JSON.stringify(annotationDimensions)
          }
          dataForMeasure[i] = {
            ...prev,
            dimension,
            dimensions,
            dimensionFormatted: formattedDimensions[dimension],
            measureKey: key,
            measure: sum,
            rawMeasure: 0,
            annotationKey
          }
        }
      }
      sums[key] = sum
    })

    // copy completed cdf data into data
    data = Object.values(dataByMeasure).reduce((acc, d) => acc.concat(d), data)
  } else {
    // if cdf is not enabled, we just need to calculate the sums for pdf below
    data.forEach(({ measureKey: key, measure }) => {
      sums[key] = (sums[key] || 0) + measure
    })
  }

  // calculate pdf
  if (pdfByAxis.primary || pdfByAxis.secondary) {
    data = data.map((datum) => {
      const key = datum.measureKey
      const measureSettings = measureSettingsLookup[key]
      if (measureSettings && pdfByAxis[measureSettings.axis]) {
        if (sums[key]) {
          return {
            ...datum,
            measure: datum.measure / sums[key]
          }
        } else {
          // divide by zero?
          return { ...datum, measure: 0 }
        }
      }
      return datum
    })
  }

  return data
}

/**
 * Separate data by axis, then separate each axis into bars and lines. Areas
 * are handled separately.
 * @param data The data to operate on
 * @param measureSettingsLookup Measure settings, keyed by measureKey
 * @returns An object with data separated by "primary" and "secondary" axis (if
 * any data exists for the given axis). Each axis is further divided into "bar"
 * and "line" (if any data exists of that type).
 */
export function separateData(
  data: Array<Record<string, any>>,
  measureSettingsLookup: Record<string, MeasureSettings>,
  connectNullsAcrossGaps = false
): DataByAxisAndVisualization {
  return data.reduce((acc, datum) => {
    const settings = measureSettingsLookup[datum.measureKey]
    if (settings) {
      const isLineOrArea =
        settings.visualizeAs === "line" || settings.visualizeAs === "area"

      // Null measures on line/area would reach Vega with measureMax=null,
      // producing "null" in the SVG path via scale(axis, null). Mark those
      // rows as gaps so the path signal's datum.gap branch returns an empty
      // path, matching how we treat dimensions absent from the data entirely.
      const isNullMeasure =
        isLineOrArea &&
        (datum.measure === null || datum.measure === undefined)

      // When connectNullsAcrossGaps is enabled, drop null-measure rows on
      // line/area entirely so Vega's lag/lead window transform on lineTable
      // reaches across to the next real data point and the path connects.
      if (connectNullsAcrossGaps && isNullMeasure) {
        return acc
      }

      let axis = acc[settings.axis]
      if (!axis) {
        axis = {}
        acc[settings.axis] = axis
      }

      let visualizeAs = axis[settings.visualizeAs]
      if (!visualizeAs) {
        visualizeAs = []
        axis[settings.visualizeAs] = visualizeAs
      }

      let measureMin = isNullMeasure ? 0 : datum.measure
      let measureMax = isNullMeasure ? 0 : datum.measure
      if (settings.visualizeAs === "bar") {
        measureMin = Math.min(measureMin, 0)
        measureMax = Math.max(measureMax, 0)
      }

      visualizeAs.push({
        ...datum,
        gap: datum.gap || isNullMeasure,
        measureMin,
        measureMax
      })
    }

    return acc
  }, {} as DataByAxisAndVisualization)
}

/**
 * Lines (and areas, which are computed later based on line data) need their
 * gaps filled with datum that declare that they are undefined (ie, property
 * `gap` is true) so that the gap can be rendered correctly by vega later on.
 * @param data The data separated by axis and visualization
 * @param sortedDimensions An array of all dimensions
 * @returns the data with gaps in the lines filled with objects that have the
 *   `gap` property set to true
 */
export function fillLineGaps(
  data: DataByAxisAndVisualization,
  sortedDimensions: string[],
  dimensionsFormatted: Record<string, string>,
  measureSettingsLookup: Record<string, MeasureSettings>,
  connectNullsAcrossGaps = false
): DataByAxisAndVisualization {
  // Skip filling missing-dimension rows: Vega's lag/lead window transform on
  // lineTable will reach across to the next real data point and the path will
  // connect across the gap.
  if (connectNullsAcrossGaps) {
    return data
  }
  return Object.fromEntries(
    Object.entries(data).map(([axis, dataByVisualization]) => {
      if (dataByVisualization?.line) {
        // maps a measure key to a set of dimensions which exists in the
        // data... this is then used to fill in the missing data
        const hasMeasures: Record<string, Set<string>> = {}
        const line = [...dataByVisualization.line]
        line.forEach((datum) => {
          let hasDims = hasMeasures[datum.measureKey]
          if (!hasDims) {
            hasDims = new Set<string>()
            hasMeasures[datum.measureKey] = hasDims
          }
          hasDims.add(datum.dimension)
        })

        // if any measure is missing completely, we don't need to fill that in;
        // we're only worried about gaps in measures that have data
        Object.entries(hasMeasures).forEach(([measureKey, hasDims]) => {
          const measureSettings = measureSettingsLookup[measureKey]
          sortedDimensions
            .filter((d) => !hasDims.has(d))
            .forEach((dimension) => {
              line.push({
                gap: true,
                dataSelectionIndex: measureSettings.dataSelectionIndex || 0,
                measureIndex: measureSettings.measureIndex || 0,
                dimension,
                dimensions: JSON.parse(dimension),
                dimensionFormatted: dimensionsFormatted[dimension],
                measureKey,
                measure: 0,
                rawMeasure: 0,
                measureMin: 0,
                measureMax: 0,
                axis
              })
            })
        })

        dataByVisualization = {
          ...dataByVisualization,
          line
        }
      }
      return [axis, dataByVisualization]
    })
  )
}

/**
 * For line segments to draw correctly for all sort options, we need to add a
 * sortable value to be consumed by the vega window transform that we use to
 * calculate line segments
 * @param data The data separated by axis and visualization
 * @param sortedDimensions An array of all dimensions
 * @returns the data with sortableVal added to lines
 */
export function addSortableVal(
  data: DataByAxisAndVisualization,
  sortedDimensions: string[]
): DataByAxisAndVisualization {
  const sortedDimensionMap = new Map()
  sortedDimensions.forEach((d, i) => sortedDimensionMap.set(d, i))

  return Object.fromEntries(
    Object.entries(data).map(([axis, dataByVisualization]) => {
      if (dataByVisualization?.line) {
        const line = dataByVisualization.line.map((l) => ({
          ...l,
          sortableVal: sortedDimensionMap.get(l.dimension)
        }))

        dataByVisualization = {
          ...dataByVisualization,
          line
        }
      }
      return [axis, dataByVisualization]
    })
  )
}

/**
 * Calculate measureMin/measureMax for stacking data (ex: bars in "stacked" or
 * "percent" mode, area charts).
 * @param data The data to manipulate
 * @param measureSettingsLookup Measure settings, used to order each stack
 * @param percent If true, normalize each stack into a "percent" view, ie, min
 *   of 0, max of 100.
 * @returns an array of data with computed measureMin/measureMax values
 */
export function calculateStackedDimensions(
  data: Datum[],
  measureSettingsLookup: Record<string, MeasureSettings>,
  percent: boolean
): Datum[] {
  // group data by group-by dimension
  const rowsByGroup = new Map<string, Datum[]>()
  data.forEach((d) => {
    let group = rowsByGroup.get(d.dimension)
    if (!group) {
      group = []
      rowsByGroup.set(d.dimension, group)
    }
    group.push(d)
  })

  // for each group, calculate the measureMin and measureMax
  const transformedData: Datum[] = []
  for (const group of rowsByGroup.values()) {
    const sortedGroup = group.sort((a, b) =>
      measureSettingsLookup[a.measureKey] && measureSettingsLookup[b.measureKey]
        ? measureSettingsLookup[a.measureKey].order -
          measureSettingsLookup[b.measureKey].order
        : 0
    )

    if (percent) {
      let scale =
        1.0 /
        sortedGroup.reduce((sum, { measure }) => sum + Math.abs(measure), 0.0)
      if (!Number.isFinite(scale)) {
        scale = 0
      }

      let last = 0
      let v = 0
      sortedGroup.forEach((d) => {
        if (d.gap) {
          transformedData.push(d)
        }

        const measure = scale * Math.abs(d.measure)
        transformedData.push({
          ...d,
          measure,
          measureMin: last,
          measureMax: last = scale * (v += Math.abs(d.measure))
        })
      })
    } else {
      let lastPos = 0
      let lastNeg = 0
      sortedGroup.forEach((d) => {
        if (d.gap) {
          transformedData.push(d)
        }

        if (d.measure < 0) {
          transformedData.push({
            ...d,
            measureMax: lastNeg,
            measureMin: lastNeg += d.measure
          })
        } else {
          transformedData.push({
            ...d,
            measureMin: lastPos,
            measureMax: lastPos += d.measure
          })
        }
      })
    }
  }

  return transformedData
}

/**
 * Adds areas to each axis which means the lines will need to be stacked first
 * (ie, we'll calculate the measureMin/measureMax). We'll also hide any lines
 * that should be hidden by removing them from the data.
 * @param data The data to manipulate
 * @param measureSettingsLookup Measure settings, used to order each stack
 * @param percent If true, normalize each stack into a "percent" view, ie, min
 *   of 0, max of 100.
 * @returns data by axis and visualization, but all lines have been stacked,
 *   data for area plots have been added, and hidden lines have been removed
 */
export function stackedData(
  data: DataByAxisAndVisualization,
  measureSettingsLookup: Record<string, MeasureSettings>,
  percent: boolean
): DataByAxisAndVisualization {
  const hasBars = Object.values(data).some((byVisualization) =>
    Boolean(byVisualization?.bar)
  )
  return Object.fromEntries(
    Object.entries(data).map(([axis, byVisualization]) => {
      if (byVisualization && byVisualization.bar) {
        const bar =
          byVisualization.bar &&
          calculateStackedDimensions(
            byVisualization.bar,
            measureSettingsLookup,
            percent
          )

        return [
          axis,
          {
            ...byVisualization,
            bar
          }
        ]
      } else if (!hasBars) {
        const area =
          byVisualization &&
          byVisualization.line &&
          calculateStackedDimensions(
            byVisualization.line,
            measureSettingsLookup,
            percent
          )

        const line =
          area &&
          area.filter(
            ({ measureKey }) => !measureSettingsLookup[measureKey].hideLine
          )

        return [
          axis,
          {
            ...byVisualization,
            area,
            line
          }
        ]
      } else {
        return [axis, byVisualization]
      }
    })
  )
}

/**
 * Calculate the extents per axis
 * @param data Data by axis and visualization type
 * @returns an object mapping axis to extents ([min, max])
 */
export function extentsByAxis(
  data?: DataByAxisAndVisualization,
  scaleType?: ScaleType
): ExtentsByAxis | undefined {
  if (!data) {
    return undefined
  }

  return {
    primary: data.primary && extentByAxis(data.primary, { scaleType }),
    secondary: data.secondary && extentByAxis(data.secondary, { scaleType })
  }
}

/**
 * Combines all bar and line data across axes.
 * @param data Data by axis and visualization type
 * @returns an object of data by visualization type (bar, line)
 */
export function combineAxes(
  data?: DataByAxisAndVisualization
): DataByVisualization | undefined {
  if (!data) {
    return undefined
  }

  return Object.entries(data).reduce((acc, [axis, byVisualization]) => {
    Object.entries(byVisualization || {}).forEach(([visualizeAs, thisdata]) => {
      let accdata = acc[visualizeAs as keyof DataByVisualization]
      if (!accdata) {
        accdata = []
        acc[visualizeAs as keyof DataByVisualization] = accdata
      }

      ;(thisdata || []).forEach((datum) => {
        accdata.push({
          ...datum,
          axis
        })
      })
    })
    return acc
  }, {} as DataByVisualization)
}

// used for calculating the min/max of the color measure
export function getColorMeasureMinMax(
  data: TransformedDatum[]
): [number, number] | null {
  const measures = data.flatMap((d) =>
    typeof d.measureColor === "number" ? [d.measureColor] : []
  )
  if (measures.length === 0) {
    return null
  }

  return measures.reduce(([a, b], d) => [Math.min(a, d), Math.max(b, d)], [
    measures[0],
    measures[0]
  ])
}

export function fillTooltipData(
  tooltipData: Record<string, TooltipData>,
  data: DataByVisualization,
  measureSettingsLookup: Record<string, MeasureSettings>,
  measureExtents?: number[],
  rawMeasureFormat?: string | null,
  measureFormat?: string | null,
  colorMeasureScale?: (m: number) => string,
  dataSelections: ComboDataSelection[]
) {
  const customFormatters = Object.values(CUSTOM_FORMATTER_TYPE)
  // For compatibility with old charts, if there is no set format, display the
  // entire value only formatted for the locale
  let rawFormat = null
  if (customFormatters.includes(rawMeasureFormat as CUSTOM_FORMATTER_TYPE)) {
    rawFormat = immerseAutoFormatter(rawMeasureFormat as CUSTOM_FORMATTER_TYPE)
  } else {
    rawFormat = rawMeasureFormat
      ? vega
          .scale("customlinear")()
          .domain(measureExtents || [0, 1])
          .tickFormat(null, rawMeasureFormat)
      : (d) => (d?.toLocaleString ? d.toLocaleString("en-us") : String(d))
  }
  let format = null
  if (customFormatters.includes(measureFormat as CUSTOM_FORMATTER_TYPE)) {
    format = immerseAutoFormatter(measureFormat as CUSTOM_FORMATTER_TYPE)
  } else {
    format = measureFormat
      ? vega
          .scale("customlinear")()
          .domain(measureExtents || [0, 1])
          .tickFormat(null, measureFormat)
      : (d) => (d?.toLocaleString ? d.toLocaleString("en-us") : String(d))
  }

  // data.area and data.line will contain roughly the same data depending on
  // settings so we only need to use one or the other. data.area is the most
  // "complete", if it's set, because some lines can be "hidden" (ie, removed
  // from the data), so we prefer that.
  const allData = (data.bar || []).concat(data.area || data.line || [])
  allData.forEach((datum) => {
    const group = measureSettingsLookup[datum.measureKey]
    if (group && !datum.gap) {
      const colorMeasureData =
        dataSelections[group.dataSelectionIndex].measures.color
      const dimData = tooltipData[datum.dimension]
      if (dimData) {
        const isCategoricalColorMeasure = Boolean(
          colorMeasureData?.aggregate === "Mode"
        )
        let color = "#27aeef"
        if (isCategoricalColorMeasure) {
          color = datum.categoricalColor
        } else if (
          group.applyColorMeasure &&
          colorMeasureScale &&
          datum.measureColor
        ) {
          color = colorMeasureScale(datum.measureColor)
        } else if (group.color) {
          color = group.color
        }

        dimData.measures.push({
          label: group.label,
          color,
          value: format(datum.measure),
          rawValue: rawFormat(datum.rawMeasure),
          order: group.order,
          dataSelectionIndex: datum.dataSelectionIndex,
          dataSource:
            getDisplayOrParameterName(
              dataSelections[group.dataSelectionIndex].table?.name
            ) || "",
          colorMeasureAggregate: colorMeasureData?.aggregate || null,
          colorMeasureValue: isCategoricalColorMeasure
            ? datum.categoricalMeasureValue
            : datum.measureColor
        })
      }
    }
  })
}

/**
 * Vega mutates the data passed into it to keep track of some state. As a final
 * step before passing data to vega, we clone each row so that vega's mutations
 * don't end up finding their way back here
 * @param data The final data hash being passed to vega
 * @returns the same data, cloned
 */
export function cloneData<T extends Record<string, Array<any>>>(data: T): T {
  return Object.fromEntries(
    Object.entries(data).map(([key, values]) => [
      key,
      values && values.map((v) => ({ ...v }))
    ])
  ) as T
}

/**
 * Given a domain min/max, move the values to begin and end on bins.
 * @param minmax The domain min/max
 * @param timeUnit Time unit, if binned on time
 * @returns [min, max] or null
 */
export function binnifyDimensionDomain(
  minmax: ComputedMinMax | null,
  timeUnit: BinnedTimeUnit | null
): [number, number] | null {
  if (!minmax) {
    return null
  }

  const domain: [number, number] = [minmax.min, minmax.max]
  if (timeUnit) {
    let interval = timeUnit as unitOfTime.DurationConstructor
    let multiple = 1
    if (timeUnit === "century") {
      multiple = 100
      interval = "year"
    } else if (timeUnit === "decade") {
      multiple = 10
      interval = "year"
    }

    const start = moment.utc(domain[0])
    if (interval === "week") {
      const startOfWeek = getFeatureFlag(START_OF_WEEK)
      const dayOfWeek = start.day()
      let wanted = 1 // Monday
      if (startOfWeek === "week_sunday") {
        wanted = 0
      } else if (startOfWeek === "week_saturday") {
        wanted = 6
      }

      start.startOf("day")
      if (dayOfWeek > wanted) {
        start.day(wanted)
      } else if (dayOfWeek < wanted) {
        start.day(wanted - 7)
      }
    } else {
      start.startOf(interval)

      if (multiple > 1) {
        let v = start.get(interval)
        v -= v % multiple
        if (timeUnit !== "decade") {
          // For anything but decade, we need to add 1 here
          v += 1
        }
        start.set(interval, v)
      }
    }

    const end = moment.utc(domain[1])
    if (interval === "week") {
      const startOfWeek = getFeatureFlag(START_OF_WEEK)
      const dayOfWeek = end.day()
      let wanted = 0 // Week ends on Sunday
      if (startOfWeek === "week_sunday") {
        wanted = 6
      } else if (startOfWeek === "week_saturday") {
        wanted = 5
      }

      end.endOf("day")
      if (dayOfWeek > wanted) {
        end.day(7 + wanted)
      } else if (dayOfWeek < wanted) {
        end.day(wanted)
      }
    } else {
      end.endOf(interval)

      if (multiple > 1) {
        let v = end.get(interval)
        if (timeUnit === "decade") {
          // Decades go from '0 to '9
          v += 9 - (v % 10)
        } else {
          // Everything else goes from '1 to '0
          const adj = multiple - (v % multiple)
          if (adj < multiple) {
            v += adj
          }
        }
        end.set(interval, v)
      }
    }

    domain[0] = start.valueOf()
    domain[1] = end.valueOf()
  }
  return domain
}

/**
 * Build crossfilters
 * @param id The chart ID
 * @param crossfilterName Name of the crossfilter to create/edit
 * @param dimensionColumnsByTable Map of table to dimension columns
 * @param values The values to filter by
 * @param extract The timeBin to extract, if enabled; undefined otherwise
 */
const buildFilters = (
  id: string,
  crossfilterName: string,
  data: TransformedDatum[],
  dataSelections: ComboDataSelection[],
  values: ValueWithOp[],
  {
    bins,
    scaled: binsScaled
  }: {
    bins?: (number | Date)[]
    scaled?: (number | Date)[]
  },
  extract?: string
) => {
  // If our dimension is binned, but not continuous (ex: if sorted by something
  // other than the dimension), we need to create range filters for each
  // selected bar. `bins` will be an array of bin lower-bounds. We create a
  // lookup mapping a lower bound to an upper bound.
  let binLookup: Record<string, (number | Date)[]> | null = null
  if (bins && binsScaled) {
    // the last bar doesn't have an upper bound
    const binPairs = []
    binPairs[bins.length - 1] = [binsScaled[bins.length - 1]]
    for (let i = bins.length - 2; i >= 0; i -= 1) {
      binPairs[i] = [binsScaled[i], binsScaled[i + 1]]
    }

    binLookup = zipObject(bins.map(stringify), binPairs)
  }
  // Each filter value may correspond to multiple data rows from the data if we
  // have multiple layers. Additionally, if a layer has multiple base
  // dimensions, the filter value will be something like "dim1 / dim2 / ..."
  // and we need to match those dimensions to the corresponding columns.
  const filtersByDataSource = {} as Record<
    string,
    {
      positiveFilters: Filter[]
      negativeFilters: Filter[]
    }
  >

  values.forEach((value) => {
    // find all data matching this dimension and build corresponding filters
    const matchingData = data.filter((datum) => datum.dimension === value.value)
    matchingData.forEach((datum) => {
      const {
        dimensions: { xAxis: baseDimensions }
      } = dataSelections[datum.dataSelectionIndex]
      // Confusing that this property is table in the dim, but this is
      // the datasource, which can be a param ${stuff}. The column within the baseDimension
      // has the columns source table
      const dataSource = baseDimensions[0].table
      let filtersForDataSource = filtersByDataSource[dataSource]
      if (!filtersForDataSource) {
        filtersForDataSource = {
          positiveFilters: [],
          negativeFilters: []
        }
        filtersByDataSource[dataSource] = filtersForDataSource
      }

      // create a filter for each base dimension
      const filters = baseDimensions.flatMap((dim, idx) => {
        const [columnExpression, columnType, dataTypeIsArray, table] =
          dim.type === "column"
            ? [
                dim.column.value,
                dim.column.type,
                dim.column.is_array,
                dim.column.table
              ]
            : // Custom SQL dimensions
              [dim.sql, dim.column?.type, false, dim.table]
        if (!columnType) {
          return [] as Filter[]
        }

        if (datum.dimensions[idx] === null) {
          if (value.op === "=") {
            return [
              nullFilter(table, dataSource, columnExpression, columnType, {
                extract,
                dataTypeIsArray
              })
            ]
          } else {
            return [
              notNullFilter(table, dataSource, columnExpression, columnType, {
                extract,
                dataTypeIsArray
              })
            ]
          }
        } else if (binLookup) {
          const [lowerBound, upperBound] = binLookup[
            stringify(datum.dimensions[idx])
          ]
          const lowFilter = simpleFilter(
            table,
            dataSource,
            columnExpression,
            columnType,
            value.op === "=" ? ">=" : "<",
            lowerBound,
            { extract, dataTypeIsArray }
          )

          // the last bar doesn't have an upper bound
          if (upperBound) {
            return [
              (value.op === "=" ? andFilter : orFilter)([
                lowFilter,
                simpleFilter(
                  table,
                  dataSource,
                  columnExpression,
                  columnType,
                  value.op === "=" ? "<" : ">=",
                  upperBound,
                  { extract, dataTypeIsArray }
                )
              ])
            ]
          } else {
            return [lowFilter]
          }
        }

        return [
          simpleFilter(
            table,
            dataSource,
            columnExpression,
            columnType,
            value.op,
            datum.dimensions[idx],
            { extract, dataTypeIsArray }
          )
        ]
      })

      // Positive filters will end up being something like:
      //   (col1 = dim1 AND col2 = dim2) OR ...
      // Negative filters will be the boolean opposite:
      //   (col1 <> dim1 OR col2 <> dim2) AND ...
      if (value.op === "=") {
        filtersForDataSource.positiveFilters.push(andFilter(filters))
      } else {
        filtersForDataSource.negativeFilters.push(orFilter(filters))
      }
    })
  })

  // finally, for each datasource, we need to AND all the filters together
  const finalFiltersByDataSource = Object.fromEntries(
    Object.entries(filtersByDataSource).flatMap(
      ([ds, { positiveFilters, negativeFilters }]) => {
        const combinedFilters = []
        if (positiveFilters.length > 0) {
          combinedFilters.push(orFilter(positiveFilters))
        }
        if (negativeFilters.length > 0) {
          combinedFilters.push(andFilter(negativeFilters))
        }
        if (combinedFilters.length > 0) {
          return [[ds, andFilter(combinedFilters)]]
        } else {
          return []
        }
      }
    )
  )

  if (Object.keys(finalFiltersByDataSource).length === 0) {
    store.dispatch(clearFilterByName(crossfilterName))
  } else {
    const filter = multiSourceFilter(finalFiltersByDataSource)
    store.dispatch(setCrossFilter(filter, id, undefined, crossfilterName))
  }
}

const buildRangeFilters = (
  id: string,
  crossfilterName: string,
  dataSelections: ComboDataSelection[],
  range: [number | string | Date, number | string | Date]
) => {
  // build filters
  const filtersByDataSource = Object.fromEntries(
    dataSelections.map(({ dimensions: { xAxis: baseDimensions } }) => [
      baseDimensions[0].table,
      andFilter(
        baseDimensions.flatMap((dim) => {
          const [columnExpression, columnType, dataTypeIsArray] =
            dim.type === "column"
              ? [dim.column.value, dim.column.type, dim.column.is_array]
              : [dim.sql, dim.column?.type, false]
          if (columnType) {
            return [
              betweenFilter(
                dim.column?.table || dim.table,
                dim.table,
                columnExpression,
                columnType,
                range[0],
                range[1],
                { dataTypeIsArray }
              )
            ]
          } else {
            return [] as Filter[]
          }
        })
      )
    ])
  )

  const filter = multiSourceFilter(filtersByDataSource)
  store.dispatch(setCrossFilter(filter, id, undefined, crossfilterName))
}

/**
 * Filters on the range chart modify focus chart extents even if the min/max
 * is locked. Locked min/max should stay locked, but update the values.
 */
const overwriteManualMinMax = (
  chartId: string,
  range: number[],
  binSettings: BinnedNumericDimensionScaleSettings
) => {
  if (binSettings.manualMin !== null) {
    store.dispatch(setBinningManualMin(chartId, range[0]))
  }

  if (binSettings.manualMax !== null) {
    store.dispatch(setBinningManualMax(chartId, range[1]))
  }
}

/**
 * Function to retrieve the size and position of the chart body for annotations
 * support.
 */
const getChartBodySizeAndPosition: GetChartBodySizeAndPosition = (
  chartBodyNode
) => {
  // If the data requires scrolling, the chart body element will be bigger
  // than it appears, but the first path.background element will be the right
  // size.
  const elem = chartBodyNode.querySelector("path.background")
  if (elem) {
    return elem.getBoundingClientRect()
  }
  return chartBodyNode.getBoundingClientRect()
}

// Selectors that don't require memoization can live outside mapStateToProps.
// What selectors don't require memoization? Well, if it's just a react
// property or some *simple* value from redux, it probably doesn't require
// memoization. If it is computed, it should probably be memoized.
//
// What is a "simple" value? A number, string, boolean, etc. Arrays and Objects
// require some thought: if you are only interested in something nested inside
// the array or object, passing the entire array/object to a createSelector
// will have the unfortunate side-effect of causing the selector to recompute
// everytime anything inside the array or object changes. That's probably
// unnecessary. Probably best to create a selector here that pulls out the
// exact data you need, rather than the higher-level array or object.
type Props = {
  dashboardId: string
  tabId: string
  id: string
  chart: VegaComboChart
  width: number
  height: number
  parameterValues: Record<string, string>
  legendHeight?: number
  isRangeChart?: boolean
  gridEnabled?: boolean
  barValuesEnabled?: boolean
  communicateZoom?: (range: ZoomFilterValue | null) => void
  zoomTo?: ZoomFilterValue | null
}

export const mapStateToProps = () => {
  const selectors = new ForwardSelect<any, Props>()
  let forceFetch = false
  let lastForcedDataFetch: any = null
  let lastParameterValuesInUse: Record<string, string> = {}
  let lastCrossfilterTokenFilters: any = null

  const vegaChannel = new VegaChannel()
  let useDebouncedSetSignalValues = false
  const debouncedSetSignalValues = debounce((signals) => {
    vegaChannel.setSignalValues(signals)
    useDebouncedSetSignalValues = false
  }, SET_SIGNAL_DEBOUNCE)
  const setData = (data) => {
    debouncedSetSignalValues.flush()
    vegaChannel.setData(data)
  }

  // debounce without a "wait" time is essentially the same as setTimeout(func,
  // 0) - we need this to avoid a react warning about trying to render a
  // component from another component
  const debouncedFetchData = debounce(
    (dashboardId, tabId, id, querySpec, isEditingChart) => {
      store.dispatch(
        fetchData(dashboardId, tabId, id, querySpec, isEditingChart, forceFetch)
      )
      forceFetch = false
    }
  )

  const dashboardIdSelector = selectors.createSelector(
    "dashboardId",
    (_, { dashboardId }) => dashboardId
  )
  const tabIdSelector = selectors.createSelector(
    "tabId",
    (_, { tabId }) => tabId
  )
  const idSelector = selectors.createSelector("id", (_, { id }) => id)
  const chartDataSelector = selectors.createSelector(
    "chartData",
    (_, { chart: { data } }) => data as VegaComboData
  )
  const lastStreamingDataRequestSelector = selectors.createSelector(
    "lastStreamingDataRequest",
    ({
      dashboard: {
        streaming: { last_request }
      }
    }) => last_request
  )
  const heightSelector = selectors.createSelector(
    "height",
    (_, { chart, height }) => (height ? height : chart.height)
  )
  const legendHeightSelector = selectors.createSelector(
    "legendHeight",
    (_, { legendHeight }) => legendHeight
  )
  const isRangeChartSelector = selectors.createSelector(
    "isRangeChart",
    (_, { isRangeChart }) => Boolean(isRangeChart)
  )
  const gridEnabledSelector = selectors.createSelector(
    "gridEnabled",
    (_, { chart }) => Boolean(isGridEnabled(chart))
  )
  const barValuesEnabledSelector = selectors.createSelector(
    "barValuesEnabled",
    (_, { chart }) => Boolean(chart.barValuesEnabled)
  )
  const rangeChartEnabledSelector = selectors.createSelector(
    "rangeChartEnabled",
    (_, { chart }) => Boolean(chart.rangeChartEnabled)
  )
  const isEditingChartSelector = selectors.createSelector(
    "isEditingChart",
    ({ chartEditor }): boolean => chartEditor.editing
  )
  const binSettingsSelector = selectors.createSelector(
    "binSettings",
    (_, { chart: { binSettings } }): BaseDimensionScaleSettings | null =>
      binSettings
  )
  const timeLagSettingsSelector = selectors.createSelector(
    "timeLagSettings",
    (_, { chart: { timeLagSettings } }): TimeLagSettings | null =>
      timeLagSettings
  )
  const parameterValuesForChartSelector = selectors.createSelector(
    "parameterValuesForChart",
    (_, { parameterValues }) => parameterValues,
    { equal: isEqual }
  )
  const crossfilterTokensSelector = selectors.createSelector(
    "crossfilterTokens",
    ({ parameters: { crossfilterTokens } }, { tabId }) =>
      crossfilterTokens?.[tabId] || []
  )

  const dataSelectionsSelector = selectors.createSelector(
    "dataSelections",
    (_, { chart: { dataSelections } }) => dataSelections
  )
  const numberOfGroupsSelector = selectors.createSelector(
    "numberOfGroups",
    (_, { chart: { numberOfGroups } }) => numberOfGroups
  )
  const showNullDimensionsSelector = selectors.createSelector(
    "showNullDimensions",
    (_, { chart: { showNullDimensions } }) => showNullDimensions
  )
  const connectNullsAcrossGapsSelector = selectors.createSelector(
    "connectNullsAcrossGaps",
    (_, { chart: { connectNullsAcrossGaps } }) =>
      Boolean(connectNullsAcrossGaps)
  )
  const sortColumnSelector = selectors.createSelector(
    "sortColumn",
    (_, { chart: { vegaSortColumn } }) => vegaSortColumn
  )
  const omnifiltersSelector = selectors.createSelector(
    "omnifilters",
    ({ omnifilters }): FilterMetadata[] => omnifilters
  )
  const crossLinksSelector = selectors.createSelector(
    "crossLinks",
    ({ crossLinks }): CrossLink[] => crossLinks
  )
  const layerLegendPinSelector = selectors.createSelector(
    "layerLegendPin",
    (_, { chart }) => Boolean(chart.layersLegendPinned)
  )
  const uiConfigStylesSelector = selectors.createSelector(
    "uiConfigStyles",
    (state) => getUserConfigurableUISettings(state)
  )
  const shiftToZoomSelector = selectors.createSelector(
    "shiftToZoom",
    (_, { chart: { shiftToZoom } }) => Boolean(shiftToZoom)
  )
  const collapsedLegendLayersSelector = selectors.createSelector(
    "collapsedLegendLayers",
    (_, { chart }) => chart.collapsedLegendLayers
  )
  const zoomToSelector = selectors.createSelector(
    "zoomTo",
    (_, { zoomTo }) => zoomTo
  )
  const rawCommunicateZoomSelector = selectors.createSelector(
    "rawCommunicateZoom",
    (_, { communicateZoom }) => communicateZoom
  )

  const rawOrientationSelector = selectors.createSelector(
    "rawOrientation",
    (
      _,
      {
        chart: {
          presentation: { orientation }
        }
      }
    ) => orientation
  )
  const rawGroupingModeSelector = selectors.createSelector(
    "rawGroupingMode",
    (
      _,
      {
        chart: {
          presentation: {
            baseDimensionAxis: { groupingMode }
          }
        }
      }
    ) => groupingMode
  )
  const rawBaseDimensionTitleSelector = selectors.createSelector(
    "rawBaseDimensionTitle",
    (
      _,
      {
        chart: {
          presentation: {
            baseDimensionAxis: { title }
          }
        }
      }
    ) => title
  )
  const rawPrimaryMeasureTitleSelector = selectors.createSelector(
    "rawPrimaryMeasureTitle",
    (
      _,
      {
        chart: {
          presentation: {
            sizeMeasurePrimaryAxis: { title }
          }
        }
      }
    ) => title
  )
  const rawSecondaryMeasureTitleSelector = selectors.createSelector(
    "rawSecondaryMeasureTitle",
    (
      _,
      {
        chart: {
          presentation: {
            sizeMeasureSecondaryAxis: { title }
          }
        }
      }
    ) => title
  )
  const primaryCumulativeDistributionEnabledSelector = selectors.createSelector(
    "primaryCumulativeDistributionEnabled",
    (
      _,
      {
        chart: {
          presentation: {
            sizeMeasurePrimaryAxis: { cumulativeDistributionEnabled }
          }
        }
      }
    ) => cumulativeDistributionEnabled
  )
  const primaryPercentageDistributionEnabledSelector = selectors.createSelector(
    "primaryPercentageDistributionEnabled",
    (
      _,
      {
        chart: {
          presentation: {
            sizeMeasurePrimaryAxis: { percentageDistributionEnabled }
          }
        }
      }
    ) => percentageDistributionEnabled
  )
  const secondaryCumulativeDistributionEnabledSelector = selectors.createSelector(
    "secondaryCumulativeDistributionEnabled",
    (
      _,
      {
        chart: {
          presentation: {
            sizeMeasureSecondaryAxis: { cumulativeDistributionEnabled }
          }
        }
      }
    ) => cumulativeDistributionEnabled
  )
  const secondaryPercentageDistributionEnabledSelector = selectors.createSelector(
    "secondaryPercentageDistributionEnabled",
    (
      _,
      {
        chart: {
          presentation: {
            sizeMeasureSecondaryAxis: { percentageDistributionEnabled }
          }
        }
      }
    ) => percentageDistributionEnabled
  )
  const manualPrimaryMeasureDomainMinSelector = selectors.createSelector(
    "manualPrimaryMeasureDomainMin",
    (
      _,
      {
        chart: {
          presentation: {
            sizeMeasurePrimaryAxis: { manualDomainMin }
          }
        }
      }
    ) => manualDomainMin
  )
  const manualPrimaryMeasureDomainMaxSelector = selectors.createSelector(
    "manualPrimaryMeasureDomainMax",
    (
      _,
      {
        chart: {
          presentation: {
            sizeMeasurePrimaryAxis: { manualDomainMax }
          }
        }
      }
    ) => manualDomainMax
  )
  const manualSecondaryMeasureDomainMinSelector = selectors.createSelector(
    "manualSecondaryMeasureDomainMin",
    (
      _,
      {
        chart: {
          presentation: {
            sizeMeasureSecondaryAxis: { manualDomainMin }
          }
        }
      }
    ) => manualDomainMin
  )
  const manualSecondaryMeasureDomainMaxSelector = selectors.createSelector(
    "manualSecondaryMeasureDomainMax",
    (
      _,
      {
        chart: {
          presentation: {
            sizeMeasureSecondaryAxis: { manualDomainMax }
          }
        }
      }
    ) => manualDomainMax
  )
  const colorMeasurePaletteSelector = selectors.createSelector(
    "colorMeasurePalette",
    (
      _,
      {
        chart: {
          scales: {
            colorMeasure: { palette }
          }
        }
      }
    ) => palette
  )
  const colorMeasureDomainSelector = selectors.createSelector(
    "colorMeasureDomain",
    (
      _,
      {
        chart: {
          scales: {
            colorMeasure: { domain }
          }
        }
      }
    ) => domain
  )
  const colorMeasurePaletteReversalSelector = selectors.createSelector(
    "colorMeasurePaletteReversal",
    (
      _,
      {
        chart: {
          scales: {
            colorMeasure: { paletteReversed }
          }
        }
      }
    ) => paletteReversed
  )
  const baseDimensionFormatSelector = selectors.createSelector(
    "baseDimensionFormat",
    (_, { chart: { binSettings } }: Props) => binSettings?.format
  )
  const primaryMeasureFormatSelector = selectors.createSelector(
    "primaryMeasureFormat",
    (
      _,
      {
        chart: {
          presentation: {
            sizeMeasurePrimaryAxis: { format }
          }
        }
      }
    ) => format
  )
  const secondaryMeasureFormatSelector = selectors.createSelector(
    "secondaryMeasureFormat",
    (
      _,
      {
        chart: {
          presentation: {
            sizeMeasureSecondaryAxis: { format }
          }
        }
      }
    ) => format
  )
  const primaryMeasureScaleTypeSelector = selectors.createSelector(
    "primaryMeasureScaleType",
    (
      _,
      {
        chart: {
          presentation: {
            sizeMeasurePrimaryAxis: { scaleType }
          }
        }
      }
    ) => scaleType
  )

  // Orientation of the chart: "column" or "row"
  const orientationSelector = selectors.createSelector(
    "orientation",
    rawOrientationSelector,
    isRangeChartSelector,
    (orientation, isRangeChart) =>
      isRangeChart ? "column" : orientation || "column"
  )

  const getSelectedFilterSetIdSelector = selectors.createSelector(
    "getSelectedFilterSetId",
    getSelectedFilterSetId
  )

  // Name for our crossfilters - we're generating names rather than relying on
  // a randomly generated one to simplify logic. These names must be globally
  // unique.
  const crossfilterNamesSelector = selectors.createSelector(
    "crossfilterNames",
    idSelector,
    getSelectedFilterSetIdSelector,
    (id, filterSetId) => ({
      focus: focusChartFilterName(id, filterSetId),
      range: rangeChartFilterName(id, filterSetId)
    })
  )

  // global, chart-level, and crossfilters applied to this chart
  const filtersSelector = selectors.createSelector(
    "filters",
    idSelector,
    dataSelectionsSelector,
    omnifiltersSelector,
    crossfilterNamesSelector,
    isRangeChartSelector,
    (id, dataSelections, omnifilters, crossfilterNames, isRangeChart) => {
      const dataSources = dataSelections
        .map((dataSelection) => dataSelection.table && dataSelection.table.name)
        .filter((table): table is string => Boolean(table))
      const filters = getFiltersAppliedToChart(id, dataSources, omnifilters)
      if (!isRangeChart) {
        // focus charts should apply the range filter as well
        return filters.concat(
          omnifilters.filter(
            (f) => f.name === crossfilterNames.range && f.enabled
          )
        )
      }
      return filters
    },
    { equal: shallowEqualArrays }
  )

  // filters from crosslinked data sources
  const crossLinkFiltersSelector = selectors.createSelector(
    "crossLinkFilters",
    idSelector,
    dataSelectionsSelector,
    omnifiltersSelector,
    crossLinksSelector,
    // omnifilters and crosslinks are only here to force updates on change
    (id, dataSelections, _omnifilters, _crossLinks) =>
      dataSelections.flatMap((ds) => {
        const table = ds?.table?.name
        if (table) {
          return buildCrossLinkFilters(id, [table])
        }
        return []
      }),
    { equal: isEqual }
  )

  const appliedFiltersSelector = selectors.createSelector(
    "appliedFilters",
    filtersSelector,
    crossLinkFiltersSelector,
    (filters, crossLinkFilters) => [...filters, ...crossLinkFilters]
  )

  // filter on the range chart
  const rangeChartFilterSelector = selectors.createSelector(
    "rangeChartFilter",
    omnifiltersSelector,
    crossfilterNamesSelector,
    (omnifilters, crossfilterNames) => {
      return omnifilters.find((f) => f.name === crossfilterNames.range) as
        | ChartFilterMetadata
        | undefined
    }
  )

  // true if there has been a manual min or max set
  const hasForcedExtentSelector = selectors.createSelector(
    "hasForcedExtent",
    rangeChartFilterSelector,
    binSettingsSelector,
    (rangeChartFilter, binSettings) =>
      Boolean(rangeChartFilter) ||
      binSettings?.manualMin ||
      binSettings?.manualMax
  )

  /**
   * Normally, we prevent rendering a chart when all data is filtered out. But,
   * if a user zooms in to a range with no data points, we still need to render
   * it so they can zoom out and bail. The fix is to display the chart only if
   * we have a zoom/range chart filter on it, with the chart extents forced to
   * the range filter min/max (or manual min/max).
   */
  const forceDisplayChartSelector = selectors.createSelector(
    "forceDisplayChart",
    rangeChartFilterSelector,
    isRangeChartSelector,
    binSettingsSelector,
    (rangeChartFilter, isRangeChart, binSettings) =>
      Boolean(
        (binSettings?.dimensionType === "binned_numeric" ||
          binSettings?.dimensionType === "binned_time") &&
          rangeChartFilter?.enabled &&
          !isRangeChart
      )
  )

  // SETTINGS SELECTORS
  // ==================

  // Returns true if the dimension is continuous
  const enableContinuousDimensionSelector = selectors.createSelector(
    "enableContinuousDimension",
    binSettingsSelector,
    sortColumnSelector,
    (binSettings, sortColumn) => {
      const binnedDimension =
        binSettings?.dimensionType === "binned_numeric" ||
        binSettings?.dimensionType === "binned_time"
      const dimensionSorted = sortColumn.col.name === "dimension0"

      return binnedDimension && dimensionSorted
    }
  )

  // Returns true if all dimensions are time binned.
  const continuousTimeDimensionSelector = selectors.createSelector(
    "continuousTimeDimension",
    enableContinuousDimensionSelector,
    binSettingsSelector,
    (isContinuous, binSettings) =>
      isContinuous && binSettings?.dimensionType === "binned_time"
  )

  // Returns true if the continuous dimension is sorted in descending order
  const continuousDimensionDescSelector = selectors.createSelector(
    "continuousDimensionDesc",
    enableContinuousDimensionSelector,
    sortColumnSelector,
    (isContinuous, sortColumn) => isContinuous && sortColumn.order === "desc"
  )

  const sharedSettingsSelector = selectors.createSelector(
    "sharedSettings",
    (state) => state.sharedSettings
  )

  const paletteMappingsSelector = selectors.createSelector(
    "paletteMappings",
    sharedSettingsSelector,
    (sharedSettings) => sharedSettings.mappings
  )

  // If any input to this selector changes, it will force the data to
  // recalculate, forcing a redraw.
  const forceRedrawSelector = selectors.createSelector(
    "forceRedraw",
    paletteMappingsSelector,
    () => Date.now()
  )

  // DATA SELECTORS
  // ==============

  // Separates focus data from range data, depending on which chart this is.
  // Returns an array of data for each layer, where the layer data is a map
  // of data keys to arrays of data values.
  const rawDataSelector = selectors.createSelector(
    "rawData",
    chartDataSelector,
    isRangeChartSelector,
    forceRedrawSelector,
    (data, isRangeChart) =>
      (data?.[isRangeChart ? "range" : "focus"] || []).map(
        (layerBeats) =>
          getLatestBeatData(layerBeats) ||
          ({} as Partial<VegaComboLayerBeatData>)
      ),
    { equal: isEqual }
  )

  const isLoadingDataSelector = selectors.createSelector(
    "isLoadingData",
    chartDataSelector,
    isRangeChartSelector,
    (data, isRangeChart) => {
      const layers = data?.[isRangeChart ? "range" : "focus"] || []

      for (const layerBeats of layers) {
        if (layerBeats) {
          const sortedBeats = Object.entries(layerBeats).sort(
            ([keyA], [keyB]) => Number(keyB) - Number(keyA)
          )

          if (sortedBeats.length) {
            const [, lastBeatData] = sortedBeats[0]
            return !lastBeatData
          }
        }
      }

      return false
    }
  )

  // This selector simply memoizes the data to prevent unnecessary renders
  const dataSelector = selectors.createSelector(
    "data",
    rawDataSelector,
    forceRedrawSelector,
    (rawData) => rawData
  )

  const dataErrorSelector = selectors.createSelector(
    "dataError",
    dataSelector,
    (data) => {
      const dataErrors = data.map((layerData) => layerData.error)

      if (dataErrors.some((error) => typeof error !== "undefined")) {
        return dataErrors
      } else {
        return undefined
      }
    }
  )

  /**
   * Returns the { min:, max: } for binned dimensions.
   * For focus charts, in order of priority, we set the min/max to:
   * 1. Manual/locked values, if any
   * 2. The bounds of a filter set on the corresponding range chart, if any
   * 3. The min/max of the data
   *
   * For range charts, #1 and #2 are ignored and min/max are always set to the
   * extents of the data.
   */
  const continuousDimensionDomainSelector = selectors.createSelector(
    "continuousDimensionDomain",
    binSettingsSelector,
    dataSelector,
    isRangeChartSelector,
    rangeChartFilterSelector,
    (
      binSettings,
      data,
      isRangeChart,
      rangeChartFilter
    ): ComputedMinMax | null => {
      if (
        binSettings?.dimensionType !== "binned_numeric" &&
        binSettings?.dimensionType !== "binned_time"
      ) {
        return null
      }

      return data
        ? getComputedMinMax(
            data.map(({ minmax }) => minmax || null),
            binSettings,
            isRangeChart,
            rangeChartFilter
          )
        : null
    }
  )

  // top-n options per layer
  // returns an array that is the same length as dataSelections: each element
  // of the array is either a VegaCustomizableTopNOptions object if the
  // corresponding layer has a color dimension, or undefined.
  const topNoptionsSelector = selectors.createSelector(
    "topNoptions",
    dataSelectionsSelector,
    (dataSelections) =>
      dataSelections.map((dataSelection, index) => {
        if (dataSelection.table && dataSelection.dimensions.color) {
          const topNOptions =
            dataSelection.topNoptions ||
            buildDefaultCustomizableTopNOptions(dataSelection.table.name, index)
          return topNOptions
        } else {
          return undefined
        }
      })
  )
  // top-n options per layer
  // returns an array that is the same length as dataSelections: each element
  // of the array is either a VegaCustomizableTopNOptions object if the
  // corresponding layer has a color dimension, or undefined.
  const measureTopNoptionsSelector = selectors.createSelector(
    "measureTopNoptions",
    dataSelectionsSelector,
    (dataSelections) =>
      dataSelections.map((dataSelection, index) => {
        if (dataSelection.table && dataSelection.measures.color) {
          return (
            dataSelection.measureTopNOptions ||
            buildDefaultCustomizableTopNOptions(dataSelection.table.name, index)
          )
        } else {
          return undefined
        }
      })
  )

  // Returns the maximum number of top-n groups
  const numTopNGroupsSelector = selectors.createSelector(
    "numTopNGroups",
    topNoptionsSelector,
    (topNoptions) =>
      topNoptions.reduce(
        (acc, options) => Math.max(acc, options ? countTopNGroups(options) : 0),
        1
      )
  )

  // Returns the time unit when binned on a time dimension
  const binnedTimeUnitSelector = selectors.createSelector(
    "binnedTimeUnit",
    binSettingsSelector,
    continuousDimensionDomainSelector,
    numTopNGroupsSelector,
    (binSettings, continuousDimensionDomain, numTopNGroups) =>
      binSettings?.dimensionType === "binned_time" && continuousDimensionDomain
        ? binSettings.timeUnit === "auto"
          ? getAutoBinUnit(
              continuousDimensionDomain,
              getMaxTimeBins(numTopNGroups)
            )
          : binSettings.timeUnit
        : null
  )

  // Returns the [min, max] for binned dimensions
  const simpleContinuousDimensionDomainSelector = selectors.createSelector(
    "simpleContinuousDomain",
    continuousDimensionDomainSelector,
    binnedTimeUnitSelector,
    binnifyDimensionDomain
  )

  // Returns the full [min, max] for binned dimensions--that is, the min/max
  // of the data ignoring filters on the range chart and manual min/max.
  const fullContinuousDimensionDomainSelector = selectors.createSelector(
    "fullContinuousDimensionDomain",
    binSettingsSelector,
    binnedTimeUnitSelector,
    chartDataSelector,
    (binSettings, timeUnit, data) => {
      if (
        (binSettings?.dimensionType === "binned_numeric" ||
          binSettings?.dimensionType === "binned_time") &&
        data
      ) {
        const minmaxData = data.focus
          .map(getLatestBeatData)
          .map((beatData) => (beatData ? beatData.fullMinMax : null))

        const computedMinMax = getComputedMinMax(minmaxData, binSettings, true)
        return binnifyDimensionDomain(computedMinMax, timeUnit)
      }

      return null
    }
  )

  // Returns an array of bin dimensions (unformatted) if binning is enabled.
  // Otherwise, returns undefined.
  const binsSelector = selectors.createSelector(
    "bins",
    binSettingsSelector,
    continuousDimensionDomainSelector,
    binnedTimeUnitSelector,
    (binSettings, continuousDimensionDomain, binnedTimeUnit) => {
      if (!binSettings || !continuousDimensionDomain) {
        return { bins: undefined, scaled: undefined }
      }

      const bins: (number | Date)[] = []
      let scaled = bins
      if (binSettings.dimensionType === "binned_numeric") {
        const scale = vega
          .scale("customlinear")()
          .domain([0, binSettings.numOfBins])
          .range([continuousDimensionDomain.min, continuousDimensionDomain.max])

        // numerical binning just has dimensions 0 through BINS-1
        scaled = []
        for (let i = 0; i < binSettings.numOfBins; i += 1) {
          bins.push(i)
          scaled.push(scale(i))
        }
      } else if (binSettings.dimensionType === "binned_time") {
        let interval = binnedTimeUnit as unitOfTime.DurationConstructor
        let multiple = 1
        if (binnedTimeUnit === "century") {
          multiple = 100
          interval = "year"
        } else if (binnedTimeUnit === "decade") {
          multiple = 10
          interval = "year"
        }

        const base = moment.utc(continuousDimensionDomain.min)
        if (interval === "week") {
          const startOfWeek = getFeatureFlag(START_OF_WEEK)
          const dayOfWeek = base.day()
          let wanted = 1 // Monday
          if (startOfWeek === "week_sunday") {
            wanted = 0
          } else if (startOfWeek === "week_saturday") {
            wanted = 6
          }

          base.startOf("day")
          if (dayOfWeek > wanted) {
            base.day(wanted)
          } else if (dayOfWeek < wanted) {
            base.day(wanted - 7)
          }
        } else {
          base.startOf(interval)

          if (multiple > 1) {
            let v = base.get(interval)
            v -= v % multiple
            if (interval !== "year" || multiple !== 10) {
              // For anything but decade, we need to add 1 here
              v += 1
            }
            base.set(interval, v)
          }
        }

        let prev = base
        let i = 1
        while (prev.isSameOrBefore(continuousDimensionDomain.max)) {
          bins.push(prev.toDate())

          // The reason we do it this way vs adding 1 interval to the prev
          // value each loop iteration is that a moment + X months is different
          // than adding 1 month X times if the moment represents the last day
          // of the month, for example. There are other gotchyas around DST,
          // leap years, and leap seconds. Safer this way.
          prev = base.clone().add(i * multiple, interval)
          i += 1
        }
      } else if (binSettings.dimensionType === "extract_time") {
        const { timeUnit } = binSettings

        let min = 0
        let max = 59

        if (timeUnit === "hour") {
          max = 23
        } else if (timeUnit === "isodow") {
          min = 1
          max = 7
        } else if (timeUnit === "day") {
          // XXX: should we be calculating a min/max from the data?
          min = 1
          max = 31
        } else if (timeUnit === "month") {
          min = 1
          max = 12
        } else if (timeUnit === "quarter") {
          min = 1
          max = 4
        } else if (timeUnit === "year") {
          min = moment.utc(continuousDimensionDomain.min).year()
          max = moment.utc(continuousDimensionDomain.max).year()
        }

        for (let i = min; i <= max; i += 1) {
          bins.push(i)
        }
      }

      return { bins, scaled }
    }
  )

  // Returns two functions:
  // formatter: a function that formats a dimension
  // scaler: a function that scales a bin number to the corresponding lower
  //   bound of the bin. This is really only relevant for numeric bins.
  //
  // Note that the formatter function will call the scaler before formatting,
  // so, most of the time, you need only call the formatter.
  const baseDimensionFormatterSelector = selectors.createSelector(
    "baseDimensionFormatter",
    baseDimensionFormatSelector,
    binSettingsSelector,
    binsSelector,
    continuousDimensionDomainSelector,
    enableContinuousDimensionSelector,
    binnedTimeUnitSelector,
    (
      dimensionFormat,
      binSettings,
      { bins },
      continuousDimensionDomain,
      isContinuous,
      binnedTimeUnit
    ) => {
      let dimensionScale = (v) => v
      let dimensionFormatter = (v) =>
        v instanceof Date ? v.toUTCString() : String(v)

      if (binSettings && continuousDimensionDomain) {
        if (binSettings.dimensionType === "binned_numeric") {
          // The domain must be the min/max for tickFormat to work correctly
          const binnedScale = vega
            .scale("customlinear")()
            .range([0, binSettings.numOfBins])
            .domain([
              continuousDimensionDomain.min,
              continuousDimensionDomain.max
            ])

          dimensionScale = binnedScale.invert

          if (dimensionFormat) {
            dimensionFormatter = binnedScale.tickFormat(
              binSettings.numOfBins,
              dimensionFormat
            )
          } else {
            dimensionFormatter = binnedScale.tickFormat(binSettings.numOfBins)
          }
        } else if (binSettings.dimensionType === "binned_time") {
          if (!dimensionFormat) {
            dimensionFormat = getAppropriateTimeFormat(
              binnedTimeUnit,
              continuousDimensionDomain.min,
              continuousDimensionDomain.max
            )
          }
          dimensionFormatter = vega
            .timeFormatLocale()
            .utcFormat(dimensionFormat)
        } else {
          throw new Error("Unsupported base dimension scale type")
        }
      } else if (binSettings?.dimensionType === "extract_time") {
        if (binSettings.timeUnit === "hour") {
          const domain = [0]
          const range = ["12am"]
          for (let i = 1; i < 24; i += 1) {
            domain.push(i)
            if (i < 12) {
              range.push(`${i}am`)
            } else if (i === 12) {
              range.push("12pm")
            } else {
              range.push(`${i - 12}pm`)
            }
          }
          dimensionFormatter = vega
            .scale("ordinal")()
            .domain(domain)
            .range(range)
        } else if (binSettings.timeUnit === "isodow") {
          const range = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
          dimensionFormatter = vega
            .scale("ordinal")()
            .domain([...range.keys()].map((i) => i + 1))
            .range(range)
        } else if (binSettings.timeUnit === "month") {
          const range = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(
            " "
          )
          dimensionFormatter = vega
            .scale("ordinal")()
            .domain([...range.keys()].map((i) => i + 1))
            .range(range)
        } else if (binSettings.timeUnit === "quarter") {
          dimensionFormatter = vega
            .scale("ordinal")()
            .domain([1, 2, 3, 4])
            .range(["Q1", "Q2", "Q3", "Q4"])
        }
      } else if (dimensionFormat) {
        dimensionFormatter = vega
          .scale("scrollingband")()
          .tickFormat(null, dimensionFormat)
      }

      // NOTE: undefined and NaN shouldn't actually happen. But, if they ever
      // appear, they'll appear in italics which may make it easier to spot
      // that there is a problem.
      const specialCases = new Map()
      specialCases.set(null, "𝘯𝘶𝘭𝘭")
      specialCases.set(undefined, "𝘶𝘯𝘥𝘦𝘧𝘪𝘯𝘦𝘥")
      specialCases.set(NaN, "𝘕𝘢𝘕")

      let formatter = (v) =>
        specialCases.get(v) || dimensionFormatter(dimensionScale(v))
      if (bins && !isContinuous) {
        // If the dimension is binned, but we aren't in continuous mode (ex:
        // not sorted by dimension), we need to display the dimension as
        // "start - end"
        const binLookup: Record<string, string> = {}
        let next = formatter(bins[bins.length - 1])
        for (let i = bins.length - 2; i >= 0; i -= 1) {
          const cur = formatter(bins[i])
          binLookup[stringify(bins[i])] = `${cur} — ${next}`
          next = cur
        }

        formatter = (v) =>
          specialCases.get(v) ||
          binLookup[stringify(v)] ||
          dimensionFormatter(dimensionScale(v))
      }

      return { formatter, scaler: dimensionScale }
    }
  )

  const transformedMeasureCustomTopNDataSelector = selectors.createSelector(
    "transformedMeasureCustomTopNData",
    dataSelector,
    dataSelectionsSelector,
    measureTopNoptionsSelector,
    paletteMappingsSelector,
    (data, dataSelections, measureTopNOptions, paletteMappings) => {
      return data.map(({ table: layerData }, index) => {
        const topNoptionsForLayer = measureTopNOptions[index]
        const dataSelection = dataSelections[index]
        const paletteMapping = paletteMappings.find(
          (pm: PaletteMapping) =>
            pm.id === dataSelection.measures.color?.paletteMappingId
        )
        // Translates from palette mapping to the top n options for combo
        const mapping = paletteMapping?.mapping
        if (mapping?.defaultOtherDomain && mapping?.defaultOtherRange) {
          topNoptionsForLayer.allOthers.key = `others${index}`
          topNoptionsForLayer.allOthers.color = mapping.defaultOtherRange
          topNoptionsForLayer.allOthers.isAllOther = true
        }
        if (topNoptionsForLayer) {
          return transformBaseDimOrMeasureCustomTopNData(
            layerData || [],
            topNoptionsForLayer,
            paletteMapping
          )
        } else {
          return (layerData || []) as TransformedTopNData[]
        }
      })
    }
  )

  // GROUP-BY DIMENSION RELATED SELECTORS
  // ====================================

  // transforms groupByDimension data to add "locked" values, custom colors
  // returns an array with one element per layer: the element will either be an
  // array of groups if the layer has a color dimension, or an empty array.
  const transformedCustomTopNdataSelector = selectors.createSelector(
    "transformedCustomTopNdata",
    dataSelector,
    dataSelectionsSelector,
    topNoptionsSelector,
    paletteMappingsSelector,
    (data, dataSelections, topNoptions, paletteMappings) => {
      return data.map(({ groupByDimension: layerData }, index) => {
        const topNoptionsForLayer = topNoptions[index]
        const dataSelection = dataSelections[index]
        const paletteMapping = paletteMappings.find(
          (pm: PaletteMapping) =>
            pm.id === dataSelection.dimensions.color?.paletteMappingId
        )
        // Translates from palette mapping to the top n options for combo
        const mapping = paletteMapping?.mapping
        if (mapping?.defaultOtherDomain && mapping?.defaultOtherRange) {
          topNoptionsForLayer.allOthers.key = `others${index}`
          topNoptionsForLayer.allOthers.color = mapping.defaultOtherRange
          topNoptionsForLayer.allOthers.isAllOther = true
        }
        if (topNoptionsForLayer) {
          return transformCustomTopNData(
            layerData || [],
            topNoptionsForLayer,
            String(index),
            paletteMapping
          )
        } else {
          return (layerData || []) as TransformedTopNData[]
        }
      })
    }
  )
  // All "groups" in the data, whether from color dimensions or size measures
  // Returns an array of all groups where each group is an object with things
  // like key, color, and order.
  const measureSettingsSelector = selectors.createSelector(
    "measureSettings",
    dataSelectionsSelector,
    transformedCustomTopNdataSelector,
    timeLagSettingsSelector,
    (dataSelections, transformedCustomTopNdata, timeLagSettings) =>
      dataSelections
        .flatMap((dataSelection, layerIndex) => {
          const applyColorMeasure = Boolean(dataSelection.measures.color)
          const layerTopNData = transformedCustomTopNdata[layerIndex]
          if (dataSelection.dimensions.color) {
            if (layerTopNData) {
              const measure = dataSelection.measures.size[0] || {
                markSettings: {}
              }
              return layerTopNData.map((d) => ({
                ...d,
                dataSelectionIndex: layerIndex,
                measureIndex: 0,
                label: "originalKey" in d ? String(d.originalKey) : "Others",
                applyColorMeasure,
                axis: measure.markSettings.axis || "primary",
                visualizeAs: measure.markSettings.markType || "bar",
                hideLine: Boolean(measure.markSettings.hideLine),
                lineStyle: measure.markSettings.lineStyle || "solid",
                lineThickness:
                  measure.markSettings.lineThickness || DEFAULT_STROKEWIDTH,
                lineShadow: measure.markSettings.lineShadow || 0
              }))
            }
            return []
          } else {
            // size is base measure
            return dataSelection.measures.size.map((measure, measureIndex) => ({
              dataSelectionIndex: layerIndex,
              measureIndex,
              key: `measure${measureIndex}_${layerIndex}`,
              label: getMeasureLabel(measure, timeLagSettings),
              color: measure.markSettings.markColor,
              applyColorMeasure,
              axis: measure.markSettings.axis || "primary",
              visualizeAs: measure.markSettings.markType || "bar",
              hideLine: Boolean(measure.markSettings.hideLine),
              lineStyle: measure.markSettings.lineStyle || "solid",
              lineThickness:
                measure.markSettings.lineThickness || DEFAULT_STROKEWIDTH,
              lineShadow: measure.markSettings.lineShadow || 0
            }))
          }
        })
        .map((value, index) => ({
          ...value,
          order: index + 1
        }))
  )

  // Returns an object of group.key => group pairs
  const measureSettingsLookupSelector = selectors.createSelector(
    "measureSettingsLookup",
    measureSettingsSelector,
    (groups) =>
      groups.reduce((acc, g) => {
        acc[g.key] = g
        return acc
      }, {} as Record<string, MeasureSettings>)
  )

  // If the color dimension's parameter value changes, we need to reset the
  // top-n options. This selector *must* appear before the QuerySpec selector
  selectors.createSelector(
    "resetTopNAfterParamChange",
    idSelector,
    parameterValuesForChartSelector,
    dataSelectionsSelector,
    (chartId, params, dataSelections) => {
      if (params !== lastParameterValuesInUse) {
        dataSelections.forEach(({ layerId, dimensions: { color } }) => {
          if (color) {
            const paramsInColor: string[] =
              color.type === "column"
                ? parametersInValue(color.column.value)
                : parametersInValue(color.sql)
            if (
              paramsInColor.some(
                (p) =>
                  p in lastParameterValuesInUse &&
                  params[p] !== lastParameterValuesInUse[p]
              )
            ) {
              store.dispatch(topnResetOptions(chartId, layerId, "topNoptions"))
            }
          }
        })
      }
    }
  )

  // VISUAL SELECTORS
  // ================

  // Computed grouping mode. If there is only one mark, it must be "grouped" if
  // that mark is a bar. If that mark is a line, it may be "grouped" or
  // "stacked". Otherwise, if there is more than one mark, we just pass back
  // the raw grouping mode.
  const groupingModeSelector = selectors.createSelector(
    "groupingMode",
    rawGroupingModeSelector,
    measureSettingsSelector,
    (groupingMode, settings) =>
      settings.length === 1
        ? settings[0].visualizeAs === "bar"
          ? "grouped"
          : groupingMode === "percent"
          ? "stacked"
          : groupingMode
        : groupingMode
  )

  // Returns the length limit for labels in pixels
  const baseDimensionLabelLimitSelector = selectors.createSelector(
    "baseDimensionLabelLimit",
    uiConfigStylesSelector,
    (uiConfigStyles) => uiConfigStyles.label.axisTruncationLength || 100
  )

  // Whether or not to show value labels on the bars
  const showBarLabelsSelector = selectors.createSelector(
    "showBarLabels",
    isRangeChartSelector,
    barValuesEnabledSelector,
    (isRangeChart, barValuesEnabled) => !isRangeChart && barValuesEnabled
  )

  // How much padding to have around the chart
  const chartPaddingSelector = selectors.createSelector(
    "chartPadding",
    isRangeChartSelector,
    (isRangeChart) =>
      isRangeChart ? { top: 0, right: 10, bottom: 10, left: 10 } : 10
  )

  const joinFiltersSelector = selectors.createSelector(
    "joinFilters",
    omnifiltersSelector,
    dataSelectionsSelector,
    idSelector,
    (_, dataSelections, chartId) => {
      return dataSelections.reduce(
        (acc: { [key: string]: Array<object> }, ds) => {
          const dataSource = ds.table?.name
          const layerId = ds.layerId
          const tables = getTablesForDataSource(dataSource)
          acc[layerId] = getJoinFilters({
            tables,
            chartId
          })
          return acc
        },
        {}
      )
    }
  )

  // MAIN DATA RELATED SELECTORS
  // ===========================

  // Build query spec for "table" data (chart[X].data[Y].table in redux. This
  // is the main data that is displayed in the chart.
  // Returns an array of VegaComboQuerySpecs per layer.
  const tableQuerySpecSelector = selectors.createSelector(
    "tableQuerySpec",
    dataSelectionsSelector,
    binSettingsSelector,
    timeLagSettingsSelector,
    sortColumnSelector,
    appliedFiltersSelector,
    numberOfGroupsSelector,
    showNullDimensionsSelector,
    rangeChartFilterSelector,
    joinFiltersSelector,
    comboChartToChartQuerySpec
  )

  // Build query spec for "groupByDimension" data
  // (chart[X].data[Y].groupByDimension in redux).
  // Returns an array with length equal to the number of layers: each element
  // is either a VegaTopNQuerySpec if the corresponding layer has a color
  // dimension, or undefined.
  const topNQuerySpecSelector = selectors.createSelector(
    "topNQuerySpec",
    tableQuerySpecSelector,
    topNoptionsSelector,
    (tableQuerySpecs, topNoptions) =>
      tableQuerySpecs.map((tableQuerySpec, index) => {
        const topNoptionsForSpec = topNoptions[index]

        if (tableQuerySpec.groupByDimension && topNoptionsForSpec) {
          return topNQuerySpec(
            // To get top N things, its coming from one group by dimension which has only a table
            // so table will be the table and datasource.
            tableQuerySpec.table,
            tableQuerySpec.table,
            topNoptionsForSpec,
            tableQuerySpec.appliedFilters,
            topNoptionsForSpec.measure,
            tableQuerySpec.groupByDimension
          )
        } else {
          return undefined
        }
      })
  )

  const colorDomainSelector = selectors.createSelector(
    "colorDomainSelector",
    dataSelectionsSelector,
    dataSelector,
    paletteMappingsSelector,
    (dataSelections, data, paletteMappings) => {
      return data.reduce((layerMappingsAcc, layer, index) => {
        const { table: layerData } = layer
        const dataSelection = dataSelections[index]
        const hasMeasureColor = Boolean(dataSelection.measures.color)
        const isCategoricalMeasureColor =
          hasMeasureColor &&
          Boolean(dataSelection.measures.color?.aggregate === "Mode")
        const paletteMapping = paletteMappings.find(
          (pm) => pm.id === dataSelection.measures.color?.paletteMappingId
        )
        const measureOptions = dataSelection.measureTopNOptions
        const colorKey = getColorKey(measureOptions, paletteMapping)
        const paletteType =
          paletteMapping?.mapping?.palette?.type ??
          measureOptions?.palette?.type
        const colors = getOrdinalOrSolidPalette(colorKey, paletteType)
        const allColors = layerData?.reduce(
          (domainRangeAcc, d) => {
            const categoricalColor = isCategoricalMeasureColor
              ? determineColorByValue(d.measureColor, colors)
              : null
            if (categoricalColor) {
              domainRangeAcc[0].push(d.measureColor)
              domainRangeAcc[1].push(categoricalColor)
            }
            return domainRangeAcc
          },
          [[], []]
        )
        layerMappingsAcc.push(allColors)
        return layerMappingsAcc
      }, [])
    }
  )

  // Transforms the main chart data depending on selected options. This is a
  // "first pass" that is used to compute the sorted dimension. A second pass
  // is then made to compute pdf/cdf, if enabled. See
  // transformedTableDataSelector below.
  // Returns an array of data objects
  const firstPassTableDataSelector = selectors.createSelector(
    "firstPassTableData",
    dataSelectionsSelector,
    dataSelector,
    measureSettingsLookupSelector,
    baseDimensionFormatterSelector,
    paletteMappingsSelector,
    measureTopNoptionsSelector,
    (
      dataSelections,
      data,
      measureSettingsLookup,
      { formatter, scaler },
      paletteMappings,
      measureTopNOptions
    ) => {
      if (!Array.isArray(data) || data.length === 0) {
        return undefined
      }

      // Transform measure0,1 to dimensions and measure
      return data.reduce(
        (
          acc,
          { table: layerData, allOthersGroupEnabled, allOthersSentinel },
          index
        ) => {
          const dataSelection = dataSelections[index]
          return acc.concat(
            transformData(
              dataSelection,
              index,
              layerData || [],
              measureSettingsLookup,
              Boolean(allOthersGroupEnabled),
              allOthersSentinel,
              formatter,
              scaler,
              paletteMappings,
              measureTopNOptions
            )
          )
        },
        [] as TransformedDatum[]
      )
    }
  )

  // Returns an object containing:
  //   dimensions: an array of sorted dimensions - if the dimension is
  //               binned or extracted, gaps in the domain are filled in
  //   formatted: an object mapping dimension to formatted for display
  const sortedDimensionsSelector = selectors.createSelector(
    "sortedDimensions",
    firstPassTableDataSelector,
    baseDimensionFormatterSelector,
    binsSelector,
    sortColumnSelector,
    (data, { formatter: dimensionFormatter }, { bins }, sortColumn) => {
      if (!Array.isArray(data)) {
        return { dimensions: [], formatted: {} }
      }

      const naturalBinnedSorting = sortColumn.col.name === "dimension0"

      // If we're sorting by anything other than dimension, we treat the
      // chart as categorical. Otherwise, we generate the full domain of
      // dimension values because our data may have gaps.
      if (naturalBinnedSorting && bins) {
        const dimensions: string[] = []
        const formatted: Record<string, string> = {}
        for (let i = 0; i < bins.length; i += 1) {
          const dimension = JSON.stringify([bins[i]])
          dimensions.push(dimension)
          formatted[dimension] = dimensionFormatter(bins[i])
        }

        // When a zoom updates the domain, bins recompute synchronously but the
        // new data fetch is async. During that window, data rows from the
        // previous domain won't be in the bins list, giving them
        // sortableVal=undefined in addSortableVal, which breaks the Vega window
        // transform. Appending orphan dimensions here ensures every data row
        // gets a valid sortableVal until the new data arrives.
        const binSet = new Set(dimensions)
        data.forEach((datum) => {
          if (!binSet.has(datum.dimension)) {
            dimensions.push(datum.dimension)
            formatted[datum.dimension] = datum.dimensionFormatted
          }
        })

        if (sortColumn.order === "desc") {
          dimensions.reverse()
        }

        return { dimensions, formatted }
      }

      // group by dimension
      const grouped: Record<any, any> = {}
      const formatted: Record<string, string> = {}
      data.forEach((datum) => {
        // Currently, we only support the option to order by the measureColor
        // on the first layer. So, on other layers, we need to fall back to the
        // measure.
        let sortableVal = null
        if (
          datum.dataSelectionIndex !== 0 &&
          sortColumn.col.name === "measureColor"
        ) {
          sortableVal = datum.measure
        } else if (
          // Size measure #Records is not included as countval but measure0
          sortColumn.col.name === "countval" &&
          !datum[sortColumn.col.name]
        ) {
          sortableVal = datum.measure0
        } else {
          sortableVal = datum[sortColumn.col.name]
        }

        if (datum.dimension in grouped) {
          if (
            !sortColumn.col.name.startsWith("dimension") &&
            typeof grouped[datum.dimension] === "number" &&
            typeof sortableVal === "number"
          ) {
            grouped[datum.dimension] += sortableVal
          }
        } else {
          grouped[datum.dimension] = sortableVal
          formatted[datum.dimension] = datum.dimensionFormatted
        }
      })

      const sorter =
        sortColumn.order === "desc"
          ? (a, b) => (a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0)
          : (a, b) => (a[1] > b[1] ? 1 : a[1] < b[1] ? -1 : 0)

      // sort and return an array of dimensions
      const dimensions = Object.entries(grouped)
        .sort(sorter)
        .map(([dim, _]) => dim)
      return { dimensions, formatted }
    }
  )

  // A second pass to transform data for pdf/cdf, if enabled.
  // Returns an array of data objects.
  const transformedTableDataSelector = selectors.createSelector(
    "transformedTableData",
    firstPassTableDataSelector,
    dataSelectionsSelector,
    baseDimensionFormatterSelector,
    sortedDimensionsSelector,
    measureSettingsLookupSelector,
    primaryCumulativeDistributionEnabledSelector,
    secondaryCumulativeDistributionEnabledSelector,
    primaryPercentageDistributionEnabledSelector,
    secondaryPercentageDistributionEnabledSelector,
    (
      data,
      dataSelections,
      { scaler },
      { dimensions: sortedDimensions, formatted: formattedDimensions },
      measureSettingsLookup,
      primaryCumulativeDistributionEnabled,
      secondaryCumulativeDistributionEnabled,
      primaryPercentageDistributionEnabled,
      secondaryPercentageDistributionEnabled
    ) => {
      if (
        data &&
        (primaryCumulativeDistributionEnabled ||
          secondaryCumulativeDistributionEnabled ||
          primaryPercentageDistributionEnabled ||
          secondaryPercentageDistributionEnabled)
      ) {
        data = calculateCdfPdf(
          data,
          dataSelections,
          scaler,
          sortedDimensions,
          formattedDimensions,
          measureSettingsLookup,
          primaryCumulativeDistributionEnabled,
          secondaryCumulativeDistributionEnabled,
          primaryPercentageDistributionEnabled,
          secondaryPercentageDistributionEnabled
        )
      }

      return data
    }
  )

  const isEmptyDataSelector = selectors.createSelector(
    "isEmptyData",
    dataErrorSelector,
    transformedTableDataSelector,
    (dataError, tableData) =>
      dataError || !Array.isArray(tableData) || tableData.length === 0
  )

  // Separates data by axis and visualization (bar, line), then calculates
  // stacking, if necessary.
  // Returns an object mapping axis to an object mapping visualization type
  // (bar, line, area) to the data.
  const dataByAxisAndVisualizationSelector = selectors.createSelector(
    "dataByAxisAndVisualization",
    transformedTableDataSelector,
    sortedDimensionsSelector,
    measureSettingsLookupSelector,
    groupingModeSelector,
    connectNullsAcrossGapsSelector,
    (
      data,
      { dimensions, formatted: dimensionsFormatted },
      measureSettingsLookup,
      groupingMode,
      connectNullsAcrossGaps
    ) => {
      if (!Array.isArray(data) || data.length === 0) {
        return undefined
      }

      // separate data by axis and visualization
      let separatedData = separateData(
        data,
        measureSettingsLookup,
        connectNullsAcrossGaps
      )
      separatedData = fillLineGaps(
        separatedData,
        dimensions,
        dimensionsFormatted,
        measureSettingsLookup,
        connectNullsAcrossGaps
      )

      separatedData = addSortableVal(separatedData, dimensions)

      if (groupingMode === "grouped") {
        return separatedData
      } else {
        return stackedData(
          separatedData,
          measureSettingsLookup,
          groupingMode === "percent"
        )
      }
    }
  )
  // Returns an object with keys primary and secondary that each map to one of
  // the grouping modes.
  const groupingModeByAxisSelector = selectors.createSelector(
    "groupingModeByAxis",
    groupingModeSelector,
    dataByAxisAndVisualizationSelector,
    (groupingMode, data) => {
      const groupingModeByAxis = {
        primary: groupingMode,
        secondary: groupingMode
      }
      if (!data || groupingMode === "grouped") {
        return groupingModeByAxis
      }

      // Percent and stacked modes only apply to axes with bars. If no axes
      // have bars, then it applies to them all axes.
      const hasBars = data.primary?.bar || data.secondary?.bar
      if (hasBars && !data.primary?.bar) {
        groupingModeByAxis.primary = "grouped"
      }
      if (hasBars && !data.secondary?.bar) {
        groupingModeByAxis.secondary = "grouped"
      }
      return groupingModeByAxis
    }
  )

  // Computes the current scale type. User selection is only overwritten
  // when in percentage grouping mode, during which only linear is available
  const computedPrimaryMeasureScaleTypeSelector = selectors.createSelector(
    "computedPrimaryMeasureScaleType",
    groupingModeByAxisSelector,
    primaryMeasureScaleTypeSelector,
    (groupingMode, scaleType) => {
      if (groupingMode.primary === "percent") {
        return SCALE_TYPES.LINEAR
      } else {
        return scaleType
      }
    }
  )

  // Computes the extents for each axis
  // Returns an object mapping axes to extents ([min, max])
  const computedMeasureDomainExtentsSelector = selectors.createSelector(
    "computedMeasureDomainExtents",
    dataByAxisAndVisualizationSelector,
    computedPrimaryMeasureScaleTypeSelector,
    (data, scaleType) => {
      return extentsByAxis(data, scaleType)
    }
  )

  // Combines all of the data across axes.
  // Returns an object mapping visualization type (bar, line, area) to data.
  const dataByVisualizationSelector = selectors.createSelector(
    "dataByVisualization",
    dataByAxisAndVisualizationSelector,
    combineAxes
  )

  // Retrieves the min/max measure for displaying a color measure legend
  const measureColorDomainSelector = selectors.createSelector(
    "measureColorDomain",
    colorMeasureDomainSelector,
    transformedTableDataSelector,
    (domain, transformedData) => {
      if (domain) {
        return domain
      } else if (transformedData?.some((d) => d.measureColor)) {
        return getColorMeasureMinMax(transformedData)
      } else {
        return null
      }
    }
  )

  // Default color scheme if a color measure is enabled
  const measureColorRangeSelector = selectors.createSelector(
    "measureColorRange",
    colorMeasurePaletteSelector,
    forceRedrawSelector,
    (palette) => getColorsForScheme(palette)
  )

  // Returns whether or not the color measure domain is locked
  const legendLockSelector = selectors.createSelector(
    "legendLock",
    colorMeasureDomainSelector,
    (domain) => Boolean(domain)
  )

  // Calculates the measure domain.
  // Returns an object with the min/max of the measure domain, plus minLocked
  // and maxLocked (true/false) properties
  const measureDomainSelector = selectors.createSelector(
    "measureDomain",
    computedMeasureDomainExtentsSelector,
    groupingModeByAxisSelector,
    manualPrimaryMeasureDomainMinSelector,
    manualPrimaryMeasureDomainMaxSelector,
    manualSecondaryMeasureDomainMinSelector,
    manualSecondaryMeasureDomainMaxSelector,
    computedPrimaryMeasureScaleTypeSelector,
    (
      computedMeasureDomainExtents,
      groupingModeByAxis,
      manualPrimaryMeasureDomainMin,
      manualPrimaryMeasureDomainMax,
      manualSecondaryMeasureDomainMin,
      manualSecondaryMeasureDomainMax,
      scaleType
    ): { [axis: string]: MeasureDomain | null } => {
      const domain: { [axis: string]: MeasureDomain | null } = {
        primary: null,
        secondary: null
      }

      if (!computedMeasureDomainExtents) {
        return domain
      }

      if (computedMeasureDomainExtents.primary) {
        domain.primary =
          groupingModeByAxis.primary === "percent"
            ? {
                min: 0,
                max: 1,
                minLocked: true,
                maxLocked: true
              }
            : buildMeasureDomain(
                manualPrimaryMeasureDomainMin,
                manualPrimaryMeasureDomainMax,
                computedMeasureDomainExtents.primary,
                scaleType
              )
      }

      if (computedMeasureDomainExtents.secondary) {
        domain.secondary =
          groupingModeByAxis.secondary === "percent"
            ? {
                min: 0,
                max: 1,
                minLocked: true,
                maxLocked: true
              }
            : buildMeasureDomain(
                manualSecondaryMeasureDomainMin,
                manualSecondaryMeasureDomainMax,
                computedMeasureDomainExtents.secondary,
                scaleType
              )
      }

      return domain
    }
  )

  // Returns the measureDomainSelector unless the groupingMode is percent. Used by
  // the MeasureDomainOverlay to allow the user to edit the domain.
  const editableMeasureDomainSelector = selectors.createSelector(
    "editableMeasureDomain",
    measureDomainSelector,
    groupingModeSelector,
    (measureDomain, groupingMode) =>
      groupingMode !== "percent" ? measureDomain : {}
  )

  // Returns just the [min, max] of the measureDomain. Used by the vega spec.
  const measureDomainExtentsSelector = selectors.createSelector(
    "measureDomainExtents",
    measureDomainSelector,
    (measureDomain) => ({
      primary: measureDomain.primary
        ? [measureDomain.primary.min, measureDomain.primary.max]
        : [0, 0],
      secondary: measureDomain.secondary
        ? [measureDomain.secondary.min, measureDomain.secondary.max]
        : [0, 0]
    })
  )

  // Returns which axes are enabled
  const enabledAxesSelector = selectors.createSelector(
    "enabledAxes",
    measureDomainSelector,
    (measureDomain) => ({
      showPrimaryAxis: Boolean(measureDomain.primary),
      showSecondaryAxis: Boolean(measureDomain.secondary)
    }),
    { equal: isEqual }
  )

  // computed measure format for primary axis - might go to percentage for
  // percentage distribution/view
  const computedPrimaryMeasureFormatSelector = selectors.createSelector(
    "computedPrimaryMeasureFormat",
    groupingModeByAxisSelector,
    primaryPercentageDistributionEnabledSelector,
    primaryMeasureFormatSelector,
    (groupingMode, percentageDistributionEnabled, format) => {
      if (groupingMode.primary === "percent" || percentageDistributionEnabled) {
        return ".0%"
      } else {
        return format
      }
    }
  )

  // computed measure format for secondary axis - might go to percentage for
  // percentage distribution/view
  const computedSecondaryMeasureFormatSelector = selectors.createSelector(
    "computedSecondaryMeasureFormat",
    groupingModeByAxisSelector,
    secondaryPercentageDistributionEnabledSelector,
    secondaryMeasureFormatSelector,
    (groupingMode, percentageDistributionEnabled, format) => {
      if (
        groupingMode.secondary === "percent" ||
        percentageDistributionEnabled
      ) {
        return ".0%"
      } else {
        return format
      }
    }
  )

  // Returns the formats for the base dimension, primary, and second measures
  const computedFormatsSelector = selectors.createSelector(
    "computedFormats",
    baseDimensionFormatSelector,
    computedPrimaryMeasureFormatSelector,
    computedSecondaryMeasureFormatSelector,
    (baseDimensionFormat, primaryMeasureFormat, secondaryMeasureFormat) => ({
      baseDimensionFormat,
      primaryMeasureFormat,
      secondaryMeasureFormat
    })
  )

  // Data, rolled up by dimension, for tooltips.
  // Returns an array of data rows that contains a dimension field and a
  // measure field which is, itself, an array of formatted measure data.
  const tooltipTableSelector = selectors.createSelector(
    "tooltipTable",
    dataByAxisAndVisualizationSelector,
    sortedDimensionsSelector,
    measureSettingsLookupSelector,
    enableContinuousDimensionSelector,
    measureDomainExtentsSelector,
    primaryMeasureFormatSelector,
    secondaryMeasureFormatSelector,
    computedFormatsSelector,
    measureColorDomainSelector,
    measureColorRangeSelector,
    colorMeasurePaletteReversalSelector,
    dataSelectionsSelector,
    (
      dataByAxis,
      { dimensions, formatted: formattedDimensions },
      measureSettingsLookup,
      isContinuous,
      measureExtents,
      rawPrimaryAxisFormat,
      rawSecondaryAxisFormat,
      {
        primaryMeasureFormat: primaryAxisFormat,
        secondaryMeasureFormat: secondaryAxisFormat
      },
      colorMeasureDomain,
      colorMeasureRange,
      invertColorMeasure,
      dataSelections
    ) => {
      if (!dataByAxis) {
        return []
      }

      // Internally, vega uses a scale called "sequential-linear" if you
      // specify a linear scale with a range of colors and a domain of
      // [min, max], so we'll do the same here.
      const colorMeasureScale =
        colorMeasureDomain &&
        colorMeasureRange &&
        vega
          .scale("sequential-linear")()
          .domain(colorMeasureDomain)
          .interpolator(
            vega.interpolateColors(
              invertColorMeasure
                ? colorMeasureRange.reverse()
                : colorMeasureRange
            )
          )
          .clamp(true)

      const dataByDimension = Object.fromEntries(
        dimensions.map((key, idx) => {
          let dimension = key === null ? "NULL" : formattedDimensions[key]
          if (key !== null && isContinuous && idx + 1 < dimensions.length) {
            let nextDimension = dimensions[idx + 1]
            if (nextDimension !== null) {
              nextDimension = formattedDimensions[nextDimension]
              dimension += ` - ${nextDimension}`
            }
          }
          return [key, { key, dimension, measures: [] }]
        })
      )

      if (dataByAxis.primary) {
        fillTooltipData(
          dataByDimension,
          dataByAxis.primary,
          measureSettingsLookup,
          measureExtents.primary,
          rawPrimaryAxisFormat,
          primaryAxisFormat,
          colorMeasureScale,
          dataSelections
        )
      }
      if (dataByAxis.secondary) {
        fillTooltipData(
          dataByDimension,
          dataByAxis.secondary,
          measureSettingsLookup,
          measureExtents.secondary,
          rawSecondaryAxisFormat,
          secondaryAxisFormat,
          colorMeasureScale,
          dataSelections
        )
      }

      return Object.values(dataByDimension)
    }
  )

  // Returns the titles for the measure axes as an object with primary and
  // secondary keys. Titles are unprocessed for parameters.
  const unprocessedMeasureTitlesSelector = selectors.createSelector(
    "unprocessedMeasureTitles",
    isRangeChartSelector,
    rawOrientationSelector,
    enabledAxesSelector,
    rawPrimaryMeasureTitleSelector,
    rawSecondaryMeasureTitleSelector,
    dataSelectionsSelector,
    (
      isRangeChart,
      orientation,
      { showPrimaryAxis, showSecondaryAxis },
      primaryTitle,
      secondaryTitle,
      dataSelections
    ) => ({
      primary:
        !isRangeChart && showPrimaryAxis
          ? primaryTitle ||
            dataSelections
              .flatMap((ds) =>
                ds.measures.size
                  .filter(
                    (measure) =>
                      measure.markSettings.axis === "primary" &&
                      measure.type !== TIME_LAG_EXPRESSION_TYPE
                  )
                  .map((measure) => getMeasureLabel(measure))
              )
              .join(" / ")
          : isRangeChart && orientation === "row"
          ? null
          : "",
      secondary:
        !isRangeChart && showSecondaryAxis
          ? secondaryTitle ||
            dataSelections
              .flatMap((ds) =>
                ds.measures.size
                  .filter(
                    (measure) =>
                      measure.markSettings.axis === "secondary" &&
                      measure.type !== TIME_LAG_EXPRESSION_TYPE
                  )
                  .map((measure) => getMeasureLabel(measure))
              )
              .join(" / ")
          : isRangeChart && orientation === "row"
          ? null
          : ""
    })
  )

  // Returns the titles for the measure axes as an object with primary and
  // secondary keys
  const measureTitlesSelector = selectors.createSelector(
    "measureTitles",
    idSelector,
    unprocessedMeasureTitlesSelector,
    parameterValuesForChartSelector,
    (chartId, { primary, secondary }, _params) => ({
      primary:
        primary &&
        processParameters(primary, {
          chartId,
          token: "primary-measure-title",
          useDisplayName: true,
          trackUsage: true
        }),
      secondary:
        secondary &&
        processParameters(secondary, {
          chartId,
          token: "secondary-measure-title",
          useDisplayName: true,
          trackUsage: true
        })
    })
  )

  // Returns a title for the base dimension axis - title is unprocessed for
  // params
  const unprocessedBaseDimensionTitleSelector = selectors.createSelector(
    "unprocessedBaseDimensionTitle",
    idSelector,
    rangeChartEnabledSelector,
    isRangeChartSelector,
    rawOrientationSelector,
    rawBaseDimensionTitleSelector,
    dataSelectionsSelector,
    parameterValuesForChartSelector,
    (
      chartId,
      rangeChartEnabled,
      isRangeChart,
      orientation,
      title,
      dataSelections,
      _params // force update when params change
    ) =>
      rangeChartEnabled &&
      ((isRangeChart && orientation === "row") ||
        (!isRangeChart && orientation === "column"))
        ? null
        : title ||
          dataSelections
            .flatMap((ds) =>
              ds.dimensions.xAxis.map((label) => getDimensionLabel(label))
            )
            .join(" / ")
  )

  // Returns a title for the base dimension axis
  const baseDimensionTitleSelector = selectors.createSelector(
    "baseDimensionTitleSelector",
    idSelector,
    unprocessedBaseDimensionTitleSelector,
    parameterValuesForChartSelector,
    (chartId, title, _params) =>
      title &&
      processParameters(title, {
        chartId,
        token: "dimension-title",
        useDisplayName: true,
        trackUsage: true
      })
  )

  // DATA FROM FILTERS
  // =================

  // Name for our crossfilter - we're generating a name rather than relying on
  // a randomly generated one to simplify logic. This name must be globally
  // unique.
  const crossfilterNameSelector = selectors.createSelector(
    "crossfilterName",
    crossfilterNamesSelector,
    isRangeChartSelector,
    (names, isRangeChart) => (isRangeChart ? names.range : names.focus)
  )

  // crossfilter that is defined on *this* chart, if one exists; otherwise null
  const ourCrossfilterSelector = selectors.createSelector(
    "ourCrossfilter",
    omnifiltersSelector,
    crossfilterNameSelector,
    (filters, name): ChartFilterMetadata | undefined =>
      filters.find((f) => f.name === name),
    { equal: isEqual }
  )

  // Builds the selected / negated data tables that are used by the vega spec
  // to show which bars have been crossfiltered
  const selectedValuesSelector = selectors.createSelector(
    "selectedValues",
    ourCrossfilterSelector,
    binsSelector,
    selectedValuesFromCrossfilter
  )

  const crossfilterTokenDataSourcesSelector = selectors.createSelector(
    "crossfilterTokenDataSources",
    idSelector,
    dataSelectionsSelector,
    crossfilterTokensSelector,
    (id, dataSelections, crossfilterTokens) => {
      const dataSources = new Set(
        crossfilterTokens.filter((r) => r.chartId === id).map((r) => r.table)
      )
      dataSelections.forEach((ds) => {
        if (ds.table && ds.table.name) {
          dataSources.delete(ds.table.name)
        }
      })
      return Array.from(dataSources) as string[]
    },
    { equal: shallowEqualArrays }
  )

  const crossfilterTokenFiltersSelector = selectors.createSelector(
    "crossfilterTokenFilters",
    crossfilterTokenDataSourcesSelector,
    omnifiltersSelector,
    (dataSources, omnifilters) =>
      getFiltersAppliedToChart("fakeid", dataSources, omnifilters),
    { equal: shallowEqualArrays }
  )

  // COMBINED SELECTORS
  // ==================

  // Combined query specs
  // Returns an array of length equal to the number of layers, where each
  // element includes a table query spec and a group-by query spec.
  selectors.createSelector(
    "querySpec",
    dashboardIdSelector,
    tabIdSelector,
    idSelector,
    tableQuerySpecSelector,
    topNQuerySpecSelector,
    isRangeChartSelector,
    isEditingChartSelector,
    lastStreamingDataRequestSelector,
    parameterValuesForChartSelector,
    crossfilterTokenFiltersSelector,
    (
      dashboardId,
      tabId,
      id,
      tableQuerySpecs,
      topNQuerySpecs,
      isRangeChart,
      isEditingChart,
      lastStreamingDataRequest,
      parameterValuesInUse,
      crossfilterTokenFilters
    ): VegaComboQuerySpec => {
      forceFetch =
        forceFetch ||
        lastStreamingDataRequest !== lastForcedDataFetch ||
        !isEqual(parameterValuesInUse, lastParameterValuesInUse) ||
        lastCrossfilterTokenFilters !== crossfilterTokenFilters
      lastForcedDataFetch = lastStreamingDataRequest
      lastParameterValuesInUse = parameterValuesInUse
      lastCrossfilterTokenFilters = crossfilterTokenFilters

      const querySpec = {
        type: "vega-combo" as const,
        dataKey: isRangeChart ? ("range" as const) : ("focus" as const),
        groupByDimension: topNQuerySpecs,
        table: tableQuerySpecs
      }
      debouncedFetchData(dashboardId, tabId, id, querySpec, isEditingChart)
      return querySpec
    }
  )

  // Combines all of the data arrays into a single object to pass to vega
  selectors.createSelector(
    "transformedData",
    dataByVisualizationSelector,
    measureSettingsSelector,
    tooltipTableSelector,
    (data, measureSettings, tooltipTable) => {
      const lineTable = (data && data.line) || []
      const finalData = cloneData({
        measureSettings,
        barTable: (data && data.bar) || [],
        lineTable,
        areaTable: (data && data.area) || [],
        tooltipTable
      })
      setData(finalData)
      return finalData
    }
  )

  // Constructs data about top-n options. This is used to build the top-n
  // legend.
  const transformedLayersLegendDataSelector = selectors.createSelector(
    "transformedLayersLegendData",
    transformedCustomTopNdataSelector,
    transformedMeasureCustomTopNDataSelector,
    topNQuerySpecSelector,
    measureTopNoptionsSelector,
    dataSelectionsSelector,
    collapsedLegendLayersSelector,
    (
      data: any[],
      measureData: any[],
      topNquerySpecs,
      measureTopNOptions,
      dataSelections,
      collapsedLegendLayers
    ) => {
      const topNLegendData = dataSelections.map((dataSelection, index) => {
        const colorMeasure = dataSelection.measures.color
        const isCategoricalMeasureColor = colorMeasure?.aggregate === "Mode"
        const layerMeasureData = measureData[index]
        const layerMeasureOptions = measureTopNOptions[index]
        if (
          layerMeasureData &&
          layerMeasureOptions &&
          isCategoricalMeasureColor
        ) {
          return {
            type: "TOPN",
            name: `Layer ${index + 1} - ${colorMeasure.table}`,
            dimColName: colorMeasure?.column?.value,
            layerId: dataSelection.layerId,
            // Probably we need measure data here
            topNoptions: layerMeasureData.filter(
              (td) => `others${index}` !== td.key && !td.isAllOther
            ),
            isColorMeasureSelected: true,
            propertyName: "measureTopNOptions",
            legendCollapsed: Boolean(
              collapsedLegendLayers?.[dataSelection.layerId]
            )
          }
        } else if (topNquerySpecs[index]) {
          const topnDimension = topNquerySpecs[index]?.dimension
          const layerData = data[index]

          if (
            !Array.isArray(layerData) ||
            (!topnDimension && !measureTopNOptions)
          ) {
            return {
              type: "MEASURE",
              name: `Layer ${index + 1} - ${getDisplayOrParameterName(
                dataSelection.table?.name
              )}`,
              layerId: dataSelection.layerId,
              legendCollapsed: Boolean(
                collapsedLegendLayers?.[dataSelection.layerId]
              ),
              isColorMeasureSelected: Boolean(dataSelection.measures.color),
              measures: dataSelection.measures
            }
          } else {
            const isColorMeasureSelected = Boolean(colorMeasure)

            return {
              type: "TOPN",
              name: `Layer ${index + 1} - ${
                colorMeasure ? colorMeasure.table : topnDimension.table
              }`,
              dimColName: colorMeasure
                ? colorMeasure.column?.value
                : topnDimension.column?.value,
              layerId: dataSelections[index].layerId,
              topNoptions: layerData.filter(
                (td) => `others${index}` !== td.key && !td.isAllOther
              ),
              // We should actually modify the key for all other in the adapter if possible
              allOthers: layerData.filter(
                (td) => `others${index}`.includes(td.key) || td.isAllOther
              )[0],
              isColorMeasureSelected,
              propertyName: isColorMeasureSelected
                ? "measureTopNOptions"
                : "topNoptions",
              legendCollapsed: Boolean(
                collapsedLegendLayers?.[dataSelections[index].layerId]
              )
            }
          }
        } else {
          return {
            type: "MEASURE",
            name: `Layer ${index + 1} - ${getDisplayOrParameterName(
              dataSelection.table?.name
            )}`,
            layerId: dataSelection.layerId,
            legendCollapsed: Boolean(
              collapsedLegendLayers?.[dataSelection.layerId]
            ),
            isColorMeasureSelected: Boolean(dataSelection.measures.color),
            measures: dataSelection.measures
          }
        }
      })
      return topNLegendData.filter(Boolean)
    }
  )

  // selected (or inversely selected) bars, or brush values
  const selectedValuesSignalSelector = selectors.createSelector(
    "selectedValuesSignal",
    selectedValuesSelector,
    ({ enabled, selectedValues, negativeSelectedValues, rangeValues }) =>
      enabled
        ? {
            selectedValues,
            negativeSelectedValues,
            rangeValues: rangeValues.length > 0 ? rangeValues[0] : null
          }
        : { selectedValues: [], negativeSelectedValues: [], rangeValues: null }
  )

  // Combined signalValues to VegaChartComponent. Return value is never
  // actually used - instead, this is called if any dependency updates and then
  // it forwards the values to vega through the vegaChannel.
  selectors.createSelector(
    "signalValues",
    sortedDimensionsSelector,
    baseDimensionTitleSelector,
    baseDimensionLabelLimitSelector,
    simpleContinuousDimensionDomainSelector,
    continuousDimensionDescSelector,
    measureTitlesSelector,
    measureDomainExtentsSelector,
    measureColorDomainSelector,
    measureColorRangeSelector,
    colorMeasurePaletteReversalSelector,
    baseDimensionFormatSelector,
    computedFormatsSelector,
    fullContinuousDimensionDomainSelector,
    hasForcedExtentSelector,
    selectedValuesSignalSelector,
    zoomToSelector,
    primaryPercentageDistributionEnabledSelector,
    secondaryPercentageDistributionEnabledSelector,
    parameterValuesForChartSelector,
    (
      { dimensions: dimensionDomain, formatted: formattedDimensions },
      baseDimensionTitle,
      baseDimensionLabelLimit,
      continuousDimensionDomain,
      continuousDimensionDomainDesc,
      { primary: primaryMeasureTitle, secondary: secondaryMeasureTitle },
      { primary: primaryMeasureDomain, secondary: secondaryMeasureDomain },
      measureColorDomain,
      measureColorRange,
      measureColorReversed,
      baseDimensionFormat,
      { primaryMeasureFormat, secondaryMeasureFormat },
      fullDimensionDomain,
      hasForcedExtent,
      selectedValues,
      incomingZoom,
      primaryPercentageDistributionEnabled,
      secondaryPercentageDistributionEnabled,
      _params // force update when params change
    ) => {
      const values = {
        dimensionDomain,
        formattedDimensions,
        baseDimensionTitle,
        baseDimensionLabelLimit,
        continuousDimensionDomain,
        continuousDimensionDomainDesc,
        primaryMeasureTitle,
        secondaryMeasureTitle,
        primaryMeasureDomain,
        secondaryMeasureDomain,
        measureColorDomain,
        measureColorRange,
        measureColorReversed,
        baseDimensionFormat,
        primaryMeasureFormat,
        secondaryMeasureFormat,
        fullDimensionDomain,
        hasForcedExtent,
        incomingZoom,
        primaryPercentageDistributionEnabled,
        secondaryPercentageDistributionEnabled,
        ...selectedValues
      }
      if (useDebouncedSetSignalValues) {
        debouncedSetSignalValues(values)
      } else {
        vegaChannel.setSignalValues(values)
      }
      return values
    }
  )

  // SIGNAL HANDLERS
  // ===============

  const onFilterSelector = selectors.createSelector(
    "onFilter",
    idSelector,
    selectedValuesSelector,
    crossfilterNameSelector,
    transformedTableDataSelector,
    dataSelectionsSelector,
    enableContinuousDimensionSelector,
    binSettingsSelector,
    binsSelector,
    (
      id,
      selectedData,
      crossfilterName,
      data,
      dataSelections,
      continuousDimension,
      binSettings,
      bins
    ) => (_name: string, evt?: SelectedValue) => {
      // When the chart first loads, it'll fire this listener with a null value
      // - ignore that. Also, if we have a continuous dimension, selecting bars
      // doesn't make a whole lot of sense.
      if (!evt || continuousDimension || !data) {
        return
      }

      // Get current set of filters
      const negated = Boolean(evt.negated)
      const selectedValues: ValueType[] = selectedData.selectedValues || []
      const negativeSelectedValues: ValueType[] =
        selectedData.negativeSelectedValues || []
      let values: ValueWithOp[] = selectedValues
        .map((value): ValueWithOp => ({ value, op: "=" }))
        .concat(
          negativeSelectedValues.map(
            (value): ValueWithOp => ({ value, op: "<>" })
          )
        )

      // Figure out what to do
      const idx = values.findIndex(({ value }) => value === evt.value)
      if (idx >= 0) {
        // Bar was already filtered, so remove it
        values.splice(idx, 1)
      } else if (negated) {
        // remove any non-negated filters and add as a new negated filter
        values = values.filter(({ op }) => op === "<>")
        values.push({ value: evt.value, op: "<>" })
      } else {
        // remove any negated filters and add as a new non-negated filter
        values = values.filter(({ op }) => op === "=")
        values.push({ value: evt.value, op: "=" })
      }

      // if there are no remaining filters, clear all filters
      if (values.length === 0) {
        store.dispatch(clearFilterByName(crossfilterName))
        return
      }

      const extractUnit =
        binSettings?.dimensionType === "extract_time"
          ? binSettings.timeUnit
          : undefined

      buildFilters(
        id,
        crossfilterName,
        data,
        dataSelections,
        values,
        bins,
        extractUnit
      )
    }
  )

  const onOutgoingZoomSelector = selectors.createSelector(
    "onOutgoingZoom",
    enableContinuousDimensionSelector,
    isRangeChartSelector,
    idSelector,
    crossfilterNamesSelector,
    dataSelectionsSelector,
    fullContinuousDimensionDomainSelector,
    binSettingsSelector,
    (
      enabled,
      isRangeChart,
      id,
      crossfilterNames,
      dataSelections,
      dimensionDomainExtents,
      binSettings
    ) =>
      enabled
        ? throttle(
            (_name: string, evt?: RangeFilterValue) => {
              // When the chart first loads, it'll fire this listener with a null value
              if (!evt || !dimensionDomainExtents) {
                return
              }

              useDebouncedSetSignalValues = true

              if (
                dimensionDomainExtents[0] >= evt.values[0] &&
                dimensionDomainExtents[1] <= evt.values[1]
              ) {
                store.dispatch(clearFilterByName(crossfilterNames.range))
              } else {
                batch(() => {
                  buildRangeFilters(
                    id,
                    crossfilterNames.range,
                    dataSelections,
                    evt.values
                  )

                  // Zooming should re-enable any disabled filter
                  store.dispatch(
                    toggleFilterByName(crossfilterNames.range, true)
                  )

                  overwriteManualMinMax(id, evt.values, binSettings)
                })
              }
            },
            getFeatureFlag(COMBO_QUERY_THROTTLE),
            { leading: false, trailing: true }
          )
        : undefined
  )

  const onRangeFilterSelector = selectors.createSelector(
    "onRangeFilter",
    idSelector,
    crossfilterNameSelector,
    transformedTableDataSelector,
    dataSelectionsSelector,
    enableContinuousDimensionSelector,
    fullContinuousDimensionDomainSelector,
    binSettingsSelector,
    binsSelector,
    isRangeChartSelector,
    (
      id,
      crossfilterName,
      data,
      dataSelections,
      continuousDimension,
      continuousDimensionDomain,
      binSettings,
      bins,
      isRangeChart
    ) =>
      throttle(
        (_name: string, evt?: RangeFilterValue) => {
          // When the chart first loads, it'll fire this listener with a null value
          if (!evt) {
            return
          }

          if (continuousDimension) {
            if (
              (continuousDimensionDomain &&
                continuousDimensionDomain[0] >= evt.values[0] &&
                continuousDimensionDomain[1] <= evt.values[1]) ||
              evt.values[0] >= evt.values[1]
            ) {
              store.dispatch(clearFilterByName(crossfilterName))
            } else {
              batch(() => {
                // for continuous dimensions, we create a range filter
                buildRangeFilters(
                  id,
                  crossfilterName,
                  dataSelections,
                  evt.values
                )

                // changing the filter should enable it
                store.dispatch(toggleFilterByName(crossfilterName, true))

                if (isRangeChart) {
                  overwriteManualMinMax(id, evt.values, binSettings)
                }
              })
            }
          } else {
            // for discrete dimensions, the brush just selects a group of
            // values
            const values: ValueWithOp[] = evt.values.map((value) => ({
              value,
              op: "="
            }))

            const extractUnit =
              binSettings?.dimensionType === "extract_time"
                ? binSettings.timeUnit
                : undefined

            buildFilters(
              id,
              crossfilterName,
              data,
              dataSelections,
              values,
              bins,
              extractUnit
            )
          }
        },
        getFeatureFlag(COMBO_QUERY_THROTTLE),
        { leading: false, trailing: true }
      )
  )

  const onClearFiltersSelector = selectors.createSelector(
    "onClearFilters",
    crossfilterNameSelector,
    (crossfilterName) => (_name: string, evt: boolean | null) => {
      if (evt) {
        setTimeout(() => {
          store.dispatch(clearFilterByName(crossfilterName))
        }, 0)
      }
    }
  )

  // when zooming on focus or range chart, communicate to the other
  const communicateZoomSelector = selectors.createSelector(
    "communicateZoom",
    rawCommunicateZoomSelector,
    (setter) =>
      setter
        ? (_, evt: ZoomFilterValue | null) => {
            if (evt === null || evt) {
              setter(evt)
            }
          }
        : null
  )

  // signal listeners
  selectors.createSelector(
    "signalListeners",
    onFilterSelector,
    onRangeFilterSelector,
    onClearFiltersSelector,
    communicateZoomSelector,
    onOutgoingZoomSelector,
    (filter, rangeFilter, clearFilters, zoom, outgoingZoom) => {
      const listeners = {
        filter,
        rangeFilter,
        clearFilters,
        zoom,
        outgoingZoom
      }
      vegaChannel.setSignalListeners(listeners)
      return listeners
    }
  )

  // MISC
  // ====

  // Returns whether or not to show the color measure legend
  const showMeasureColorLegendSelector = selectors.createSelector(
    "showMeasureColorLegend",
    dataSelectionsSelector,
    rangeChartEnabledSelector,
    isRangeChartSelector,
    (dataSelections, rangeChartEnabled, isRangeChart) =>
      (!rangeChartEnabled || isRangeChart) &&
      dataSelections.some((ds) => ds.measures.color)
  )

  // Returns whether or not to show the binning header
  const showBinningHeaderSelector = selectors.createSelector(
    "showBinningHeader",
    binSettingsSelector,
    isRangeChartSelector,
    (binSettings, isRangeChart) => !isRangeChart && binSettings
  )

  // Returns whether or not to allow editing of the dimension domain
  const enableDimensionDomainEditingSelector = selectors.createSelector(
    "enableDimensionDomainEditing",
    isRangeChartSelector,
    enableContinuousDimensionSelector,
    (isRangeChart, isContinuous) => !isRangeChart && isContinuous
  )

  // Returns whether or not to allow editing of the axis domains
  const enableMeasureDomainEditingSelector = selectors.createSelector(
    "enableMeasureDomainEditing",
    isRangeChartSelector,
    (isRangeChart) => !isRangeChart
  )

  const uiThemeSelector = selectors.createSelector(
    "uiTheme",
    (state) => state.userConfigurableUI.uiTheme
  )

  const isDarkModeSelector = selectors.createSelector(
    "darkMode",
    uiThemeSelector,
    (uiTheme) => isThemeDark(uiTheme)
  )

  // Returns a vega config. See: https://vega.github.io/vega/docs/config/
  const vegaConfigSelector = selectors.createSelector(
    "vegaConfig",
    uiConfigStylesSelector,
    isDarkModeSelector,
    (uiConfigStyles, darkMode): vega.Config => {
      const axisTickStyles = uiConfigStyles.text[UI_CONFIG_AXIS_TICK_LABEL]
      const defaultAxisTickStyles =
        DEFAULT_DATABASE_STYLES.text[UI_CONFIG_AXIS_TICK_LABEL]
      const axisTitleStyles = uiConfigStyles.text[UI_CONFIG_AXIS_TITLE]
      const defaultAxisTitleStyles =
        DEFAULT_DATABASE_STYLES.text[UI_CONFIG_AXIS_TITLE]

      const axisColor = darkMode
        ? DEFAULT_DARK_MODE_AXIS_COLOR
        : DEFAULT_LIGHT_MODE_AXIS_COLOR

      const gridColor = darkMode
        ? DEFAULT_DARK_MODE_GRID_AXIS_COLOR
        : DEFAULT_GRID_AXIS_COLOR

      return {
        signals: [
          {
            name: "axisLabelFontSize",
            value:
              axisTickStyles[STYLE_PROPERTY_FONT_SIZE] ||
              defaultAxisTickStyles[STYLE_PROPERTY_FONT_SIZE]
          },
          {
            name: "axisTitleFontSize",
            value:
              axisTitleStyles[STYLE_PROPERTY_FONT_SIZE] ||
              defaultAxisTitleStyles[STYLE_PROPERTY_FONT_SIZE]
          },
          {
            name: "barLabelMaxFontSize",
            value: 12
          },
          {
            name: "barLabelMinFontSize",
            value: 6
          }
        ],
        axis: {
          titleColor: axisColor,
          domainColor: axisColor,
          tickColor: axisColor,
          labelColor: axisColor,
          gridColor,
          labelFontWeight: axisTickStyles[STYLE_PROPERTY_FONT_WEIGHT] || 400,
          titleFontWeight: axisTitleStyles[STYLE_PROPERTY_FONT_WEIGHT] || 400
        }
      }
    }
  )

  // Returns a function for computing default annotation settings, depending on
  // the orientation of the chart.
  const calcDefaultAnnotationSettingsSelector = selectors.createSelector(
    "calcDefaultAnnotationSettings",
    orientationSelector,
    (orientation): CalcDefaultSettingsFunc =>
      orientation === "column"
        ? (_annotation, width, _height, x, y) => {
            let xOffset = 10
            let yOffset = -10
            if (x >= width / 2) {
              xOffset = -10
            }
            if (y < 20) {
              yOffset = 10
            }
            return {
              xOffset,
              yOffset
            }
          }
        : (_annotation, width, _height, x, y) => {
            let xOffset = 10
            let yOffset = -10
            if (x + xOffset + 5 >= width) {
              xOffset = -10
            }
            if (y < 20) {
              yOffset = 10
            }
            return {
              xOffset,
              yOffset
            }
          }
  )

  // Returns the chart data selections for annotation support
  const chartDataSelectionsSelector = selectors.createSelector(
    "chartDataSelections",
    dataSelectionsSelector,
    (dataSelections): ChartDataSelection[] =>
      dataSelections.flatMap((ds) =>
        ds.table
          ? [
              {
                dataSource: ds.table.name,
                axisDimensions: ds.dimensions.xAxis.map(dimExprToStr),
                additionalDimensions: ds.dimensions.color
                  ? [dimExprToStr(ds.dimensions.color)]
                  : [],
                measures: ds.measures.size
                  .filter(({ type }) => type !== TIME_LAG_EXPRESSION_TYPE)
                  .map((measure) =>
                    // This needs to match the format of measures in the annotationKey
                    measureToExprStr(measure)
                  )
              }
            ]
          : []
      )
  )

  /**
   * Returns a function that preprocesses annotations to, for example, adjust
   * for binning
   */
  const preprocessAnnotationSelector = selectors.createSelector(
    "preprocessAnnotation",
    continuousDimensionDomainSelector,
    binsSelector,
    dataSelectionsSelector,
    (
      domain,
      { scaled },
      dataSelections
    ): PreprocessAnnotationFunc | undefined => {
      if (domain && scaled) {
        const sourceToDims: Record<string, Set<string>> = {}
        dataSelections.forEach(({ table, dimensions }) => {
          if (table) {
            if (!(table.name in sourceToDims)) {
              sourceToDims[table.name] = new Set()
            }
            dimensions.xAxis.forEach((dim) =>
              sourceToDims[table.name].add(dimExprToStr(dim))
            )
          }
        })
        const scale = vega
          .scale("threshold")()
          .domain(scaled.map(toEpochIfDate))
          .range([null, ...scaled])
        return (annotation) => {
          if (annotation.dataSource in sourceToDims) {
            const dimensions = { ...annotation.dimensions }
            sourceToDims[annotation.dataSource].forEach((dim) => {
              if (dim in dimensions) {
                const val = toEpochIfDate(dimensions[dim])
                if (val > domain.max) {
                  // we only check the domain max here because scale() will
                  // return null if it's below the min
                  return
                }

                const newVal = scale(val)
                if (newVal === null) {
                  return
                }
                dimensions[dim] = newVal
              }
            })
            return { ...annotation, dimensions }
          }
          return null
        }
      }
      return undefined
    }
  )

  // Returns true if we should show the base dimension axis title
  const showDimensionTitleSelector = selectors.createSelector(
    "showDimensionTitle",
    baseDimensionTitleSelector,
    (title) => title !== null
  )

  // Returns true for each measure axis if we should show the title
  const showMeasureTitlesSelector = selectors.createSelector(
    "showMeasureTitles",
    measureTitlesSelector,
    ({ primary, secondary }) => ({
      primary: primary !== null,
      secondary: secondary !== null
    }),
    { equal: isEqual }
  )

  // Returns a vega spec
  // WARNING: be careful what dependency selectors you add here! Any time the
  // specSelector recalculates, the entire chart is torn down and rebuilt - a
  // costly operation. Only add things here that change _how_ the chart is
  // rendered, not _what_ is rendered.
  const specSelector = selectors.createSelector(
    "spec",
    orientationSelector,
    enableContinuousDimensionSelector,
    continuousTimeDimensionSelector,
    groupingModeSelector,
    enabledAxesSelector,
    showBarLabelsSelector,
    chartPaddingSelector,
    shiftToZoomSelector,
    showDimensionTitleSelector,
    showMeasureTitlesSelector,
    isRangeChartSelector,
    gridEnabledSelector,
    computedPrimaryMeasureScaleTypeSelector,
    (
      orientation,
      enableContinuousDimension,
      continuousTimeDimension,
      groupingMode,
      { showPrimaryAxis, showSecondaryAxis },
      showBarLabels,
      padding,
      shiftToZoom,
      showDimensionTitle,
      { primary: showPrimaryAxisTitle, secondary: showSecondaryAxisTitle },
      isRangeChart,
      gridEnabled,
      primaryMeasureScaleType
    ) => {
      const opts: SpecOptions = {
        enableContinuousDimension,
        continuousTimeDimension,
        groupingMode,
        showPrimaryAxis,
        showSecondaryAxis,
        showBarLabels,
        padding,
        shiftToZoom,
        showDimensionTitle,
        showPrimaryAxisTitle,
        showSecondaryAxisTitle,
        isRangeChart,
        gridEnabled,
        primaryMeasureScaleType
      }
      const spec = buildSpec(opts)
      return orientation === "column"
        ? transformRowSpecToColumn(spec, opts)
        : spec
    }
  )

  return (state, props) => {
    if (process.env.NODE_ENV === "development") {
      /* eslint-disable-next-line no-console */
      console.debug(
        "Rendering",
        props.id,
        props.isRangeChart ? "range" : "focus"
      )
    }

    selectors.recalculate(state, props)

    const { width } = props.chart
    const height = heightSelector()
    const legendHeight = legendHeightSelector()
    const orientation = orientationSelector()
    const vegaConfig = vegaConfigSelector()
    const isEmptyData = isEmptyDataSelector()
    const isLoadingData = isLoadingDataSelector()
    const dataError = dataErrorSelector()
    const showMeasureColorLegend = showMeasureColorLegendSelector()
    const continuousDimensionDomain = continuousDimensionDomainSelector()

    const colorDomains = colorDomainSelector()
    const measureColorDomain = measureColorDomainSelector()
    const measureColorRange = measureColorRangeSelector()

    const isMeasureColorPaletteReversed = colorMeasurePaletteReversalSelector()
    const legendLocked = legendLockSelector()
    const isEditingChart = isEditingChartSelector()
    const showLayersLegend = isLegendEnabled(props.chart)
    const layersLegendData = transformedLayersLegendDataSelector()
    const binSettings = binSettingsSelector()
    const {
      primary: primaryMeasureDomain,
      secondary: secondaryMeasureDomain
    } = editableMeasureDomainSelector()
    const dimensionTitle = unprocessedBaseDimensionTitleSelector()
    const {
      primary: primaryMeasureTitle,
      secondary: secondaryMeasureTitle
    } = unprocessedMeasureTitlesSelector()
    const showBinningHeader = showBinningHeaderSelector()
    const enableDimensionDomainEditing = enableDimensionDomainEditingSelector()
    const enableMeasureDomainEditing = enableMeasureDomainEditingSelector()
    const isRangeChart = isRangeChartSelector()
    const gridEnabled = gridEnabledSelector()
    const forceDisplayChart = forceDisplayChartSelector()
    const pinned = showLayersLegend && layerLegendPinSelector()
    const groupingMode = groupingModeSelector()
    const invertTopnLegend = shouldInvertTopNLegendOrder(
      orientation,
      groupingMode
    )
    const calcDefaultAnnotationSettings = calcDefaultAnnotationSettingsSelector()
    const chartDataSelections = chartDataSelectionsSelector()
    const preprocessAnnotation = preprocessAnnotationSelector()
    const scaleType = computedPrimaryMeasureScaleTypeSelector()

    const spec = specSelector()

    const primaryMeasureDomainOrientation =
      orientation === "column" ? AxisOrientation.LEFT : AxisOrientation.BOTTOM
    const secondaryMeasureDomainOrientation =
      orientation === "column" ? AxisOrientation.RIGHT : AxisOrientation.TOP
    const baseDimensionDomainOrientation =
      orientation === "column" ? AxisOrientation.BOTTOM : AxisOrientation.LEFT
    const dimensionTitleOrientation =
      orientation === "column" ? AxisOrientation.BOTTOM : AxisOrientation.LEFT
    const primaryMeasureTitleOrientation =
      orientation === "column" ? AxisOrientation.LEFT : AxisOrientation.BOTTOM
    const secondaryMeasureTitleOrientation =
      orientation === "column" ? AxisOrientation.RIGHT : AxisOrientation.TOP

    return {
      id: idSelector(),
      spec,
      vegaConfig,
      width,
      height,
      legendHeight,
      vegaChannel,
      isEmptyData,
      isLoadingData,
      dataError,
      dimensionTitle,
      primaryMeasureTitle,
      secondaryMeasureTitle,
      primaryMeasureDomainOrientation,
      secondaryMeasureDomainOrientation,
      baseDimensionDomainOrientation,
      dimensionTitleOrientation,
      primaryMeasureTitleOrientation,
      secondaryMeasureTitleOrientation,
      binSettings,
      primaryMeasureDomain,
      secondaryMeasureDomain,
      showMeasureColorLegend,
      continuousDimensionDomain,
      measureColorDomain,
      measureColorRange,
      isMeasureColorPaletteReversed,
      legendLocked,
      showLayersLegend,
      gridEnabled,
      layersLegendData,
      isEditingChart,
      showBinningHeader,
      enableAxisTitleEditing: true,
      enableDimensionDomainEditing,
      enableMeasureDomainEditing,
      isRangeChart,
      pinned,
      invertTopnLegend,
      calcDefaultAnnotationSettings,
      getChartBodySizeAndPosition,
      chartDataSelections,
      preprocessAnnotation,
      forceDisplayChart,
      scaleType,
      colorDomains
    }
  }
}

export const mapDispatchToProps = () => {
  // the bound action creators never change, so memoize this
  const actions = defaultMemoize((dispatch) => ({
    actions: bindActionCreators(
      {
        clearFilterByName,
        setCrossFilter,
        toggleFilterByName,
        updateChart,
        setColorDomain,
        clearColorDomain,
        setBaseDimensionTitle,
        setPrimaryMeasureTitle,
        setSecondaryMeasureTitle,
        setManualPrimaryMeasureDomainMin,
        setManualPrimaryMeasureDomainMax,
        clearManualPrimaryMeasureDomainMin,
        clearManualPrimaryMeasureDomainMax,
        setManualSecondaryMeasureDomainMin,
        setManualSecondaryMeasureDomainMax,
        clearManualSecondaryMeasureDomainMin,
        clearManualSecondaryMeasureDomainMax,
        topnToggle,
        topnToggleAllOthers,
        topnSetColor,
        setBinningManualMin,
        setBinningManualMax,
        clearBinningManualMin,
        clearBinningManualMax,
        toggleLegendPinning
      },
      dispatch
    )
  }))

  // this function also receives ownProps - we don't want it to "recalculate"
  // the action creators if ownProps changes
  return (dispatch) => actions(dispatch)
}

export const mergeProps = (stateProps, dispatchProps) => ({
  ...stateProps,
  ...dispatchProps
})

export const options = {
  pure: true,
  areStatesEqual: (next, prev) =>
    next.omnifilters === prev.omnifilters && next.parameters === prev.parameters
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
  options
)(VegaChartComponent)
