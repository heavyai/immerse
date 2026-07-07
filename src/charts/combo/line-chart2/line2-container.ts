// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  brushRangeChange,
  clearChartExtent,
  clearChartFilterExtent,
  clearChartFilterString,
  destroyChart,
  fetchData,
  fetchRangeData,
  getFilteredBinExtentAndSetFilterString,
  setAutoBin,
  setBinning,
  setChartExtent,
  setChartFilterExtent,
  setXAxisDomain,
  setY2AxisDomain,
  setY2AxisLabel,
  setYAxisDomain,
  setYAxisLabel,
  toggleXDomainLockAndRefresh,
  toggleY2DomainLock,
  toggleYDomainLock,
  setCustomXDomainLabel,
  DEFAULT_PREFLIGHT_LIMIT,
  unlockColors
} from "./line2-action-creators"
import { toggleChartLegend } from "actions/charts-action-creators"
import { getLabel, getLockedDomain, getSeriesID, getXDomain } from "./utils"
import {
  CHARTS_DEFAULT_OTHER_ALIASES,
  Y_AXIS_ORIENTATIONS
} from "constants/charts"
import {
  ALL_NUMERICAL_TYPES,
  TIME_UNITS,
  TEXT_TYPES
} from "constants/data-types"
import { connect } from "react-redux"
import Line2Component from "./line2-component"
import { append, find, filter, isNil, times, values, Dictionary } from "ramda"

import { isPercentageViewVisible } from "charts/combo/line-chart2/utils"
import {
  chartStateIsMulti,
  isChartMultiSource,
  getXAxisDimension,
  getColorDimension,
  isXAxisDimension
} from "reducers/charts/helpers/multi-source-helpers"
import { makeGetParameterValuesForChart } from "components/parameters/selectors"

import { isSelectorUsable } from "utils/selector-helpers"
import { COLOR_DIMENSION_LABEL, X_AXIS_DIMENSION_LABEL } from "./line2-consts"

export interface QuerySpec extends BaseQuerySpec {
  id: string
  multiGlobalFilterStrings?: string[]
}

type RangeQuerySpec = BaseQuerySpec

export interface BaseQuerySpec {
  dimension: any[]
  measures: any[]
  dataSource: string
  filterString: string
  rangeFilter: any[]
  dataExtent: any[]
  showOther: boolean
}

interface ConfigSpec {
  palette: any[]
  dirtyPalettes: object
  chartType: string
  topN: object
  rangeChartIsVisible: boolean
  xAxisLabel: string
  yAxisLabel: string
  y2AxisLabel: string
  timeBin: string
  autoBin: boolean
  extract: boolean
  brushExtent: any[]
  rangeBrushExtent: any[]
  binExtent: any[]
  binningIsEnabled: boolean
  keyType: string
  legendTitle: string
  legendIsEnabled: boolean
  xDomain: string
  yDomain: any
  y2Domain: any
  xLock: boolean
  yLock: boolean
  y2Lock: boolean
  measures: any[]
  dimensions: any[]
  hasLeftAxis: boolean
  hasRightAxis: boolean
  showOther: boolean
  measureFormats: any[]
  dimensionFormats: any[]
  transformPercentageView: boolean
}

export interface DataSource {
  index: number
  table: string
}

export interface MappedProps {
  id: string
  data: any[]
  isLoadingData: boolean
  isLoadingRangeData: boolean
  rangeData: any[]
  dataSource: string
  multiSource: Dictionary<DataSource>
  querySpecs: {
    [dataSource: string]: QuerySpec
  }
  rangeQuerySepc: RangeQuerySpec
  configSpec: ConfigSpec
  filterExtent: any
  legendCollapsed: boolean
}
const defaultExtent: [number, number] = [
  Number.POSITIVE_INFINITY,
  Number.NEGATIVE_INFINITY
]

const getMeasureFormats = (measures: any[]) =>
  measures
    .filter((m) => m.numberFormat)
    .map((m) => ({
      key: m.label,
      format: m.numberFormat,
      multiSourceIndex: m.multiSourceIndex,
      measureName: m.name
    }))
const getDimensionFormats = (dimensions: any[]) =>
  dimensions
    .filter((d) => d.dateFormat)
    .map((d) => ({ key: d.label, format: d.dateFormat }))

interface NormalizeSourcesParams {
  dataSources: Dictionary<DataSource>
  singleDataSource: string | null
  dimensions: any[]
  measures: any[]
}

const normalizeSelectors = (selectors) =>
  selectors && selectors.length
    ? selectors
        .map((selector, index) => ({
          ...selector,
          index,
          multiSourceIndex: isNil(selector.multiSourceIndex)
            ? 0
            : selector.multiSourceIndex
        }))
        .filter((e) => e.value)
    : []

const filterMultiSources = filter((dataSource: DataSource) =>
  Boolean(dataSource.table)
)

const normalizeSourcesAndDimension = ({
  dataSources,
  singleDataSource,
  dimensions,
  measures
}: NormalizeSourcesParams) => ({
  dataSources: filterMultiSources(
    singleDataSource
      ? { 0: { table: singleDataSource, index: 0 } }
      : dataSources
  ),
  dimensions: normalizeSelectors(dimensions),
  measures: normalizeSelectors(measures)
})

const translateType = (type) => {
  if (find((d) => type === d, Object.keys(ALL_NUMERICAL_TYPES))) {
    return "number"
  } else if (find((d) => type === d, Object.keys(TIME_UNITS))) {
    return "time"
  } else if (find((d) => type === d, Object.keys(TEXT_TYPES))) {
    return "string"
  } else {
    return "string"
  }
}

const getKeyTime = (dimension: any) =>
  translateType(dimension.type) === "time" && dimension.extract
    ? "number"
    : translateType(dimension.type)

export const getDirtyPalettes = (colorSets, isMulti) =>
  isMulti
    ? Object.keys(colorSets).reduce(
        (dirtyPalettes, multiSourceIndex) => ({
          ...dirtyPalettes,
          [multiSourceIndex]: Boolean(
            colorSets[multiSourceIndex] &&
              colorSets[multiSourceIndex].domainIsDirty
          )
        }),
        {}
      )
    : {
        0: Boolean(colorSets.domainIsDirty)
      }

export function mapStateToProps(state, { id, baseCrossfilter }) {
  const chartState = state.charts[id]
  const { customXDomainLabel } = chartState
  const sources: Dictionary<DataSource> = chartState.multiSources
  const { dataSources, dimensions, measures } = normalizeSourcesAndDimension({
    dataSources: sources,
    singleDataSource: chartState.dataSource,
    dimensions: chartState.dimensions,
    measures: chartState.measures
  })
  // Just first one found -
  // Used to get properties that all X-axis dimensions across sources will share
  const xDim = getXAxisDimension(chartState.dimensions)
  const brushExtent = (chartState.filters && chartState.filters[0]) || null
  const rangeBrushExtent =
    (chartState.rangeFilter && chartState.rangeFilter[0]) || null
  const palette = getPalette(chartState)
  const isMulti = chartStateIsMulti(chartState)
  const dirtyPalettes = getDirtyPalettes(chartState.color, isMulti)

  const shouldTransformPercentage =
    chartState.percentageViewEnabled &&
    palette &&
    palette.length > 0 &&
    isPercentageViewVisible(dimensions, isChartMultiSource(chartState))

  const hasMultipleMeasures = measures.filter((d) => d.label).length > 1
  let yMeasures = measures.filter(
    (d) => d.yAxisOrientation !== Y_AXIS_ORIENTATIONS.RIGHT
  )
  let y2Measures = measures.filter(
    (d) => d.yAxisOrientation === Y_AXIS_ORIENTATIONS.RIGHT
  )
  let yLabel = chartState.yAxisLabel || yMeasures.map(getLabel).join(", ")
  let y2Label = chartState.y2AxisLabel || y2Measures.map(getLabel).join(", ")

  const hasColorDimension = isMulti
    ? Object.values(dataSources).some(
        ({ index }) => getColorDimension(chartState.dimensions, index).label
      )
    : getColorDimension(chartState.dimensions).label

  const isSingleSourceWithColorDimension = !isMulti && hasColorDimension
  const hasRightAxis =
    y2Measures.length &&
    !isSingleSourceWithColorDimension &&
    !chartState.renderArea

  let chartType = "line"
  if (chartState.renderArea) {
    chartType = "stackedArea"
    yMeasures = measures
    y2Measures = []
    yLabel = yMeasures.map(getLabel).join(", ")
    y2Label = ""
  } else if (
    Array.isArray(chartState.markTypes) &&
    chartState.markTypes.length > 0
  ) {
    // fill empty elements in markTypes array (e.g. [,"line"]) - also force
    // line mode for any source that has a color dimension
    chartType = measures.flatMap((measure) => {
      const measureHasColorDimension = isMulti
        ? getColorDimension(chartState.dimensions, measure.multiSourceIndex)
            .label
        : hasColorDimension
      const sourcePaletteLength = isMulti
        ? palette.filter((p) => p.multiSourceIndex === measure.multiSourceIndex)
            .length
        : palette.length
      return measureHasColorDimension
        ? times(() => "line", sourcePaletteLength)
        : [chartState.markTypes[measure.index] || "line"]
    })
  }

  const measureFormats = getMeasureFormats(measures)
  const dimensionFormats = getDimensionFormats(dimensions)

  // Use "map over sources" helper
  const binExtent = values(dataSources).reduce(
    // Changed from reduce index to 'index' prop stored on dataSource - re-test
    (currentExtent, { index }) => {
      const xDimensionForSource = getXAxisDimension(dimensions, index)
      return [
        xDimensionForSource.currentLowValue,
        xDimensionForSource.currentHighValue
      ]
    },
    defaultExtent
  )

  const queryDimensions = dimensions.map((dimension) => {
    if (dimension.name === X_AXIS_DIMENSION_LABEL) {
      return dimension
    } else if (
      dimension.name === COLOR_DIMENSION_LABEL &&
      dimension.showOther &&
      dimension.topN &&
      dimension.topN.length
    ) {
      return {
        ...dimension,
        topN: append(CHARTS_DEFAULT_OTHER_ALIASES.other, dimension.topN)
      }
    } else {
      return dimension
    }
  })

  const getDimensionLabel = (d) => d.axisLabel || d.label

  const xAxisLabel =
    customXDomainLabel ||
    dimensions.filter(isXAxisDimension).map(getDimensionLabel).join(", ")

  return {
    id,
    baseCrossfilter,
    data: chartState.data || [],
    isLoadingData: chartState.isLoadingData,
    isLoadingRangeData: chartState.isLoadingRangeData,
    rangeData: chartState.rangeData || [],
    filterExtent: chartState.filters,
    rangeExtent: chartState.rangeFilter,
    dataSource: chartState.dataSource,
    dataSources,
    // chartState.legendCollapsed has a good chance of being `undefined`, which will be coerced to
    // `false` here (i.e. default to being uncollapsed).
    legendCollapsed: Boolean(chartState.legendCollapsed),
    querySpec: {
      id,
      dimensions: queryDimensions,
      measures,
      dataSource: chartState.dataSource,
      dataSources,
      filterString: chartState.filterString,
      rangeFilter: chartState.rangeFilter,
      dataExtent: binExtent,
      showOther: chartState.showOther,
      limit: DEFAULT_PREFLIGHT_LIMIT
    },
    rangeQuerySpec: {
      dimensions: queryDimensions,
      measures,
      dataSources,
      filterString: chartState.filterString,
      rangeFilter: [],
      dataExtent: binExtent,
      showOther: chartState.showOther,
      limit: DEFAULT_PREFLIGHT_LIMIT
    },
    configSpec: {
      palette,
      paletteIsDirty: chartState.color.domainIsDirty || false, // shouldn't need this anymore
      dirtyPalettes,
      chartType,
      rangeChartIsVisible: chartState.rangeChartEnabled,
      xAxisLabel,
      yAxisLabel: yLabel,
      y2AxisLabel: y2Label,
      timeBin: xDim.timeBin,
      autoBin: xDim.timeBin === "auto",
      extract: xDim.extract,
      brushExtent,
      rangeBrushExtent,
      binExtent,
      binningIsEnabled: Boolean(xDim.timeBin && !xDim.extract),
      keyType: getKeyTime(xDim),
      legendTitle: chartState.dimensions[1].label || "Legend",
      legendIsEnabled: Boolean(hasColorDimension || hasMultipleMeasures),
      xDomain:
        rangeBrushExtent || getXDomain(chartState.dimensions, xDim.extract),
      yDomain: getLockedDomain(yMeasures),
      y2Domain: getLockedDomain(y2Measures),
      // TODO: multiSource
      // Generalize percentageView to handle multiple data sources.
      // As of now, users can only toggle precentageview in single source mode
      shouldTransformPercentage,
      xLock: !chartState.elasticX,
      yLock: !chartState.elasticY,
      y2Lock: !chartState.elasticY2,
      measures,
      dimensions: queryDimensions,
      dataSources,
      hasLeftAxis: Boolean(yMeasures.length || hasColorDimension),
      hasRightAxis,
      showOther: chartState.showOther,
      measureFormats,
      dimensionFormats
    },
    parameterValues: makeGetParameterValuesForChart(state)(id)
  }
}

function transformColorToPalette(
  color,
  showOther: boolean,
  multiSourceIndex: number
) {
  const colorRange = color.customRange
  const colorDomain = color.customDomain
  const otherDomain = color.defaultOtherDomain
  const otherRange = color.defaultOtherRange
  let palette = []
  const styles = color.lineStyles || color.lineStyle
  if (colorRange && colorRange.length) {
    palette = colorRange.map((d, i) => ({
      key: colorDomain[i],
      id: getSeriesID(multiSourceIndex, i),
      value: d,
      style: Array.isArray(styles) && styles[i] ? styles[i] : "solid",
      multiSourceIndex
    }))
    if (
      otherDomain &&
      showOther &&
      !palette.find((c) => c.key === CHARTS_DEFAULT_OTHER_ALIASES.other)
    ) {
      palette.push({
        key: CHARTS_DEFAULT_OTHER_ALIASES.other,
        id: getSeriesID(multiSourceIndex, colorRange.length),
        value: otherRange,
        style: "solid", // to do set style of "other" domain
        multiSourceIndex
      })
    }
    if (!showOther) {
      const otherIndex = palette.findIndex(
        (c) => c.key === CHARTS_DEFAULT_OTHER_ALIASES.other
      )
      if (otherIndex > -1) {
        palette.splice(otherIndex, 1)
      }
    }
  } else {
    palette = [
      {
        key: 0, // hardcoded data key for single line
        id: getSeriesID(0, 0),
        value: color.val,
        style: [].concat(styles) || ["solid"],
        multiSourceIndex
      }
    ]
  }
  return color.reverse ? palette.slice().reverse() : palette
}

const getMeasuresForDataSourceIndex = (measures, multiSourceIndex: number) =>
  measures.filter(
    (measure) => measure.multiSourceIndex === multiSourceIndex && measure.label
  )

const filterDimensionsByMultiSourceIndex = (dimensions, multiSourceIndex) =>
  dimensions.filter(
    (dimension) =>
      Number(dimension.multiSourceIndex) === Number(multiSourceIndex)
  )

function getPalette(chartState) {
  const dataSourceKeys = Object.keys(chartState.multiSources || {}).filter(
    (multiSourceIndex) =>
      getMeasuresForDataSourceIndex(
        chartState.measures,
        Number(multiSourceIndex)
      ).length
  )

  return !chartState.dataSource && dataSourceKeys.length > 0
    ? dataSourceKeys
        .map((multiSourceIndex) =>
          chartState.color[multiSourceIndex]
            ? transformColorToPalette(
                chartState.color[multiSourceIndex],
                isSelectorUsable(
                  filterDimensionsByMultiSourceIndex(
                    chartState.dimensions,
                    multiSourceIndex
                  )[1]
                ) &&
                  filterDimensionsByMultiSourceIndex(
                    chartState.dimensions,
                    multiSourceIndex
                  )[1].showOther,
                Number(multiSourceIndex)
              )
            : {}
        )
        .reduce((colors, sourceColors) => [...colors, ...sourceColors], [])
    : transformColorToPalette(
        chartState.color,
        isSelectorUsable(chartState.dimensions[1]) &&
          chartState.dimensions[1].showOther,
        0
      )
}

const setFilterString = (id, multiSourceIndex, filterString) => {
  return getFilteredBinExtentAndSetFilterString(
    id,
    multiSourceIndex,
    filterString
  )
}

export const mapDispatchToProps = {
  fetchFocusData: fetchData,
  fetchRangeData,
  setChartExtent, // NEEDS ID
  setFilterString, // NEEDS ID
  setFilterExtent: setChartFilterExtent, // NEEDS ID
  clearFilterExtent: clearChartFilterExtent, // NEEDS ID
  clearChartExtent, // NEEDS ID
  clearChartFilterString, // NEEDS ID
  destroyChart, // NEEDS ID
  setXAxisLabel: setCustomXDomainLabel, // NEEDS ID
  setYAxisLabel, // NEEDS ID
  setY2AxisLabel, // NEEDS ID
  setBinning, // NEEDS ID
  setAutoBin, // NEEDS ID
  setXAxisDomain, // NEEDS ID
  setYAxisDomain, // NEEDS ID
  setY2AxisDomain, // NEEDS ID
  toggleXDomainLockAndRefresh, // NEEDS ID
  toggleYDomainLock, // NEEDS ID
  toggleY2DomainLock, // NEEDS ID
  brushRangeChange, // NEEDS ID
  toggleChartLegend, // NEEDS ID
  unlockColors
}

export default connect(mapStateToProps, mapDispatchToProps)(Line2Component)
