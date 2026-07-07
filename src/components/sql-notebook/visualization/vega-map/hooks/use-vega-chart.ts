// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ViewState, WebMercatorViewport } from "react-map-gl"
import { getBounds } from "../utils"
import { HeavyVega } from "../heavy-vega"
import { useCallback, useEffect, useState } from "react"
import {
  LineMapSettings,
  MapSettings,
  PointMapSettings,
  PolygonMapSettings
} from "../types"
import { Parser } from "node-sql-parser"
import {
  ChartField,
  ChartTypes,
  VALID_NUMBER_TYPES,
  VegaTypeMap
} from "components/sql-notebook/types"
import {
  column,
  columnsInExpression,
  findQueryColumn,
  funcWithAlias,
  getAST,
  trimQueryFields,
  overrideLimit,
  parserOptions,
  isSelectStar,
  addSampleRatio,
  addBoundingBoxFilter
} from "../ast-helpers"
import { useDomain } from "./use-domain"
import {
  LINE_RENDER_LIMIT,
  POINT_RENDER_LIMIT,
  POLYGON_RENDER_LIMIT
} from "components/sql-notebook/constants"
import { CUSTOM_COLORS, QUANTITATIVE_COLORS, getColors } from "services/colors"
import { calculateCustomColorRange } from "components/sql-notebook/utils"
import { isEqual } from "lodash"
import {
  DEFAULT_LINE_WIDTH,
  DEFAULT_LINE_RANGE,
  DEFAULT_POINT_SIZE,
  DEFAULT_SIZE_RANGE,
  LAYER_TYPE
} from "../constants"
import d3 from "services/d3"
import { addKeepResultsHint } from "../../utils"
import { useResultCount } from "./use-result-count"

export const DEFAULT_COLOR = "#27aeef"
export const DEFAULT_NULL_VALUE = "#cacaca"

const getColorStep = (multiplier: number, idx: number) => {
  return {
    type: "formula",
    expr: `max(mincol, avgcol ${
      multiplier >= 0 ? "+" : ""
    } ${multiplier}*stdcol)`,
    as: `color${idx}`
  }
}

const getContinuousColorScale = ({
  chartKey = LAYER_TYPE.POINT,
  colorField
}: {
  chartKey?: string
  colorField: string
}) => {
  const colorRange = getColors(QUANTITATIVE_COLORS).Viridis
  const colorDataName = `${chartKey}_stats`

  const numSteps = colorRange.length
  const numStdDevs = 2
  // so we need a range from - to + numStdDevs
  const minStdDevs = 0 - numStdDevs
  const maxStdDevs = 0 + numStdDevs
  const multipliers = d3.range(
    minStdDevs,
    maxStdDevs,
    (maxStdDevs - minStdDevs) / numSteps
  )
  multipliers.concat(maxStdDevs)

  const domainSteps = multipliers.map(getColorStep)

  return {
    data: [
      {
        name: colorDataName,
        source: chartKey,
        transform: [
          {
            type: "aggregate",
            fields: [colorField, colorField, colorField, colorField],
            ops: ["min", "max", "avg", "stddev"],
            as: ["mincol", "maxcol", "avgcol", "stdcol"]
          },
          {
            type: "formula",
            expr: `max(mincol, avgcol-${numStdDevs}*stdcol)`,
            as: "mincolor"
          },
          {
            type: "formula",
            expr: `min(maxcol, avgcol+${numStdDevs}*stdcol)`,
            as: "maxcolor"
          },
          ...domainSteps
        ]
      }
    ],
    scales: [
      {
        name: `${chartKey}_fillColor`,
        type: "linear",
        domain: {
          data: colorDataName,
          fields: domainSteps.map((ds) => ds.as)
        },
        range: colorRange,
        clamp: true,
        nullValue: DEFAULT_NULL_VALUE
      }
    ]
  }
}

const getOrdinalPaletteScale = ({
  chartKey,
  domain,
  range
}: {
  chartKey: string
  domain: string[]
  range?: string[]
}) => {
  const customColorSet = getColors(CUSTOM_COLORS)
  const colorVals = Object.values(customColorSet).flat()
  const ordinalColors = calculateCustomColorRange(domain, colorVals)
  return {
    scales: [
      {
        name: `${chartKey}_fillColor`,
        type: "ordinal",
        // null values need to be stringified
        domain: domain.map((d) => `${d}`),
        range: range || ordinalColors,
        default: DEFAULT_COLOR,
        nullValue: DEFAULT_NULL_VALUE
      }
    ],
    // TODO: Handle this better elsewhere?
    data: []
  }
}

const densityScale = (chartKey: LAYER_TYPE) => {
  const colors = getColors(QUANTITATIVE_COLORS).Viridis

  // Range is exclusive of end of the range so length - 1, then add the end
  const densityMin = 0
  const densityMax = 1
  const opacityMin = 0.625
  const opacityMax = 1
  const densityDomain = d3.range(
    densityMin,
    densityMax,
    1 / (colors.length - 1)
  )
  densityDomain.push(1)

  const opacityScale = d3.scale
    .linear()
    .domain([densityMin, densityMax])
    .range([opacityMin, opacityMax])
  const densityRange = densityDomain.map((v: number, i: number) => {
    const opacity = opacityScale(v)
    const c = d3.rgb(colors[i])
    const rgbColor = `rgba(${c.r},${c.g},${c.b},${opacity})`
    return rgbColor
  })
  return {
    name: `${chartKey}_fillColor`,
    type: "linear",
    domain: densityDomain,
    range: densityRange,
    accumulator: "density",
    minDensityCnt: "-2ndStdDev",
    maxDensityCnt: "2ndStdDev",
    clamp: true
  }
}

const getColorSpec = (
  chartKey: LAYER_TYPE,
  mapConfig: MapSettings,
  colorDomain: string[] | number[]
) => {
  const colorField = mapConfig.colorField

  // Use dot density or no scales if color is not active
  if (!colorField?.active) {
    if (mapConfig.settings?.dotDensity) {
      // Dot density
      const dotDensityScale = densityScale(chartKey)
      return {
        data: [],
        scales: [dotDensityScale]
      }
    } else {
      return {
        data: [],
        scales: []
      }
    }
  }

  if (VALID_NUMBER_TYPES.includes(colorField?.type)) {
    return getContinuousColorScale({
      chartKey,
      colorField: colorField.field
    })
  } else if (colorField?.type === VegaTypeMap.STRING) {
    return getOrdinalPaletteScale({
      chartKey,
      domain: colorDomain as string[]
    })
  } else {
    return {
      data: [],
      scales: []
    }
  }
}

const getDataFormat = (layerType: string) => {
  if (layerType === LAYER_TYPE.POLYGON) {
    return "polys"
  } else if (layerType === LAYER_TYPE.LINE) {
    return "lines"
  }
  return null
}

const getRenderLimit = (layerType: string) => {
  if (layerType === LAYER_TYPE.POLYGON) {
    return POLYGON_RENDER_LIMIT
  } else if (layerType === LAYER_TYPE.LINE) {
    return LINE_RENDER_LIMIT
  } else {
    return POINT_RENDER_LIMIT
  }
}

const getDataSpec = (chartKey: string, query: string, sampleRatio = null) => {
  const formatVal = getDataFormat(chartKey)
  const format = formatVal ? { format: formatVal } : {}

  let modifiedQuery = overrideLimit(query, getRenderLimit(chartKey))
  modifiedQuery = addKeepResultsHint(modifiedQuery)

  if (sampleRatio !== null) {
    modifiedQuery = addSampleRatio(modifiedQuery, sampleRatio)
  }

  return {
    name: chartKey,
    ...format,
    sql: modifiedQuery,
    enableHitTesting: true
  }
}

const getContinuousSizeScale = ({
  chartKey,
  sizeField,
  mapConfig
}: {
  chartKey: string
  sizeField: ChartField
  mapConfig: PointMapSettings
}) => {
  const sizeFieldName = sizeField.field
  const sizeDataName = `${chartKey}_sizeData`
  const sizeScaleName = `${chartKey}_size`

  const defaultSizeRange =
    chartKey === ChartTypes.LINE_MAP ? DEFAULT_LINE_RANGE : DEFAULT_SIZE_RANGE
  const defaultSize =
    chartKey === ChartTypes.LINE_MAP ? DEFAULT_LINE_WIDTH : DEFAULT_POINT_SIZE
  return {
    scales: [
      {
        name: sizeScaleName,
        type: "linear",
        domain: { data: sizeDataName, fields: ["minsize", "maxsize"] },
        range: mapConfig.settings.sizeRange || defaultSizeRange,
        default: defaultSize,
        clamp: true
      }
    ],
    data: [
      {
        name: sizeDataName,
        source: chartKey,
        transform: [
          {
            type: "aggregate",
            fields: [
              sizeFieldName,
              sizeFieldName,
              sizeFieldName,
              sizeFieldName
            ],
            ops: ["min", "max", "avg", "stddev"],
            as: ["minsz", "maxsz", "avgsz", "stdsz"]
          },
          {
            type: "formula",
            expr: "max(minsz, avgsz-2*stdsz)",
            as: "minsize"
          },
          {
            type: "formula",
            expr: "min(maxsz, avgsz+2*stdsz)",
            as: "maxsize"
          }
        ]
      }
    ]
  }
}

const getSizeSpec = (
  chartKey: string,
  sizeField: ChartField,
  mapConfig: MapSettings
) => {
  if (!sizeField?.active) {
    return null
  }

  if (VALID_NUMBER_TYPES.includes(sizeField?.type)) {
    return getContinuousSizeScale({
      chartKey,
      sizeField,
      mapConfig
    })
  } else {
    return {
      data: [],
      scales: []
    }
  }
}

const addMapConfigColumns = (query: string, mapConfig: PointMapSettings) => {
  const ast = getAST(query)
  ast.columns = [
    mapConfig.colorField,
    mapConfig.latField,
    mapConfig.lonField,
    mapConfig.sizeField
  ]
    .filter((f) => Boolean(f))
    .map((f) => {
      return {
        type: "expr",
        expr: column(f.field)
      }
    })
  return ast
}

const parseLocation = (mapConfig: MapSettings) => {
  const query = mapConfig.query
  const { latField, lonField } = mapConfig

  // Only modify the query if it has lat/lng
  if (!latField || !lonField) {
    return { query }
  }

  // When does this return an array vs just a single AST?
  const parser = new Parser()
  let queryAST = null
  if (isSelectStar(query)) {
    queryAST = addMapConfigColumns(query, mapConfig as PointMapSettings)
  } else {
    queryAST = getAST(query)
  }
  const lonColumnExpr = findQueryColumn(queryAST, lonField?.field)
  const latColumnExpr = findQueryColumn(queryAST, latField?.field)
  if (!lonColumnExpr || !latColumnExpr) {
    throw Error("Geometry column(s) not found")
  }

  // lonField.field can be an alias
  // but then we also get ... the alias, fall back to column or alias? Too much, do less
  const lonOriginalCol = columnsInExpression(lonColumnExpr, false)[0]
  const latOriginalCol = columnsInExpression(latColumnExpr, false)[0]
  const lonName = lonColumnExpr.as || lonOriginalCol
  const latName = latColumnExpr.as || latOriginalCol

  // These are the field aliases to use in the vega spec
  let latFieldName = "y"
  let lonFieldName = "x"
  if (mapConfig.latField.type === "point") {
    // Remove the point field
    const pointIndex = queryAST.columns.findIndex((c) => c === latColumnExpr)
    queryAST.columns.splice(pointIndex, 1)

    const stX = funcWithAlias("ST_X", lonColumnExpr.expr, lonFieldName)
    const stY = funcWithAlias("ST_Y", latColumnExpr.expr, latFieldName)
    queryAST.columns.push(stX, stY)
  } else {
    lonFieldName = lonName
    latFieldName = latName
  }

  return {
    query: parser.sqlify(queryAST, parserOptions),
    latFieldName,
    lonFieldName
  }
}

const getFillColor = (mapConfig: MapSettings, colorSpec: any) => {
  if (mapConfig.colorField?.active) {
    // Use color field if its there and active
    return {
      scale: colorSpec.scales[0].name,
      field: mapConfig.colorField.field
    }
  } else if (colorSpec.scales[0]) {
    // Otherwise use the scale without a field
    return {
      scale: colorSpec.scales[0].name,
      value: 0
    }
  } else {
    // Default color fallback
    return DEFAULT_COLOR
  }
}

const getMarkProperties = ({
  mapConfig,
  colorSpec,
  sizeSpec,
  latFieldName,
  lonFieldName
}: {
  mapConfig: MapSettings
  colorSpec: any
  sizeSpec?: any
  latFieldName?: string
  lonFieldName?: string
}) => {
  if (mapConfig.type === ChartTypes.POINT_MAP) {
    const settingsSize = mapConfig.settings?.pointSize ?? DEFAULT_POINT_SIZE
    const size = sizeSpec?.scales?.length
      ? { scale: sizeSpec?.scales[0].name, field: mapConfig.sizeField?.field }
      : settingsSize
    return {
      fillColor: getFillColor(mapConfig, colorSpec),
      xc: { field: lonFieldName },
      yc: { field: latFieldName },
      shape: "circle",
      width: size,
      height: size
    }
  } else if (mapConfig.type === ChartTypes.POLYGON_MAP) {
    return {
      x: { field: "x" },
      y: { field: "y" },
      fillColor: getFillColor(mapConfig, colorSpec),
      strokeColor: "#FFFFFF",
      strokeWidth: mapConfig.settings.border ? 1 : 0,
      lineJoin: "miter",
      miterLimit: 10
    }
  } else if (mapConfig.type === ChartTypes.LINE_MAP) {
    const settingsSize = mapConfig.settings?.strokeWidth ?? DEFAULT_LINE_WIDTH
    const size = sizeSpec?.scales?.length
      ? { scale: sizeSpec?.scales[0].name, field: mapConfig.sizeField?.field }
      : settingsSize
    return {
      x: { field: "x" },
      y: { field: "y" },
      strokeColor: getFillColor(mapConfig, colorSpec),
      strokeWidth: size,
      lineJoin: "bevel"
    }
  } else {
    return {}
  }
}

export const useVegaChart = (
  chartKey: LAYER_TYPE = LAYER_TYPE.POINT,
  mapConfig: MapSettings,
  viewState: ViewState
) => {
  const [vegaSpec, setVegaSpec] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const [colorDomain, domainError, domainLoading] = useDomain(
    mapConfig.colorField,
    mapConfig.query,
    100
  )

  const [resultCount, resultCountLoading] = useResultCount(
    chartKey,
    mapConfig.query,
    viewState,
    mapConfig
  )

  useEffect(() => {
    setLoading(Boolean(domainLoading))
  }, [domainLoading])

  /**
   * Compiles the list of fields to keep in the query
   * @param latFieldName - Generated lat field name, used if we are wrapping/aliasing a point geom
   * @param lonFieldName - Generated lon field name, used if we are wrapping/aliasing a point geom
   * @returns list of fields to keep in the query
   */
  const getConfigFields = useCallback(
    (latFieldName?: string, lonFieldName?: string) => {
      const domainRequired =
        mapConfig.colorField?.active &&
        mapConfig.colorField?.type === VegaTypeMap.STRING
      switch (mapConfig.type) {
        case ChartTypes.POLYGON_MAP: {
          const { geomField, colorField } = mapConfig as PolygonMapSettings

          if (!geomField || (domainRequired && !colorDomain?.length)) {
            return []
          } else {
            // All configured fields, and anything we've added as part of location
            return [colorField, geomField]
              .filter((f) => Boolean(f) && (f.active === undefined || f.active))
              .map((f) => f.field)
          }
        }
        case ChartTypes.LINE_MAP: {
          const {
            geomField,
            colorField,
            sizeField
          } = mapConfig as LineMapSettings

          if (!geomField || (domainRequired && !colorDomain?.length)) {
            return []
          } else {
            // All configured fields, and anything we've added as part of location
            return [colorField, geomField, sizeField]
              .filter((f) => Boolean(f) && (f.active === undefined || f.active))
              .map((f) => f.field)
          }
        }
        case ChartTypes.POINT_MAP:
        default: {
          const {
            latField,
            lonField,
            sizeField,
            colorField
          } = mapConfig as PointMapSettings
          const configFields = [colorField, latField, lonField, sizeField]
            .filter((f) => Boolean(f) && (f.active === undefined || f.active))
            .map((f) => f.field)
          // Add em if we have em
          if (latFieldName && lonFieldName) {
            configFields.push(latFieldName, lonFieldName)
          }
          return configFields
        }
      }
    },
    [colorDomain?.length, mapConfig]
  )

  const getVegaSpec = useCallback((): any => {
    const [nw, se] = getBounds(viewState)
    const viewport = new WebMercatorViewport(viewState)
    // We need to get the data "name" so we can use it for hit testing
    const spec = HeavyVega()
    const { query, latFieldName, lonFieldName } = parseLocation(mapConfig)

    // All configured fields, and anything we've added as part of location
    const configFields = getConfigFields(latFieldName, lonFieldName)
    // Return no fields if we shouldn't proceed
    if (!configFields.length || resultCountLoading) {
      return null
    }

    let optimizedQuery = trimQueryFields(query, configFields)
    // TODO: Create an array of query transformations that could be chained
    optimizedQuery = addBoundingBoxFilter(
      chartKey,
      optimizedQuery,
      viewState,
      mapConfig
    )

    const includeSampleRatio =
      resultCount && resultCount > mapConfig.settings.renderLimit
    const sampleRatio = includeSampleRatio
      ? mapConfig.settings.renderLimit
      : null
    const dataSpec = getDataSpec(chartKey, optimizedQuery, sampleRatio)
    const sizeSpec = getSizeSpec(chartKey, mapConfig.sizeField, mapConfig)
    const colorSpec = getColorSpec(chartKey, mapConfig, colorDomain)
    const markType =
      chartKey === LAYER_TYPE.POINT ? "symbol" : getDataFormat(chartKey)

    const newVegaSpec = spec
      .width(viewport.width)
      .height(viewport.height)
      .viewRenderOptions()
      .data(dataSpec)
      .data(colorSpec.data)
      .scale(colorSpec.scales)
      .projection("mercator_map_projection", "mercator", {
        x: [nw[0], se[0]],
        y: [se[1], nw[1]]
      })
      .mark(
        markType,
        dataSpec.name,
        getMarkProperties({
          mapConfig,
          colorSpec,
          sizeSpec,
          latFieldName,
          lonFieldName
        }),
        {
          projection: "mercator_map_projection"
        }
      )

    // If we have a size spec, add data/scales
    if (sizeSpec) {
      newVegaSpec.data(sizeSpec.data).scale(sizeSpec.scales)
    }

    return newVegaSpec.toSpec()
  }, [
    chartKey,
    colorDomain,
    getConfigFields,
    mapConfig,
    resultCountLoading,
    viewState,
    resultCount
  ])

  useEffect(() => {
    setError(null)
    try {
      // Keeping it in local state allows this diff of the resulting spec
      // to minimize raster renders
      const newVegaSpec = getVegaSpec()
      if (!isEqual(newVegaSpec, vegaSpec)) {
        setVegaSpec(newVegaSpec)
      }
    } catch (e) {
      setError(e.message || e.error_msg || "Unknown error generating chart")
      // Very helpful to log this so we know where its coming from
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }, [mapConfig, colorDomain, vegaSpec, viewState, chartKey, getVegaSpec])

  return {
    vegaSpec,
    error: domainError || error,
    loading: loading || resultCountLoading
  }
}
