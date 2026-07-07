// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  isNumericType,
  isStringType,
  isDateType,
  isPointOnlyGeo,
  isTimeType,
  isPolyGeo,
  isLineGeo
} from "constants/data-types"
import {
  ChartFieldAssignment,
  ChartDef,
  ChartField,
  ChartTypeState,
  ChartTypes,
  FieldsByType,
  ResultData,
  ResultDataField,
  VegaTypeMap
} from "../types"
import {
  COUNTIES_KEYS,
  STATES_KEYS,
  COUNTRIES_KEYS
} from "./topojson-constants"
import {
  barChartGenerator,
  heatmapGenerator,
  layeredLineGenerator,
  layeredBarGenerator,
  lineChartGenerator,
  scatterplotGenerator,
  choroplethGenerator,
  lineMapGenerator,
  polygonMapGenerator,
  pointMapGenerator
} from "./chart-generators/charts"

export const getFieldsByType = (
  fields: ResultDataField[],
  fieldType: string,
  typeDetectionFunction: (type: string) => boolean
): ChartField[] =>
  fields
    .filter((f) => typeDetectionFunction(f.type))
    .map((f) => ({
      field: f.name,
      type: fieldType
    }))

const validLatitude = (fieldName = "") => {
  const lowerField = fieldName.toLowerCase()
  return (
    ["latitude", "lat"].some((substr) => lowerField.includes(substr)) ||
    ["y", "loc_y", "location_y"].includes(lowerField)
  )
}
const validLongitude = (fieldName = "") => {
  const lowerField = fieldName.toLowerCase()
  return (
    ["longitude", "lon", "lng"].some((substr) => lowerField.includes(substr)) ||
    ["x", "loc_x", "location_x"].includes(lowerField)
  )
}

const fieldTypeToDetector: {
  [key in VegaTypeMap]: (field: ResultDataField) => boolean
} = {
  [VegaTypeMap.STRING]: (f) => isStringType(f.type),
  [VegaTypeMap.DATE]: (f) => isDateType(f.type),
  [VegaTypeMap.NUMBER]: (f) => isNumericType(f.type),
  [VegaTypeMap.POINT]: (f) => isPointOnlyGeo(f.type),
  [VegaTypeMap.LATITUDE]: (f) => isNumericType(f.type) && validLatitude(f.name),
  [VegaTypeMap.LONGITUDE]: (f) =>
    isNumericType(f.type) && validLongitude(f.name),
  [VegaTypeMap.POLYGON]: (f) => isPolyGeo(f.type),
  [VegaTypeMap.LINE]: (f) => isLineGeo(f.type),
  [VegaTypeMap.NON_LOCATION_NUMBER]: (f) =>
    isNumericType(f.type) && !validLatitude(f.name) && !validLongitude(f.name)
}

/**
 * Takes database result fields (ResultDataField, heavydb data types) and
 *  aggregates them by vega type (VegaTypeMap, ChartField)
 * @param fields - Fields to aggregate
 * @returns An object of [VegaTypeMap] -> ChartField
 */

export const aggregateFieldsByType = (
  fields: ResultDataField[]
): FieldsByType => {
  return Object.entries(fieldTypeToDetector).reduce((acc, [type, detector]) => {
    acc[type] = fields
      .filter((f) => detector(f))
      .map((f) => ({ field: f.name, type }))
    return acc
  }, {} as FieldsByType)
}

const getAllCountiesKeys = (): {
  fips: Set<string | null>
  id: Set<number>
  full_name: Set<string | null>
} => ({
  fips: new Set(COUNTIES_KEYS.fips),
  id: new Set(COUNTIES_KEYS.id),
  full_name: new Set(COUNTIES_KEYS.full_name)
})

const getAllStatesKeys = (): {
  fips: Set<string | null>
  state_abbr: Set<string | null>
  state_name: Set<string | null>
} => ({
  fips: new Set(STATES_KEYS.fips),
  state_abbr: new Set(STATES_KEYS.state_abbr),
  state_name: new Set(STATES_KEYS.state_name)
})

const getAllCountriesKeys = (): {
  iso_a2: Set<string>
  iso_a3: Set<string>
  name: Set<string>
  name_long: Set<string>
} => ({
  iso_a2: new Set(COUNTRIES_KEYS.iso_a2),
  iso_a3: new Set(COUNTRIES_KEYS.iso_a3),
  name: new Set(COUNTRIES_KEYS.name),
  name_long: new Set(COUNTRIES_KEYS.name_long)
})

export type SetResult = {
  dataField: string
  joinField: string
  joinDataset: string
}
export const findJoinKeys = (data: any[]): SetResult | null => {
  const setFunctions = {
    counties: getAllCountiesKeys,
    states: getAllStatesKeys,
    countries: getAllCountriesKeys
  }

  const dataKeys = Object.keys(data[0] || {})
  if (!dataKeys.length) {
    return null
  }

  for (const [joinDataset, setFunction] of Object.entries(setFunctions)) {
    const sets = setFunction()

    for (const jsonField of Object.keys(sets)) {
      const set = sets[jsonField]

      // Find a key with >= 40% match in the data array
      const matchingKey = dataKeys.find((dataKey) => {
        const matchPercentage =
          (data.filter((rowData) => {
            const field =
              typeof rowData[dataKey] === "string"
                ? rowData[dataKey].toUpperCase()
                : rowData[dataKey]
            return set.has(field)
          }).length /
            data.length) *
          100
        return matchPercentage >= 40
      })

      if (matchingKey) {
        return {
          dataField: matchingKey,
          joinField: jsonField,
          joinDataset
        }
      }
    }
  }

  return null
}

export const addJoinColumn = (data: any[], field: string): any[] => {
  return data.map((r) => {
    if (r[field]) {
      const value =
        typeof r[field] === "string" ? r[field].toUpperCase() : r[field]
      const key = `${field}_join`
      return {
        ...r,
        [key]: value
      }
    } else if (r[field] === null) {
      const key = `${field}_join`
      return {
        ...r,
        [key]: r[field]
      }
    } else {
      return r
    }
  })
}

const IGNORED_FIELDS = [ChartFieldAssignment.X_OFFSET]
/**
 * Chooses the "best" chart based on simple metric of most fields, and some
 * tie break and immediate win scenarios.
 *
 * @param charts - List of charts to find the best in
 * @param data - Data returned from the query, contains fields returned
 * @returns Chart that has been chosen as best
 */
export const recommendChart = (
  charts: ChartDef[],
  data: ResultData
): ChartDef => {
  const fields = data.fields
  // Definite winners
  const foundPointChart = charts.find(
    (chart) => chart.type === ChartTypes.POINT_MAP
  )
  const hasPointFields = fields.find((field) => isPointOnlyGeo(field.type))
  const hasLatLngFields =
    fields.find((f) => validLatitude(f.name)) &&
    fields.find((f) => validLongitude(f.name))
  if (foundPointChart && (hasPointFields || hasLatLngFields)) {
    return foundPointChart
  }

  const foundGeomChart = charts.find((chart) =>
    [ChartTypes.LINE_MAP, ChartTypes.POLYGON_MAP].includes(chart.type)
  )
  // If a line or poly map was generated, use it.
  if (foundGeomChart) {
    return foundGeomChart
  }

  /**
   * tldr; finds the indexes in the charts array of charts with the most assigned fields
   * Gets the length of assigned fields for each chart
   * Reduce to an array of [numFields, chartIndex] containing ALL the charts with the highest # of fields assigned
   * Map to the chart at indexes specified
   */
  const chartsWithMostFields = charts
    .map((chart) => {
      return (
        chart?.fields?.filter(
          (f) => !IGNORED_FIELDS.includes(f.assignedTo) && f.active
        )?.length ?? 0
      )
    })
    .reduce((acc: number[][], numFields: number, chartIdx: number) => {
      const noFieldsYet = !acc.length
      const highestYet =
        noFieldsYet || numFields > Math.max(...acc.map((val) => val[0]))
      if (highestYet) {
        acc.length = 0
        acc.push([numFields, chartIdx])
      } else if (numFields === Math.max(...acc.map((val) => val[0]))) {
        acc.push([numFields, chartIdx])
      }
      return acc
    }, [])
    .map(([_, i]) => charts[i])

  // choropleth always wins if join was found
  const vegaChoroplethFound = charts.find(
    (c) => c.type === ChartTypes.VEGA_CHOROPLETH
  )
  if (vegaChoroplethFound) {
    return vegaChoroplethFound
  }

  // Tie break
  if (chartsWithMostFields.length > 1) {
    const hasTemporalField = Boolean(
      fields.find((field) => isTimeType(field.type) || isDateType(field.type))
    )
    const lineChartFound = chartsWithMostFields.find(
      (c) => c.type === ChartTypes.LINE
    )
    const binnedChart = chartsWithMostFields.find((c) => c?.settings?.binned)
    const scatterAndBar =
      chartsWithMostFields.length === 2 &&
      chartsWithMostFields.some((c) => c.type === ChartTypes.SCATTER) &&
      chartsWithMostFields.some((c) => c.type === ChartTypes.LAYERED_BAR)

    if (hasTemporalField && lineChartFound) {
      return lineChartFound
    } else if (binnedChart) {
      return binnedChart
    } else if (scatterAndBar) {
      // if scatter and bar, choose scatter when results > 100
      return data.results.length > 100
        ? chartsWithMostFields.find((c) => c.type === ChartTypes.SCATTER)
        : chartsWithMostFields.find((c) => c.type === ChartTypes.LAYERED_BAR)
    }
  }

  // Pick the first one
  return chartsWithMostFields[0]
}

export const createInitialState = (
  fields: ChartField[] | undefined,
  chartSchema: string[]
): ChartTypeState => {
  const initialState: ChartTypeState = {}

  chartSchema.forEach((field: string) => {
    const chartField = fields?.find((f) => f.assignedTo === field)
    if (chartField) {
      initialState[field] = chartField
    }
  })

  return initialState
}

export const generateCharts = (
  data: ResultData
): { charts: ChartDef[]; data: ResultData } => {
  const fieldsByType = aggregateFieldsByType(data.fields)

  const generators = [
    barChartGenerator,
    layeredBarGenerator,
    choroplethGenerator,
    lineChartGenerator,
    layeredLineGenerator,
    scatterplotGenerator,
    heatmapGenerator,
    pointMapGenerator,
    lineMapGenerator,
    polygonMapGenerator
  ]

  const charts = generators
    .map((generator) => {
      return generator.createChart(fieldsByType, data)
    })
    .filter(Boolean)
  return {
    charts,
    data
  }
}

export const addKeepResultsHint = (query: string) => {
  return query.replaceAll(
    /("?[\w\s]+?"?\s*?AS\s*?\(\s*?SELECT)/gim,
    "$1 /*+ keep_result */"
  )
}
