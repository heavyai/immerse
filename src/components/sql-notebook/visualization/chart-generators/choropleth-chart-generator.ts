// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { cloneDeep } from "lodash"
import {
  ChartField,
  FieldsByType,
  ResultData,
  VegaTypeMap
} from "components/sql-notebook/types"
import {
  COUNTIES_KEYS,
  COUNTRIES_KEYS,
  STATES_KEYS
} from "../topojson-constants"
import { ChartGenerator } from "./chart-generator"

type JoinConfig = {
  joinField: string
  joinDataset: string
} & ChartField

export type SetResult = {
  dataField: string
  joinField: string
  joinDataset: string
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

/**
 * Extends ChartGenerator by modifying results (adds join columns), and adds
 * join config to the generated config
 */
export class ChoroplethGenerator extends ChartGenerator {
  createChart(fieldsByType: FieldsByType, resultData: ResultData) {
    const [chartParams, joinResults] = this.getJoinChartParams(
      fieldsByType,
      resultData.results
    )

    if (this.chartConstructor && chartParams) {
      // Not ideal, this mutates resultData
      resultData.results = joinResults
      return this.chartConstructor(chartParams, joinResults)
    } else {
      return null
    }
  }

  getJoinConfig(
    joinKeys: SetResult,
    joinField: ChartField,
    results: any
  ): [JoinConfig, any] {
    let joinResults = results
    let joinConfig = null
    if (joinField) {
      joinResults = addJoinColumn(results, joinField?.field)
    }
    joinConfig = {
      ...joinField,
      joinField: joinKeys.joinField,
      joinDataset: joinKeys.joinDataset,
      active: true
    }
    return [joinConfig, joinResults]
  }

  // Could/should just be a util
  getResultsOfType(resultType: string, data: any) {
    return data.map((item) =>
      Object.fromEntries(
        Object.entries(item).filter(([_, value]) => typeof value === resultType)
      )
    )
  }

  getJoinConfigOfType(
    vegaType: VegaTypeMap,
    data: any,
    fieldsByType: FieldsByType
  ) {
    const resultType = vegaType === VegaTypeMap.NUMBER ? "number" : "string"
    const resultsOfType = this.getResultsOfType(resultType, data)
    const joinKeys = findJoinKeys(resultsOfType)
    if (joinKeys) {
      // Gets join specific params + amended results
      const joinField = fieldsByType[vegaType].find(
        (n) => n.field === joinKeys.dataField
      )

      // remove join key from available fields
      const fieldsByTypeWithoutJoin = cloneDeep(fieldsByType)
      fieldsByTypeWithoutJoin[joinField.type] = fieldsByTypeWithoutJoin[
        joinField.type
      ].filter((f) => f.field !== joinField.field)

      // Gets normal field params
      const fieldConfig = super.getFirstValidChartParams(
        fieldsByTypeWithoutJoin
      )

      // need a color measure in order to render choropleth
      if (!fieldConfig) {
        return [null, null]
      }

      const [joinConfig, joinData] = this.getJoinConfig(
        joinKeys,
        joinField,
        data
      )

      return [{ ...fieldConfig, join: joinConfig }, joinData]
    }
    return [null, null]
  }

  getJoinChartParams(fieldsByType: FieldsByType, data: any) {
    // Try numbers, then try strings
    const [numberConfig, numberJoinResults] = this.getJoinConfigOfType(
      VegaTypeMap.NUMBER,
      data,
      fieldsByType
    )

    if (numberConfig) {
      return [numberConfig, numberJoinResults]
    }

    return this.getJoinConfigOfType(VegaTypeMap.STRING, data, fieldsByType)
  }
}
