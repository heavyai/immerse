// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  enqueue,
  QUEUE_RESOLUTION,
  clearQueues
} from "utils/performance/MagicQueue"
import {
  getSharedCache,
  makeCached,
  purgeSharedCache
} from "utils/performance/MagicCache"
import { tableToJson } from "utils/arrow"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

import {
  setChartDataError,
  clearChartDataError
} from "actions/chart-error-state-action-creators"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { shouldTrackUsage } from "utils/ImmerseSQLPlusPlus/trackable-tokens"

import { getStore } from "services/ImmerseCrossFilter/utils"
import { populateImportableCreateQueuedConnector } from "./ConnectorWithQueue-importable"
import { saveChartData } from "components/chart-data/chart-data-action-creators"
import { setPaused } from "@heavyai/charting/src/constants/paused"

const paused = {}
const pausedMapMove = {}
const cachedQueuedConnectors = {}

export function purgeQueues() {
  clearQueues()
  purgeSharedCache()
  Object.keys(cachedQueuedConnectors).forEach(
    (key) => delete cachedQueuedConnectors[key]
  )
  Object.keys(paused).forEach((key) => delete paused[key])
  Object.keys(pausedMapMove)
    .filter((key) => key !== "-all")
    .forEach((key) => delete pausedMapMove[key])
  setPaused(false)
}

export function pauseCrossFilter(newPaused, chartId = "-all") {
  paused[chartId] = newPaused

  setPaused(newPaused)

  return paused
}

export function isCrossFilterPaused(chartId = "-all") {
  return paused[chartId] || paused["-all"]
}

export function pauseMapMoveCrossFilter(newPaused, chartId = "-all") {
  pausedMapMove[chartId] = newPaused
  return paused
}

export function isMapMoveCrossFilterPaused(chartId = "-all") {
  return pausedMapMove[chartId] || pausedMapMove["-all"]
}

if (getFeatureFlag(available_feature_flags.CROSSFILTER_PAUSE_MAPMOVE)) {
  pauseMapMoveCrossFilter(true, "-all")
}

export function createQueuedConnector({
  connector,
  dashboardId,
  chartId,
  // Use keyModifier to add a token that differentiates between queries that
  // share the same chartId but should have different queues (e.g. focus/range)
  keyModifier = "",
  tableName
}) {
  if (!getFeatureFlag(available_feature_flags.ENABLE_GLOBAL_CHART_QUEUE)) {
    return connector
  }

  const keySuffix = keyModifier !== "" ? `-${keyModifier}` : ""

  if (connector.isQueued) {
    if (
      connector.chartId === chartId &&
      connector.keyModifier === keyModifier &&
      connector.dashboardId === dashboardId &&
      connector.tableName === tableName
    ) {
      return connector
    } else {
      connector = connector.connector
    }
  }

  const connectorKey = `${chartId}/${keyModifier}/${dashboardId}/${tableName}`
  if (cachedQueuedConnectors[connectorKey]) {
    return cachedQueuedConnectors[connectorKey]
  }

  const sharedCache = getSharedCache(tableName)
  const sharedVegaCache = getSharedCache(`${tableName},vega`)
  const queuedQueryAsync = enqueue(
    getFeatureFlag(available_feature_flags.USE_ARROW)
      ? (query, options) => {
          // Instead of calling queryAsync, we're calling queryDFAsync to gain
          // the speed benefits of Arrow
          return connector
            .queryDFAsync(query, {
              ...options,
              logValues: `${dashboardId}/${chartId}${keySuffix}`
            })
            .then((data) => tableToJson(data))
        }
      : (query, options) => {
          return connector.queryAsync(query, {
            ...options,
            logValues: `${dashboardId}/${chartId}${keySuffix}`
          })
        },
    {
      key: `${chartId}${keySuffix}-queryAsync`,
      throttle: getFeatureFlag(available_feature_flags.QUERY_THROTTLE),
      resolution: QUEUE_RESOLUTION.SHARED
    }
  )

  const queuedQueryDFAsync = enqueue(
    (query, options) => {
      return connector.queryDFAsync(query, {
        ...options,
        logValues: `${dashboardId}/${chartId}${keySuffix}`
      })
    },
    {
      key: `${chartId}${keySuffix}-queryDFAsync`,
      throttle: getFeatureFlag(available_feature_flags.QUERY_THROTTLE),
      resolution: QUEUE_RESOLUTION.SHARED
    }
  )

  const queuedRenderVegaAsync = enqueue(
    (widgetid, vega, options) => {
      const res = connector.renderVegaAsync(widgetid, vega, {
        ...options,
        logValues: `${dashboardId}/${chartId}`
      })
      return res
    },
    {
      key: `${chartId}${keySuffix}-renderVegaAsync`,
      throttle: getFeatureFlag(available_feature_flags.QUERY_VEGA_THROTTLE),
      delay: getFeatureFlag(available_feature_flags.QUERY_VEGA_DELAY),
      resolution: QUEUE_RESOLUTION.SHARED
    }
  )

  const queuedRenderVega = enqueue(
    (widgetid, vega, options) => {
      return connector.renderVega(widgetid, vega, {
        ...options,
        logValues: `${dashboardId}/${chartId}`
      })
    },
    {
      key: `${chartId}${keySuffix}-renderVega`,
      throttle: getFeatureFlag(available_feature_flags.QUERY_VEGA_THROTTLE),
      delay: getFeatureFlag(available_feature_flags.QUERY_VEGA_DELAY),
      resolution: QUEUE_RESOLUTION.SHARED
    }
  )

  const queuedGetResultRowForPixelAsync = enqueue(
    (...args) => {
      return connector.getResultRowForPixelAsync(...args)
    },
    {
      key: `${chartId}${keySuffix}-getResultRowForPixelAsync`,
      resolution: QUEUE_RESOLUTION.SHARED
    }
  )

  const lastQueryAsyncValues = new Map()
  const lastQueryDFAsyncValues = new Map()
  const lastRenderValues = new Map()

  const processQuery = (q, options) => {
    return getFeatureFlag(available_feature_flags.USE_OMNISQLPLUSPLUS)
      ? process(q, {
          ...options,
          trackUsage: shouldTrackUsage(options)
        })
      : q
  }

  const processCrossSectionVegaData = (d, processOptions) => {
    let data = { ...d }

    if (data.format?.xyCrossSection) {
      const processTransectCoordinate = (coordinate, tokenSuffix) => {
        if (typeof coordinate === "number") {
          return coordinate
        }

        const processedCoordinateNumber = parseFloat(
          processQuery(coordinate, {
            ...processOptions,
            token: `renderVegaTransect${tokenSuffix}`
          })
        )

        if (isNaN(processedCoordinateNumber)) {
          if (getStore()?.dispatch) {
            getStore().dispatch(
              setChartDataError(
                chartId,
                "Transect coordinates must be numeric."
              )
            )
          }

          return ""
        }

        return processedCoordinateNumber
      }

      data = {
        ...data,
        format: {
          ...data.format,
          xyCrossSection: [
            [
              processTransectCoordinate(
                d.format.xyCrossSection[0][0],
                "startLon"
              ),
              processTransectCoordinate(
                d.format.xyCrossSection[0][1],
                "startLat"
              )
            ],
            [
              processTransectCoordinate(
                d.format.xyCrossSection[1][0],
                "endLon"
              ),
              processTransectCoordinate(d.format.xyCrossSection[1][1], "endLat")
            ]
          ]
        }
      }
    }

    if (data.format?.coords) {
      data = {
        ...data,
        format: {
          ...data.format,
          coords: {
            ...data.format.coords,
            x: processQuery(data.format.coords.x, {
              ...processOptions,
              token: "renderVegaCoordX"
            }),
            y: processQuery(data.format.coords.y, {
              ...processOptions,
              token: "renderVegaCoordY"
            }),
            z: processQuery(data.format.coords.z, {
              ...processOptions,
              token: "renderVegaCoordZ"
            })
          }
        }
      }
    }

    return data
  }

  // this is tedious. Parse out the stringified vega json.
  // loop through it and process all the sql queries.
  // then re-create a newly parsed string.

  const processVegaQuery = (vega, options) => {
    const parsedVega = JSON.parse(vega)
    parsedVega.data = parsedVega.data.map((d, i) => {
      let data = { ...d }
      if (d.sql) {
        data = {
          ...data,
          sql: processQuery(d.sql, {
            ...options,
            layerName: d.name,
            keySuffix: `-L${i}`
          })
        }
      }

      data = processCrossSectionVegaData(data, options)

      return data
    })

    return JSON.stringify(parsedVega)
  }

  const queuedConnector = {
    connector,
    chartId,
    keyModifier,
    dashboardId,
    tableName,
    isQueued: true,
    queryAsync: (q, o = {}, token = "queryAsync") => {
      // eslint-disable-next-line
      getStore()?.dispatch?.(clearChartDataError(chartId))

      const cachedQuery = makeCached(queuedQueryAsync.token(token), {
        maxCacheSize: getFeatureFlag(available_feature_flags.QUERY_CACHE_SIZE),
        keyAge: getFeatureFlag(available_feature_flags.QUERY_CACHE_DURATION),
        memoizer: (query, options) => {
          return `${query}-${options.eliminateNullRows}`
        },
        cache: sharedCache
      })

      if (getFeatureFlag(available_feature_flags.PAUSE_QUERIES)) {
        return Promise.resolve([{}])
      }

      if (isCrossFilterPaused(chartId) && lastQueryAsyncValues.get(token)) {
        return lastQueryAsyncValues.get(token)
      }
      const res = cachedQuery(
        processQuery(q, {
          dashboardId,
          chartId,
          table: tableName,
          token,
          keySuffix
        }),
        {
          ...o,
          logValues: `${dashboardId}/${chartId}${keySuffix}`
        }
      )

      res.catch((e) => {
        // eslint-disable-next-line
        getStore()?.dispatch?.(setChartDataError(chartId, e.error_msg))
      })

      res.then((response) => {
        const { shouldUpdateData = true } = o
        if (shouldUpdateData) {
          // eslint-disable-next-line
          getStore()?.dispatch?.(
            saveChartData({
              chartId,
              token: `${token}${keySuffix}`,
              data: response
            })
          )
        }
      })

      lastQueryAsyncValues.set(token, res)

      return res
    },

    queryDFAsync: (q, o = {}, token = "queryDFAsync") => {
      // eslint-disable-next-line
      getStore()?.dispatch?.(clearChartDataError(chartId))

      const cachedQuery = makeCached(queuedQueryDFAsync.token(token), {
        maxCacheSize: getFeatureFlag(available_feature_flags.QUERY_CACHE_SIZE),
        keyAge: getFeatureFlag(available_feature_flags.QUERY_CACHE_DURATION),
        memoizer: (query, options) => {
          return `${query}-${options.eliminateNullRows}`
        },
        cache: sharedCache
      })

      if (getFeatureFlag(available_feature_flags.PAUSE_QUERIES)) {
        return Promise.resolve([{}])
      }

      if (isCrossFilterPaused(chartId) && lastQueryDFAsyncValues.get(token)) {
        return lastQueryDFAsyncValues.get(token)
      }

      const res = cachedQuery(
        processQuery(q, {
          dashboardId,
          chartId,
          table: tableName,
          token,
          keySuffix
        }),
        {
          ...o,
          logValues: `${dashboardId}/${chartId}${keySuffix}`
        }
      )

      res.catch((e) =>
        getStore()?.dispatch?.(clearChartDataError(chartId, e.error_msg))
      )

      lastQueryDFAsyncValues.set(token, res)

      return res
    },

    renderVegaAsync: (widgetid, vega, options = {}) => {
      // eslint-disable-next-line
      getStore()?.dispatch?.(clearChartDataError(chartId))

      const cachedRenderVegaAsync = makeCached(
        queuedRenderVegaAsync.token(widgetid),
        {
          maxCacheSize: getFeatureFlag(available_feature_flags.VEGA_CACHE_SIZE),
          keyAge: getFeatureFlag(available_feature_flags.VEGA_CACHE_DURATION),
          memoizer: (...args) => {
            return args[1] // the vega json is the key
          },
          cache: sharedVegaCache
        }
      )
      if (getFeatureFlag(available_feature_flags.PAUSE_QUERIES)) {
        return Promise.resolve({})
      }
      if (
        isCrossFilterPaused(chartId) &&
        lastRenderValues.get("renderVegaAsync")
      ) {
        return lastRenderValues.get("renderVegaAsync")
      }

      const processedVega = processVegaQuery(vega, {
        dashboardId,
        chartId,
        table: tableName,
        token: "renderVegaAsync"
      })

      const res = cachedRenderVegaAsync(widgetid, processedVega, {
        ...options,
        logValues: `${dashboardId}/${chartId}`
      })

      res.then((response) => {
        // eslint-disable-next-line
        getStore()?.dispatch?.(
          saveChartData({
            chartId,
            token: `renderVegaAsync${keySuffix}`,
            data: response
          })
        )
      })

      res.catch((e) => {
        // eslint-disable-next-line
        getStore()?.dispatch?.(setChartDataError(chartId, e.error_msg))
      })

      lastRenderValues.set("renderVegaAsync", res)

      return res
    },
    renderVega: (widgetid, vega, options = {}) => {
      // eslint-disable-next-line
      getStore()?.dispatch?.(clearChartDataError(chartId))

      const cachedRenderVega = makeCached(queuedRenderVega, {
        maxCacheSize: getFeatureFlag(available_feature_flags.VEGA_CACHE_SIZE),
        keyAge: getFeatureFlag(available_feature_flags.VEGA_CACHE_DURATION),
        memoizer: (...args) => {
          return args[1] // the vega json is the key
        },
        cache: sharedVegaCache
      })
      if (getFeatureFlag(available_feature_flags.PAUSE_QUERIES)) {
        return Promise.resolve({ vega_metadata: "{}" })
      }
      if (isCrossFilterPaused(chartId) && lastRenderValues.get("renderVega")) {
        return lastRenderValues.get("renderVega")
      }

      const processedVega = processVegaQuery(vega, {
        dashboardId,
        chartId,
        table: tableName,
        token: "renderVega"
      })

      const res = cachedRenderVega(widgetid, processedVega, {
        ...options,
        logValues: `${dashboardId}/${chartId}`
      })

      res.catch((e) => {
        // eslint-disable-next-line
        getStore()?.dispatch?.(setChartDataError(chartId, e.error_msg))
      })

      lastRenderValues.set("renderVega", res)

      return res
    },
    getResultRowForPixelAsync: (...args) => {
      // eslint-disable-next-line
      getStore()?.dispatch?.(clearChartDataError(chartId))

      if (
        isCrossFilterPaused(chartId) &&
        lastRenderValues.get("renderVegaAsync")
      ) {
        return lastRenderValues.get("getResultRowForPixelAsync")
      }

      // fine. The third argument is a list of column-ish things. Process them.
      args = [...args]
      args[2] = Object.keys(args[2]).reduce((bucket, key) => {
        bucket[key] = args[2][key].map((field) =>
          processQuery(field, {
            dashboardId,
            chartId,
            table: tableName,
            token: "getResultRowForPixelAsync",
            keySuffix
          })
        )
        return bucket
      }, {})

      const res = queuedGetResultRowForPixelAsync(...args)

      res.catch((e) => {
        // eslint-disable-next-line
        getStore()?.dispatch?.(setChartDataError(chartId, e.error_msg))
      })

      lastRenderValues.set("getResultRowForPixelAsync", res)

      return res
    },
    validateQuery: (query) => {
      const processedQuery = processQuery(query, {
        dashboardId,
        chartId,
        table: tableName,
        token: "validateQuery",
        trackUsage: false,
        keySuffix
      })

      return connector.validateQuery(processedQuery)
    }
  }

  Object.setPrototypeOf(queuedConnector, connector)
  cachedQueuedConnectors[connectorKey] = queuedConnector
  return queuedConnector
}

populateImportableCreateQueuedConnector(createQueuedConnector)
