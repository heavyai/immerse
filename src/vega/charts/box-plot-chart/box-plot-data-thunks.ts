// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { cloneDeep, isEqual } from "lodash"

import { createQueuedConnector } from "services/ConnectorWithQueue"

import { buildTopNQuery, getSentinelValue } from "vega/utils/query-building"
import {
  requestData,
  receiveData,
  receiveError
} from "vega/actions/vega-data-action-creators"

import {
  ComputedMinMax,
  VegaQuerySpec,
  VegaComboLayerBeatData,
  VegaComboChart,
  DataKey,
  VegaBoxPlotChartQuerySpec,
  VegaBoxPlotChart,
  VegaLayerBeatData
} from "vega/charts/types"
import {
  getLatestBeatData,
  getComputedMinMax,
  ChartLayerId,
  BeatId
} from "vega/utils/data"
import { getBoxPlotAutoScaling } from "vega/utils/scales"
import {
  transformCustomTopNData,
  buildDefaultCustomizableTopNOptions
} from "vega/charts/top-n-utils"
import { resetChartBinToDefault } from "vega/actions/bin-settings-thunks"
import { validateBinSettings } from "vega/utils/binning"
import { VegaMarkTypes } from "vega/constants/data-selection-types"
import {
  buildBoxPlotQuery,
  buildViolinPlotQuery,
  buildOutliersQuery
} from "./query-building"
import { buildFinalOutliers } from "./helpers/buildFinalOutliers"

// Map from layerId and beatIds per layer to in-flight promises around
// the queries for a single thunk - so that later runs can wait on older
// ones and queue up
const flightPromisesByChartLayer: Record<
  ChartLayerId,
  Record<BeatId, Promise<any>>
> = {}

// Map from chartId-layerId to last querySpecs for that chart/layer
const createLastSpecsByKey = () => ({
  ["focus" as DataKey]: {
    lastChartQuerySpecByChartLayer: {} as Record<
      ChartLayerId,
      VegaBoxPlotChartQuerySpec
    >,
    lastGroupByQuerySpecByChartLayer: {} as Record<
      ChartLayerId,
      VegaBoxPlotChartQuerySpec | undefined
    >
  },
  ["range" as DataKey]: {
    lastChartQuerySpecByChartLayer: {} as Record<
      ChartLayerId,
      VegaBoxPlotChartQuerySpec
    >,
    lastGroupByQuerySpecByChartLayer: {} as Record<
      ChartLayerId,
      VegaBoxPlotChartQuerySpec | undefined
    >
  }
})

// Map from chartId-layerId to last querySpecs for that chart/layer
let lastSpecsByKey = createLastSpecsByKey()

const buildChartLayerId = (chartId: string, layerId: string): ChartLayerId =>
  `${chartId}-${layerId}`

/** Clears the spec cache during dashboard load. */
export const clearVegaSpecCache = () => {
  lastSpecsByKey = createLastSpecsByKey()
}

export const boxPlotQueryThunk = (
  dashboardId: string,
  tabId: string,
  chartId: string,
  querySpec: VegaQuerySpec,
  force?: boolean
) => async (dispatch, getState, services) => {
  // Create a queued connector for each table
  const connectors: Record<
    string,
    ReturnType<typeof createQueuedConnector>
  > = querySpec.table.reduce((prev, current, i) => {
    return {
      ...prev,
      [i]: createQueuedConnector({
        connector: services.get("DbCon"),
        chartId,
        keyModifier: i,
        dashboardId: getState().dashboard.id,
        tableName: current.table
      })
    }
  }, {})

  const { charts } = getState()

  const chart = charts[chartId] as VegaBoxPlotChart
  const baseDimensionScaleSettings = chart?.binSettings
  const currentData = chart.data?.[querySpec.dataKey]
  const dataSelections = chart.dataSelections
  const numTopNGroups = querySpec.groupByDimension?.reduce(
    (acc, groupSpec) => Math.max(acc, groupSpec?.count || 0),
    1
  )
  if (!dataSelections.length) {
    throw new Error("Empty data selections")
  }

  const currentDataByLayer = (currentData || []).map(getLatestBeatData)

  // For each layer, check whether the filters have changed, or if any other
  // part of the query spec has changed
  let changedLayers = dataSelections.map((dataSelection, layerIndex) => {
    const {
      lastChartQuerySpecByChartLayer
      // lastGroupByQuerySpecByChartLayer
    } = lastSpecsByKey[querySpec.dataKey]

    const chartLayerId = buildChartLayerId(chartId, dataSelection.layerId)
    const lastChartQuerySpec = lastChartQuerySpecByChartLayer[chartLayerId]
    // const lastGroupByQuerySpec = lastGroupByQuerySpecByChartLayer[chartLayerId]

    const chartQuerySpec = querySpec.table[layerIndex]
    // Add back for
    // const groupByQuerySpec = querySpec.groupByDimension[layerIndex]

    lastChartQuerySpecByChartLayer[chartLayerId] = cloneDeep(chartQuerySpec)
    // lastGroupByQuerySpecByChartLayer[chartLayerId] = cloneDeep(groupByQuerySpec)

    // If we're forcing the chart to update, set all layers to true
    if (force) {
      return true
    }

    const tableEqual = isEqual(chartQuerySpec, lastChartQuerySpec)
    // const groupByEqual = isEqual(groupByQuerySpec, lastGroupByQuerySpec)

    return !tableEqual || !currentDataByLayer[layerIndex] // || !groupByEqual
  })

  // Generate new beat IDs per layer
  const beatIds = dataSelections.map((_, layerIndex) => {
    const layerData = chart.data?.[querySpec.dataKey]?.[layerIndex]

    // We store the data objects as a stream of running 'beats' (could also be
    // 'epochs', 'cycles', 'flights', 'versions'. 'beats' just sounds more
    // fun). One 'beat' represents a complete cycle of fetching data in
    // response to a data selection or filter update, including all queries.
    // This ensures that the latest data gets stored in order of when it's
    // requested, rather than in order of when it's returned. It also ensures
    // that preflight data for a given update cycle stay with the chart query
    // + data. It also allows us to cleanly handle an in-place update (filters
    // only) vs. an update that changes the chart somehow (assumed to be any
    // non-filter update to the querySpec, for now). For in-place, the data is
    // only replaced when all queries are complete - for the latter, the old
    // data's cleared out right away. Finally, it unlocks potentially storing
    // more than one version of data at a time - for incremental updates /
    // transitions, or tracking history.

    // Here, we generate an ID for this new beat. Beat IDs increase in a
    // sortable way, and the chart will always select the latest beat that has
    // data.
    let beatId = "1"
    if (layerData) {
      const pastBeatIds = Object.keys(layerData)
        .map(Number)
        .sort((a, b) => a - b)

      if (pastBeatIds.length) {
        beatId = String(pastBeatIds[pastBeatIds.length - 1] + 1)
      }
    }

    return beatId
  })

  const newerFlightForLayer = (layerIndex: number, requestTabId: string) => {
    const currentTabId = getState().dashboard?.selectedTabId

    if (requestTabId !== currentTabId) {
      return true
    }

    const latestData = (getState().charts[chartId] as VegaComboChart).data?.[
      querySpec.dataKey
    ]
    for (const beatId in latestData[layerIndex]) {
      if (Number(beatIds[layerIndex]) < Number(beatId)) {
        return true
      }
    }
    return false
  }

  let combinedMinMax: ComputedMinMax | null = null

  if (changedLayers.some((layer) => layer)) {
    // Just storing the queries to run later (inside of the main flight promise)
    const minMaxQueries: {
      table: string
      query: string
    }[] = []
    const fullMinMaxQueries: {
      table: string
      query: string
    }[] = []

    // const supportsTimeScale = isSupportsTimeScale(dataSelections)

    // const supportsNumericScale = isSupportsNumericalScale(dataSelections)

    // If in the chart editor, and we have a min/max compatible set of
    // data selections, fire off the min/max query no matter what to be
    // able to use it for data selection controls
    // const minmaxNeededInChartEditor =
    //   isEditingChart && (supportsTimeScale || supportsNumericScale)

    // With a binned scale, we need the min/max all the time, in or out
    // of the chart editor
    const binnedScale =
      baseDimensionScaleSettings?.dimensionType === "binned_numeric" ||
      baseDimensionScaleSettings?.dimensionType === "binned_time"

    // if (binnedScale || minmaxNeededInChartEditor) {
    // We don't need to get the min/max outside the chart editor if we
    // already have both of them set manually, though
    // const needDynamicMinMax =
    //   minmaxNeededInChartEditor ||
    //   // Range charts ignore manual min/max
    //   querySpec.dataKey === "range" ||
    //   ((baseDimensionScaleSettings?.dimensionType === "binned_numeric" ||
    //     baseDimensionScaleSettings?.dimensionType === "binned_time") &&
    //     (baseDimensionScaleSettings.manualMin === null ||
    //       baseDimensionScaleSettings.manualMax === null))

    // if (needFullMinMax) {
    //   // Save a list of fullMinMax queries with their associated table name
    //   fullMinMaxQueries = dataSelections.map((_, layerIndex) => ({
    //     table: _.table?.name || "",
    //     query: buildFullMinMaxQuery(querySpec.table[layerIndex])
    //   }))
    // }

    //   if (needDynamicMinMax || needFullMinMax) {
    //     // The min/max is used for all layers, so if we are retrieving it
    //     // dynamically, then all layers now have to update
    //     changedLayers = changedLayers.map((_) => true)
    //   }
    // }

    // At this point, fire off the requestData actions to register these
    // new beats as pending
    await Promise.all(
      changedLayers.map((layer, layerIndex) => {
        if (layer) {
          return dispatch(
            requestData(
              chartId,
              dashboardId,
              tabId,
              querySpec.dataKey,
              layerIndex,
              beatIds[layerIndex]
            )
          )
        } else {
          return null
        }
      })
    )

    // Now, collect any past flight promises (ones with lower beat IDs per layer)
    const pastFlights = changedLayers.flatMap((layer, layerIndex) => {
      const chartLayerId = buildChartLayerId(
        chartId,
        dataSelections[layerIndex].layerId
      )
      const flightsForLayer = layer && flightPromisesByChartLayer[chartLayerId]

      return flightsForLayer
        ? Object.entries(flightsForLayer).map(([beatId, thunkPromise]) => {
            if (Number(beatId) < Number(beatIds[layerIndex])) {
              return thunkPromise
            } else {
              return undefined
            }
          })
        : undefined
    })

    // Now wait for all past flights before continuing - we don't want to send
    // any queries yet until there aren't any more in flight for this chart
    // (layer IDs are unique per chart)
    await Promise.all(pastFlights)

    // For each layer, if newer beats in data, cancel that layer
    changedLayers = changedLayers.map((layer, layerIndex) => {
      if (layer) {
        return !newerFlightForLayer(layerIndex, tabId)
      } else {
        return layer
      }
    })

    // Bail if we don't have any layers left to update
    if (
      getState().dashboard.selectedTabId !== tabId ||
      !changedLayers.some((layer) => layer)
    ) {
      return Promise.resolve()
    }

    const fullMinMaxPromise = Promise.all(
      fullMinMaxQueries.map(({ query }, i) =>
        connectors[i].queryAsync(query, {}, "fullMinMaxQuery")
      )
    )

    const minmaxPromise = minMaxQueries
      ? Promise.all(
          minMaxQueries.map(({ query }, i) =>
            connectors[i].queryAsync(query, {}, "minMaxQuery")
          )
        )
      : Promise.resolve([])

    // Now we need to send the min/max queries, so start up a single Promise
    // that contains the rest of the thunk and all queries it needs to send,
    // so it can be stored and awaited by later thunks
    const flightPromise = minmaxPromise
      .then(async (minmaxData) => {
        if (binnedScale) {
          combinedMinMax = getComputedMinMax(
            minmaxData,
            baseDimensionScaleSettings,
            querySpec.dataKey === "range",
            querySpec.table[0].rangeFilter
          )

          if (
            !validateBinSettings(
              chart.binSettings,
              combinedMinMax,
              numTopNGroups
            )
          ) {
            // The bin settings are invalid - reset them to default.
            // This should trigger a new fetchData
            dispatch(resetChartBinToDefault(chartId))
            return
          }
        }

        // For each layer, if newer beats in data, cancel that layer
        changedLayers = changedLayers.map((layer, layerIndex) => {
          if (layer) {
            return !newerFlightForLayer(layerIndex, tabId)
          } else {
            return layer
          }
        })

        // Bail if we don't have any layers left to update
        if (
          getState().dashboard.selectedTabId !== tabId ||
          !changedLayers.some((layer) => layer)
        ) {
          return
        }

        await Promise.all(
          dataSelections.map(async (dataSelection, layerIndex) => {
            // Get the queued connector for this dataSelection's table
            const DbCon = connectors[layerIndex]
            if (changedLayers[layerIndex]) {
              const groupBySpec = querySpec.groupByDimension?.[layerIndex]
              const tableSpec = querySpec.table[layerIndex]

              if (!dataSelection.table) {
                throw new Error("Data selection has no table")
              }

              if (minmaxData) {
                // If we have minmax data, we'll write it into redux, but
                // mark it incomplete. This is necessary to support
                // chart-specific params such as ${chart.timebin}
                const incompletedata: VegaComboLayerBeatData = {
                  incomplete: true,
                  minmaxQuery: minMaxQueries[layerIndex]
                    ? minMaxQueries[layerIndex].query
                    : null,
                  minmax: minmaxData[layerIndex],
                  groupByDimensionQuery: null,
                  groupByDimension: null,
                  allOthersSentinel: undefined,
                  tableQuery: null,
                  table: null,
                  fullMinMax: minmaxData[layerIndex]
                }

                await dispatch(
                  receiveData(
                    chartId,
                    dashboardId,
                    tabId,
                    querySpec.dataKey,
                    layerIndex,
                    beatIds[layerIndex],
                    incompletedata
                  )
                )
              }

              const topNOptions =
                dataSelection.topNoptions ||
                buildDefaultCustomizableTopNOptions(
                  dataSelection.table.name,
                  layerIndex
                )

              let topNQuery = null
              let topNPromise = null
              if (groupBySpec) {
                topNQuery = buildTopNQuery(
                  groupBySpec,
                  tableSpec.baseDimensions[0],
                  combinedMinMax
                )
                topNPromise = DbCon.queryAsync(topNQuery, {}, "topN")
              }

              try {
                const topNData = await topNPromise

                const fullMinMaxData = await fullMinMaxPromise

                // Check again if we should cancel
                if (newerFlightForLayer(layerIndex, tabId)) {
                  return Promise.resolve()
                }

                if (topNData) {
                  const selectedPaletteMapping = getState().sharedSettings.mappings.find(
                    (m) =>
                      m.id === dataSelection.dimensions.color?.paletteMappingId
                  )
                  const transformedTopNData = transformCustomTopNData(
                    topNData,
                    topNOptions,
                    String(layerIndex),
                    selectedPaletteMapping
                  )

                  const enabledTopNGroups = transformedTopNData
                    ?.filter(
                      (datum) => !datum.disabled && "originalKey" in datum
                    ) // topN value can be bool
                    .map((datum) => datum.originalKey)

                  const {
                    allOthersSentinel,
                    allOthersGroupEnabled
                  } = getSentinelValue(
                    topNOptions,
                    enabledTopNGroups,
                    tableSpec
                  )

                  const query = buildBoxPlotQuery({
                    querySpec: tableSpec,
                    layerIndex,
                    minmax: combinedMinMax,
                    numTopNGroups,
                    enabledTopNGroups,
                    allOthersGroupEnabled,
                    allOthersSentinel
                  })
                  const tableData = await DbCon.queryAsync(
                    query,
                    {},
                    "box-plot"
                  )

                  // Check again if we should cancel
                  if (newerFlightForLayer(layerIndex, tabId)) {
                    return Promise.resolve()
                  }

                  const data: VegaComboLayerBeatData = {
                    minmaxQuery: minMaxQueries[layerIndex]
                      ? minMaxQueries[layerIndex].query
                      : null,
                    minmax: minmaxData ? minmaxData[layerIndex] : null,
                    groupByDimensionQuery: topNQuery,
                    groupByDimension: topNData,
                    allOthersGroupEnabled,
                    allOthersSentinel,
                    tableQuery: query,
                    table: tableData,
                    fullMinMax:
                      fullMinMaxData[layerIndex] || minmaxData[layerIndex]
                  }

                  return dispatch(
                    receiveData(
                      chartId,
                      dashboardId,
                      tabId,
                      querySpec.dataKey,
                      layerIndex,
                      beatIds[layerIndex],
                      data
                    )
                  )
                } else {
                  const currentMarkType =
                    tableSpec.sizeMeasures[0].markSettings.markType
                  const query = buildBoxPlotQuery({
                    querySpec: tableSpec,
                    layerIndex,
                    minmax: combinedMinMax,
                    numTopNGroups
                  })
                  const outliersQuery = buildOutliersQuery({
                    querySpec: tableSpec
                  })

                  let tableData = []
                  let finalOutliers = []
                  if (tableSpec.outliersEnabled) {
                    const results = await Promise.all([
                      DbCon.queryAsync(query, {}, "box-plot"),
                      DbCon.queryAsync(outliersQuery, {}, "box-plot-outliers")
                    ])
                    tableData = results[0]
                    finalOutliers = buildFinalOutliers(results[1], tableData)
                  } else {
                    tableData = await DbCon.queryAsync(query, {}, "box-plot")
                  }

                  // Grab domain values and measure min/max from table data
                  const domainValues = new Set(
                    tableData.map((d) => d.dimension0)
                  )
                  // if we have a manually set domain, use that
                  // otherwise, if outliers are on, get full data min/max
                  // if outliers are off, auto-scale domain
                  const measureMinMax =
                    tableSpec.manualDomainExtents ??
                    (tableSpec.outliersEnabled
                      ? tableData.reduce((acc: number[], td) => {
                          // First time around, set our min/max to measure min max of this bucket
                          if (!acc.length) {
                            return [td.measure0_min, td.measure0_max]
                          }

                          const [min, max] = acc

                          return [
                            td.measure0_min !== null && min !== null
                              ? Math.min(min, td.measure0_min)
                              : td.measure0_min ?? min,
                            td.measure0_max !== null && max !== null
                              ? Math.max(max, td.measure0_max)
                              : td.measure0_max ?? max
                          ]
                        }, [])
                      : getBoxPlotAutoScaling(tableData))

                  let violinData = []
                  const violinQuery = buildViolinPlotQuery({
                    querySpec: tableSpec,
                    layerIndex,
                    minmax: measureMinMax,
                    domainValues
                  })
                  if (currentMarkType === VegaMarkTypes.VIOLIN) {
                    violinData = await DbCon.queryAsync(
                      violinQuery,
                      {},
                      "violin-plot"
                    )
                  }

                  // Check again if we should cancel
                  if (newerFlightForLayer(layerIndex, tabId)) {
                    return Promise.resolve()
                  }
                  const data: VegaLayerBeatData = {
                    minmaxQuery: minMaxQueries[layerIndex]
                      ? minMaxQueries[layerIndex].query
                      : null,
                    minmax: minmaxData ? minmaxData[layerIndex] : null,
                    groupByDimensionQuery: topNQuery,
                    groupByDimension: topNData,
                    tableQuery: query,
                    table: tableData,
                    fullMinMax:
                      fullMinMaxData[layerIndex] || minmaxData[layerIndex],
                    violinData,
                    violinQuery,
                    outliersData: finalOutliers,
                    outliersQuery
                  }

                  return dispatch(
                    receiveData(
                      chartId,
                      dashboardId,
                      tabId,
                      querySpec.dataKey,
                      layerIndex,
                      beatIds[layerIndex],
                      data
                    )
                  )
                }
              } catch (error) {
                return dispatch(
                  receiveError(
                    chartId,
                    dashboardId,
                    tabId,
                    querySpec.dataKey,
                    layerIndex,
                    beatIds[layerIndex],
                    error
                  )
                )
              }
            } else {
              return Promise.resolve()
            }
          })
        )

        // We're done, so clear the promises (stored below)
        changedLayers.forEach((_, layerIndex) => {
          const chartLayerId = buildChartLayerId(
            chartId,
            dataSelections[layerIndex].layerId
          )

          if (flightPromisesByChartLayer[chartLayerId]) {
            delete flightPromisesByChartLayer[chartLayerId][beatIds[layerIndex]]
          }
        })
      })
      .catch((error) => {
        // This means one of the min/max queries failed, because the rest are in try/catch,
        // so store error for all layers
        return Promise.all(
          dataSelections.map((_, layerIndex) =>
            dispatch(
              receiveError(
                chartId,
                dashboardId,
                tabId,
                querySpec.dataKey,
                layerIndex,
                beatIds[layerIndex],
                error
              )
            )
          )
        )
      })

    // Store the flight promise for each layer ID - it might be that only
    // one of the layers need to wait on it next time
    changedLayers.forEach((layer, layerIndex) => {
      if (layer) {
        const chartLayerId = buildChartLayerId(
          chartId,
          dataSelections[layerIndex].layerId
        )

        if (!flightPromisesByChartLayer[chartLayerId]) {
          flightPromisesByChartLayer[chartLayerId] = {}
        }

        flightPromisesByChartLayer[chartLayerId][
          beatIds[layerIndex]
        ] = flightPromise
      }
    })

    return flightPromise
  } else {
    return Promise.resolve()
  }
}
