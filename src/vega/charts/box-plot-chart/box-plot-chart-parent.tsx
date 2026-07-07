// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defaultMemoize } from "reselect"
import { connect } from "react-redux"
import { debounce, isEqual, isNil } from "lodash"
import { shallowEqualArrays } from "shallow-equal"
import * as vega from "vega"
import { focusChartFilterName, rangeChartFilterName } from "vega/utils/filter"
import { getSelectedFilterSetId } from "components/new-filters/filter-sets-selectors"
import { process as processParameters } from "utils/ImmerseSQLPlusPlus/parser"
import { buildCrossLinkFilters } from "utils/crosslink-utils"

// utilities
import { importableStore as store } from "store/importableStore"
import { getColorsForScheme } from "vega/charts/color-utils"
import { extentByAxis, getLatestBeatData } from "vega/utils/data"
import { getUserConfigurableUISettings } from "reducers/user-configurable-ui-reducer"
import ForwardSelect from "vega/utils/forward-select"
import VegaChannel from "vega/components/Vega/VegaChannel"
import { isGridEnabled } from "vega/utils/presentation"
import { buildSpec } from "./helpers/spec/buildSpec"
import { boxPlotChartToChartQuerySpec } from "./query-spec"
import {
  transformData,
  transformViolinData
} from "vega/charts/box-plot-chart/helpers/transformData"
import { buildDefaultCustomizableTopNOptions } from "vega/charts/top-n-utils"
import { fillTooltipData } from "./helpers/tooltip/fillTooltipData"
import {
  clearManualPrimaryMeasureDomainMax,
  clearManualPrimaryMeasureDomainMin,
  setBaseDimensionTitle,
  setManualPrimaryMeasureDomainMax,
  setManualPrimaryMeasureDomainMin,
  setPrimaryMeasureTitle
} from "vega/actions/presentation-settings-action-creators"

// action creators / thunks
import { fetchData } from "vega/actions/vega-data-thunks"

// types
import { ValueType, MeasureDomain } from "./types"

import {
  AxisOrientation,
  GetChartBodySizeAndPosition,
  VegaBoxPlotChart,
  VegaBoxPlotData,
  VegaBoxPlotLayerBeatData,
  VegaBoxPlotQuerySpec
} from "vega/charts/types"
import {
  ChartFilterMetadata,
  FilterMetadata,
  getFiltersAppliedToChart
} from "vega/constants/filter-metadata-types"
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
import { VegaMarkTypes } from "vega/constants/data-selection-types"

import { getJoinFilters } from "services/ImmerseCrossFilter/ImmerseCrossFilterJoin"
import { getTablesForDataSource } from "components/join-manager/utils"
import { BoxPlotChart } from "./box-plot-chart"
import { DEFAULT_VIOLIN_PRECISION } from "components/chart-settings/box-plot/components/data-formatting-components/data-settings"
import { getDimensionLabel, getMeasureLabel } from "vega/utils/data-selection"
import { bindActionCreators } from "redux"
import { clearFilterByName } from "vega/actions/filter-action-creators"
import { SCALE_TYPES } from "constants/scale-types"
import { buildMeasureDomain, getBoxPlotAutoScaling } from "vega/utils/scales"
import { transformColumnSpecToRow } from "../combo-chart/column-spec"
import {
  selectedValuesFromCrossfilter,
  ValueWithOp,
  SelectedValue
} from "vega/charts/combo-chart/combo-chart"
import { buildFilters } from "./helpers/buildFilters"
import { isThemeDarkOrCustom } from "utils/theme/use-immerse-ui-theme"

const SET_SIGNAL_DEBOUNCE = 250

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
  chart: VegaBoxPlotChart
  width: number
  height: number
  parameterValues: Record<string, string>
  legendHeight?: number
  isRangeChart?: boolean
  gridEnabled?: boolean
  barValuesEnabled?: boolean
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
    (_, { chart: { data } }) => {
      return (data ?? []) as VegaBoxPlotData
    }
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
  const isRangeChartSelector = selectors.createSelector(
    "isRangeChart",
    (_, { isRangeChart }) => Boolean(isRangeChart)
  )
  const gridEnabledSelector = selectors.createSelector(
    "gridEnabled",
    (_, { chart }) => Boolean(isGridEnabled(chart))
  )
  const isEditingChartSelector = selectors.createSelector(
    "isEditingChart",
    ({ chartEditor }): boolean => chartEditor.editing
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
  const violinDistributionPrecisionSelector = selectors.createSelector(
    "violinDistributionPrecision",
    (_, { chart: { violinDistributionPrecision } }) =>
      violinDistributionPrecision ?? DEFAULT_VIOLIN_PRECISION
  )

  const showNullDimensionsSelector = selectors.createSelector(
    "showNullDimensions",
    (_, { chart: { showNullDimensions } }) => showNullDimensions
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
  const uiConfigStylesSelector = selectors.createSelector(
    "uiConfigStyles",
    (state) => getUserConfigurableUISettings(state)
  )
  const shiftToZoomSelector = selectors.createSelector(
    "shiftToZoom",
    (_, { chart: { shiftToZoom } }) => Boolean(shiftToZoom)
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

  const centerLineTypeSelector = selectors.createSelector(
    "centerLineType",
    (_, { chart: { centerLineType } }) => centerLineType
  )

  // show or hide outlier points on box plot
  const outliersEnabledSelector = selectors.createSelector(
    "outliersEnabled",
    (_, { chart: { outliersEnabled } }) => outliersEnabled
  )

  const getSelectedFilterSetIdSelector = selectors.createSelector(
    "getSelectedFilterSetId",
    getSelectedFilterSetId
  )

  // SETTINGS SELECTORS
  // ==================

  const sharedSettingsSelector = selectors.createSelector(
    "sharedSettings",
    (state) => state.sharedSettings
  )

  const paletteMappingsSelector = selectors.createSelector(
    "paletteMappings",
    sharedSettingsSelector,
    (sharedSettings) => sharedSettings.mappings
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
    ) => scaleType ?? SCALE_TYPES.LINEAR
  )

  // If any input to this selector changes, it will force the data to
  // recalculate, forcing a redraw.
  const forceRedrawSelector = selectors.createSelector(
    "forceRedraw",
    paletteMappingsSelector,
    () => Date.now()
  )

  const topNOptionsSelector = selectors.createSelector(
    "topNoptions",
    dataSelectionsSelector,
    (dataSelections) =>
      dataSelections.map((dataSelection, index) => {
        if (dataSelection.table && dataSelection.dimensions.xAxis?.length > 0) {
          const topNOptions =
            dataSelection.topNoptions ||
            buildDefaultCustomizableTopNOptions(dataSelection.table.name, index)
          return topNOptions
        } else {
          return undefined
        }
      })
  )

  const baseMeasureSettingsSelector = selectors.createSelector(
    "baseMeasureSettings",
    dataSelectionsSelector,
    (dataSelections) => {
      const baseMeasure = dataSelections?.[0]?.measures?.size?.[0]
      return {
        visualizeAs: baseMeasure?.markSettings.markType ?? VegaMarkTypes.BOX
      }
    }
  )

  // DATA SELECTORS
  // ==============

  // Separates focus data from range data, depending on which chart this is.
  // Returns an array of data for each layer, where the layer data is a map
  // of data keys to arrays of data values.
  const rawDataSelector = selectors.createSelector(
    "rawData",
    chartDataSelector,
    forceRedrawSelector,
    (data) => {
      // return data
      return (
        data?.focus?.map(
          (layerBeats) =>
            getLatestBeatData(layerBeats) ||
            ({} as Partial<VegaBoxPlotLayerBeatData>)
        ) ?? []
      )
    },
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
            return !lastBeatData || lastBeatData.incomplete
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
    (rawData) => {
      return rawData?.[0]?.table ?? []
    }
  )

  const dataErrorSelector = selectors.createSelector(
    "dataError",
    rawDataSelector,
    (data) => {
      const dataErrors = data.map((layerData) => layerData.error)

      if (dataErrors.some((error) => typeof error !== "undefined")) {
        return dataErrors
      } else {
        return undefined
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

  // Separates data by axis and visualization (bar, line), then calculates
  // stacking, if necessary.
  // Returns an object mapping axis to an object mapping visualization type
  // (bar, line, area) to the data.

  // Returns shit like this, we don't need this RN, but I think we may need the
  // measure domain stuff which depends on this format (to reuse combo code) potentially.
  // {
  //   primary: {
  //     box: data
  //   }
  // }
  const dataByAxisAndVisualizationSelector = selectors.createSelector(
    "dataByAxisAndVisualization",
    dataSelector,
    (data) => {
      if (!Array.isArray(data) || data.length === 0) {
        return undefined
      }
      return {
        primary: {
          box: data
        }
      }
    }
  )

  // Computes the extents for each axis
  // Returns an object mapping axes to extents ([min, max])
  const computedMeasureDomainExtentsSelector = selectors.createSelector(
    "computedMeasureDomainExtents",
    dataByAxisAndVisualizationSelector,
    primaryMeasureScaleTypeSelector,
    (data, scaleType) => {
      return {
        primary: data?.primary
          ? extentByAxis(data.primary, {
              scaleType,
              minProperty: "measure0_min",
              maxProperty: "measure0_max"
            })
          : null
      }
    }
  )

  // Returns an object with the min/max of the measure domain, plus minLocked
  // and maxLocked (true/false) properties
  const measureDomainSelector = selectors.createSelector(
    "measureDomain",
    computedMeasureDomainExtentsSelector,
    manualPrimaryMeasureDomainMinSelector,
    manualPrimaryMeasureDomainMaxSelector,
    primaryMeasureScaleTypeSelector,
    outliersEnabledSelector,
    dataSelector,
    (
      computedMeasureDomainExtents,
      manualPrimaryMeasureDomainMin,
      manualPrimaryMeasureDomainMax,
      scaleType,
      outliersEnabled,
      data
    ): { [axis: string]: MeasureDomain | null } => {
      if (!computedMeasureDomainExtents?.primary) {
        return { primary: null }
      }

      // if outliers are enabled, use full data range
      // otherwise, use auto scaled range
      const range = outliersEnabled
        ? computedMeasureDomainExtents.primary
        : getBoxPlotAutoScaling(data)

      const domain = buildMeasureDomain(
        manualPrimaryMeasureDomainMin,
        manualPrimaryMeasureDomainMax,
        range,
        scaleType
      )

      return { primary: domain }
    },
    { equal: isEqual }
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

  const manualDomainExtentsSelector = selectors.createSelector(
    "manualDomainExtents",
    manualPrimaryMeasureDomainMinSelector,
    manualPrimaryMeasureDomainMaxSelector,
    measureDomainExtentsSelector,
    (manualMin, manualMax, measureDomainExtents) => {
      const [dataMin, dataMax] = measureDomainExtents.primary
      if (isNil(manualMin) && isNil(manualMax)) {
        return undefined
      }

      return [manualMin ?? dataMin, manualMax ?? dataMax]
    }
  )

  // Builds out tooltip data table from query data
  const tooltipTableSelector = selectors.createSelector(
    "tooltipTable",
    rawDataSelector,
    dataSelectionsSelector,
    topNOptionsSelector,
    paletteMappingsSelector,
    outliersEnabledSelector,
    primaryMeasureFormatSelector,
    measureDomainExtentsSelector,
    (
      data,
      dataSelections,
      topNOptions,
      paletteMappings,
      outliersEnabled,
      primaryMeasureFormat,
      measureDomainExtents
    ) => {
      return data.flatMap(({ table, outliersData }, index) => {
        if (!table || table.length === 0) {
          return []
        }

        const dataSelection = dataSelections[index]
        const layerTopNOptions = topNOptions[index]

        // pre-process and sort outlier data
        const outliersByDimension = {}
        if (outliersEnabled && outliersData?.length > 0) {
          for (const o of outliersData) {
            const key = o.dimension0
            if (!outliersByDimension[key]) {
              outliersByDimension[key] = []
            }
            outliersByDimension[key].push(o)
          }

          Object.keys(outliersByDimension).forEach((key) => {
            outliersByDimension[key].sort((a, b) => a.measure0 - b.measure0)
          })
        }

        return table.map((row) => {
          const rowOutliers = outliersByDimension[row?.dimension0] || []
          const sortedOutliers =
            rowOutliers.length > 0
              ? {
                  top: rowOutliers.slice(-10).reverse(),
                  bottom: rowOutliers.slice(0, 10)
                }
              : {}
          return fillTooltipData(
            row,
            sortedOutliers,
            dataSelection,
            layerTopNOptions,
            paletteMappings,
            primaryMeasureFormat,
            measureDomainExtents
          )
        })
      })
    }
  )

  const transformedDataSelector = selectors.createSelector(
    "transformedData",
    rawDataSelector,
    violinDistributionPrecisionSelector,
    tooltipTableSelector,
    dataSelectionsSelector,
    topNOptionsSelector,
    paletteMappingsSelector,
    // dataByVisualizationSelector,
    // measureSettingsSelector,
    (
      data,
      violinDistributionPrecision,
      tooltipTable,
      dataSelections,
      topNOptions,
      paletteMappings
    ) => {
      // TODO: This needs some reworking... just grab the table data manually RN tho
      const transformedViolinData = data?.flatMap(({ violinData }, index) => {
        const layerTopNOptions = topNOptions[index]
        const dataSelection = dataSelections[index]
        if (!violinData || violinData.length === 0) {
          return []
        } else {
          return transformViolinData(
            violinData,
            layerTopNOptions,
            violinDistributionPrecision,
            dataSelection,
            paletteMappings
          )
        }
      })

      const transformBoxPlotAndOutliersData = (source, index) => {
        if (!source || source.length === 0) {
          return []
        }

        return transformData(
          source,
          dataSelections[index],
          topNOptions[index],
          paletteMappings
        )
      }
      const transformedBoxPlotData = data?.flatMap(({ table }, index) =>
        transformBoxPlotAndOutliersData(table, index)
      )

      const transformedOutliersData = data?.flatMap(({ outliersData }, index) =>
        transformBoxPlotAndOutliersData(outliersData, index)
      )

      const finalData = cloneData({
        boxPlotTable: transformedBoxPlotData,
        violinPlotTable: transformedViolinData,
        outliersTable: transformedOutliersData,
        tooltipTable
      })
      setData(finalData)
      return finalData
    }
  )

  const isEmptyDataSelector = selectors.createSelector(
    "isEmptyData",
    dataErrorSelector,
    transformedDataSelector,
    baseMeasureSettingsSelector,
    (
      dataError,
      { boxPlotTable, violinPlotTable, tooltipTable },
      baseMeasureSettings
    ) => {
      const isArrayWithData = (arr) => Array.isArray(arr) && arr.length > 0

      const baseEmpty =
        !isArrayWithData(boxPlotTable) || !isArrayWithData(tooltipTable)

      const violinEmpty =
        baseMeasureSettings.visualizeAs === VegaMarkTypes.VIOLIN &&
        !isArrayWithData(violinPlotTable)

      const emptyData = baseEmpty || violinEmpty

      return dataError || emptyData
    }
  )

  // Returns an object containing:
  //   dimensions: an array of sorted dimensions - if the dimension is
  //               binned or extracted, gaps in the domain are filled in
  //   formatted: an object mapping dimension to formatted for display
  const sortedDimensionsSelector = selectors.createSelector(
    "sortedDimensions",

    // TODO: Do the sorting and formatting here
    transformedDataSelector,
    // firstPassTableDataSelector,
    // baseDimensionFormatterSelector,
    // Add back for binning
    // binsSelector,
    // sortColumnSelector,
    ({ boxPlotTable: data }) => {
      // , sortColumn) => {

      if (!Array.isArray(data)) {
        return {
          dimensions: [],
          formatted: {}
        }
      }
      const sortedDimensions = data.reduce(
        (acc, datum) => {
          const dimension = datum.dimension0
          acc.dimensions.push(dimension)
          acc.formatted[dimension] = dimension
          return acc
        },
        { dimensions: [], formatted: {} }
      )
      return sortedDimensions
    }
  )

  // VISUAL SELECTORS
  // ================
  // How much padding to have around the chart
  const chartPaddingSelector = selectors.createSelector(
    "chartPadding",
    isRangeChartSelector,
    (isRangeChart) =>
      isRangeChart
        ? {
            top: 0,
            right: 10,
            bottom: 10,
            left: 10
          }
        : 10
  )

  const joinFiltersSelector = selectors.createSelector(
    "joinFilters",
    omnifiltersSelector,
    dataSelectionsSelector,
    idSelector,
    (_, dataSelections, chartId) => {
      return dataSelections.reduce(
        (
          acc: {
            [key: string]: Array<object>
          },
          ds
        ) => {
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

  // Returns which axes are enabled
  const enabledAxesSelector = selectors.createSelector(
    "enabledAxes",
    // TODO: Could def add the check back now, we have min/max
    // measureDomainSelector,
    () => ({
      showPrimaryAxis: true
    }),
    { equal: isEqual }
  )

  // Returns the titles for the measure axes as an object with primary and
  // secondary keys. Titles are unprocessed for parameters.
  const unprocessedMeasureTitlesSelector = selectors.createSelector(
    "unprocessedMeasureTitles",
    enabledAxesSelector,
    rawPrimaryMeasureTitleSelector,
    dataSelectionsSelector,
    ({ showPrimaryAxis }, primaryTitle, dataSelections) => {
      return {
        primary: showPrimaryAxis
          ? primaryTitle ??
            dataSelections
              .flatMap((ds) =>
                ds.measures.size.map((label) => getMeasureLabel(label))
              )
              .join(" / ")
          : null
      }
    }
  )

  // Returns the titles for the measure axes as an object with primary and
  // secondary keys
  const measureTitlesSelector = selectors.createSelector(
    "measureTitles",
    idSelector,
    unprocessedMeasureTitlesSelector,
    parameterValuesForChartSelector,
    (chartId, { primary }, _params) => ({
      primary:
        primary &&
        processParameters(primary, {
          chartId,
          token: "primary-measure-title",
          useDisplayName: true,
          trackUsage: true
        })
    })
  )

  // Returns a title for the base dimension axis - title is unprocessed for
  // params
  const unprocessedBaseDimensionTitleSelector = selectors.createSelector(
    "unprocessedBaseDimensionTitle",
    rawBaseDimensionTitleSelector,
    dataSelectionsSelector,
    parameterValuesForChartSelector,
    (
      title,
      dataSelections,
      _params // force update when params change
    ) =>
      title ||
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

  // MAIN DATA RELATED SELECTORS
  // ===========================

  // Build query spec for "table" data (chart[X].data[Y].table in redux. This
  // is the main data that is displayed in the chart.
  // Returns an array of VegaComboQuerySpecs per layer.
  const tableQuerySpecSelector = selectors.createSelector(
    "tableQuerySpec",
    dataSelectionsSelector,
    sortColumnSelector,
    appliedFiltersSelector,
    violinDistributionPrecisionSelector,
    numberOfGroupsSelector,
    showNullDimensionsSelector,
    joinFiltersSelector,
    centerLineTypeSelector,
    outliersEnabledSelector,
    manualDomainExtentsSelector,
    boxPlotChartToChartQuerySpec
  )

  const colorDomainSelector = selectors.createSelector(
    "colorDomainSelector",
    dataSelectionsSelector,
    dataSelector,
    () => {
      return []
      // return data.reduce((layerMappingsAcc, layer, index) => {
      //   const { table: layerData } = layer
      //   const dataSelection = dataSelections[index]
      //   const hasMeasureColor = Boolean(dataSelection.measures.color)
      //   const isCategoricalMeasureColor =
      //     hasMeasureColor &&
      //     Boolean(dataSelection.measures.color?.aggregate === "Mode")
      //   const paletteMapping = dataSelection.measures.color?.paletteMappingId
      //   const measureOptions = dataSelection.measureTopNOptions
      //   const colorKey = getColorKey(measureOptions, paletteMapping)
      //   const colors = getOrdinalPalette(colorKey)
      //   const allColors = layerData?.reduce(
      //     (domainRangeAcc, d) => {
      //       const categoricalColor = isCategoricalMeasureColor
      //         ? determineColorByValue(d.measureColor, colors)
      //         : null
      //       if (categoricalColor) {
      //         domainRangeAcc[0].push(d.measureColor)
      //         domainRangeAcc[1].push(categoricalColor)
      //       }
      //       return domainRangeAcc
      //     },
      //     [[], []]
      //   )
      //   layerMappingsAcc.push(allColors)
      //   return layerMappingsAcc
      // }, [])
    }
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
    (cf) => selectedValuesFromCrossfilter(cf, {})
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

  // SIGNAL HANDLERS
  // ===============

  const onFilterSelector = selectors.createSelector(
    "onFilter",
    idSelector,
    selectedValuesSelector,
    crossfilterNameSelector,
    transformedDataSelector,
    dataSelectionsSelector,
    (id, selectedData, crossfilterName, data, dataSelections) => (
      _name: string,
      evt?: SelectedValue
    ) => {
      // When the chart first loads, it'll fire this listener with a null value
      // - ignore that
      if (!evt || !data) {
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

      buildFilters(store, id, crossfilterName, data, dataSelections, values)
    }
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
      isRangeChart,
      isEditingChart,
      lastStreamingDataRequest,
      parameterValuesInUse,
      crossfilterTokenFilters
    ): VegaBoxPlotQuerySpec => {
      forceFetch =
        forceFetch ||
        lastStreamingDataRequest !== lastForcedDataFetch ||
        !isEqual(parameterValuesInUse, lastParameterValuesInUse) ||
        lastCrossfilterTokenFilters !== crossfilterTokenFilters
      lastForcedDataFetch = lastStreamingDataRequest
      lastParameterValuesInUse = parameterValuesInUse
      lastCrossfilterTokenFilters = crossfilterTokenFilters

      const querySpec = {
        type: "vega-box-plot" as const,
        dataKey: isRangeChart ? ("range" as const) : ("focus" as const),
        table: tableQuerySpecs
      }
      debouncedFetchData(dashboardId, tabId, id, querySpec, isEditingChart)
      return querySpec
    }
  )

  const zoomToSelector = selectors.createSelector(
    "zoomTo",
    (_, { zoomTo }) => zoomTo
  )

  // selected (or inversely selected) bars, or brush values
  const selectedValuesSignalSelector = selectors.createSelector(
    "selectedValuesSignal",
    selectedValuesSelector,
    ({ enabled, selectedValues, negativeSelectedValues }) =>
      enabled
        ? {
            selectedValues,
            negativeSelectedValues
          }
        : { selectedValues: [], negativeSelectedValues: [] }
  )

  // Combined signalValues to VegaChartComponent. Return value is never
  // actually used - instead, this is called if any dependency updates and then
  // it forwards the values to vega through the vegaChannel.
  selectors.createSelector(
    "signalValues",
    sortedDimensionsSelector,
    zoomToSelector,
    baseDimensionTitleSelector,
    measureTitlesSelector,
    measureDomainSelector,
    selectedValuesSignalSelector,
    primaryMeasureFormatSelector,
    (
      { dimensions: dimensionDomain, formatted: formattedDimensions },
      incomingZoom,
      baseDimensionTitle,
      { primary: primaryMeasureTitle },
      { primary: primaryMeasureDomain },
      selectedValues,
      primaryMeasureFormat
    ) => {
      const values = {
        dimensionDomain,
        formattedDimensions,
        incomingZoom,
        baseDimensionTitle,
        primaryMeasureTitle,
        // Primary measure domain will reflect manual changes to the manual
        // min/max inputs, it's what is shown to the user
        primaryMeasureDomain: [
          primaryMeasureDomain?.min,
          primaryMeasureDomain?.max
        ],
        // Full measure domain of the data, not bounded by the min/max inputs, but includes
        // chart/global filters and such.
        computedMeasureDomain: [
          primaryMeasureDomain?.computedMin,
          primaryMeasureDomain?.computedMax
        ],
        primaryMeasureFormat,
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

  // signal listeners
  selectors.createSelector(
    "signalListeners",
    onFilterSelector,
    onClearFiltersSelector,
    (filter, clearFilters) => {
      const listeners = {
        filter,
        clearFilters
      }
      vegaChannel.setSignalListeners(listeners)
      return listeners
    }
  )

  // MISC
  // ====
  const uiThemeSelector = selectors.createSelector(
    "uiTheme",
    (state) => state.userConfigurableUI.uiTheme
  )
  const isDarkOrCustomModeSelector = selectors.createSelector(
    "darkMode",
    uiThemeSelector,
    (uiTheme) => isThemeDarkOrCustom(uiTheme)
  )

  // Returns a vega config. See: https://vega.github.io/vega/docs/config/
  const vegaConfigSelector = selectors.createSelector(
    "vegaConfig",
    uiConfigStylesSelector,
    isDarkOrCustomModeSelector,
    (uiConfigStyles, darkOrCustomMode): vega.Config => {
      const axisTickStyles = uiConfigStyles.text[UI_CONFIG_AXIS_TICK_LABEL]
      const defaultAxisTickStyles =
        DEFAULT_DATABASE_STYLES.text[UI_CONFIG_AXIS_TICK_LABEL]
      const axisTitleStyles = uiConfigStyles.text[UI_CONFIG_AXIS_TITLE]
      const defaultAxisTitleStyles =
        DEFAULT_DATABASE_STYLES.text[UI_CONFIG_AXIS_TITLE]

      const axisColor = darkOrCustomMode
        ? DEFAULT_DARK_MODE_AXIS_COLOR
        : DEFAULT_LIGHT_MODE_AXIS_COLOR

      const gridColor = darkOrCustomMode
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

  const specSelector = selectors.createSelector(
    "spec",
    chartPaddingSelector,
    shiftToZoomSelector,
    gridEnabledSelector,
    centerLineTypeSelector,
    violinDistributionPrecisionSelector,
    outliersEnabledSelector,
    rawOrientationSelector,
    baseMeasureSettingsSelector,
    (
      padding,
      shiftToZoom,
      gridEnabled,
      centerLineType,
      violinDistributionPrecision,
      outliersEnabled,
      orientation,
      baseMeasureSettings
    ) => {
      const opts: any = {
        padding,
        shiftToZoom,
        gridEnabled,
        centerLineType,
        outliersEnabled,
        // Shouldn't be needed, but if a chart does not have this property this ensures
        // that the spec and query are defaulted property
        violinDistributionPrecision,
        baseMeasureSettings
      }
      const spec = buildSpec(opts)
      if (orientation === "row") {
        return transformColumnSpecToRow(spec, opts)
      }
      return spec
    }
  )

  return (state, props) => {
    selectors.recalculate(state, props)

    const { width } = props.chart
    const height = heightSelector()
    const vegaConfig = vegaConfigSelector()
    const isLoadingData = isLoadingDataSelector()
    const dataError = dataErrorSelector()

    const colorDomains = colorDomainSelector()
    const measureColorRange = measureColorRangeSelector()
    const isEditingChart = isEditingChartSelector()
    const isEmptyData = isEmptyDataSelector()
    const { primary: primaryMeasureTitle } = measureTitlesSelector()
    const dimensionTitle = baseDimensionTitleSelector()
    const orientation = rawOrientationSelector()

    // Vega spec
    const spec = specSelector()

    const { LEFT, BOTTOM } = AxisOrientation
    const primaryMeasureDomainOrientation =
      orientation === "column" ? LEFT : BOTTOM
    // const baseDimensionDomainOrientation =
    //   orientation === "column" ? BOTTOM : LEFT
    const dimensionTitleOrientation = orientation === "column" ? BOTTOM : LEFT
    const primaryMeasureTitleOrientation =
      orientation === "column" ? LEFT : BOTTOM

    const { primary: primaryMeasureDomain } = measureDomainSelector()

    return {
      id: idSelector(),
      spec,
      vegaConfig,
      width,
      height,
      vegaChannel,
      isLoadingData,
      isEmptyData,
      dataError,
      measureColorRange,
      isEditingChart,
      getChartBodySizeAndPosition,
      colorDomains,
      enableMeasureDomainEditing: true,
      enableAxisTitleEditing: true,
      primaryMeasureTitle,
      dimensionTitle,
      dimensionTitleOrientation,
      primaryMeasureTitleOrientation,
      primaryMeasureDomainOrientation,
      primaryMeasureDomain
    }
  }
}

export const mapDispatchToProps = () => {
  // the bound action creators never change, so memoize this
  const actions = defaultMemoize((dispatch) => ({
    actions: bindActionCreators(
      {
        clearFilterByName,
        setBaseDimensionTitle,
        setPrimaryMeasureTitle,
        setManualPrimaryMeasureDomainMin,
        setManualPrimaryMeasureDomainMax,
        clearManualPrimaryMeasureDomainMin,
        clearManualPrimaryMeasureDomainMax
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
)(BoxPlotChart)
