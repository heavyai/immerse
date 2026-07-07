// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  ChartDef,
  ChartField,
  ChartFieldAssignment,
  ChartSettings,
  ChartTypeState,
  ChartTypes,
  FieldsByType,
  ResultData,
  VegaTypeMap
} from "components/sql-notebook/types"
import { cloneDeep } from "lodash"
import { AllowedVegaTypesPerChartField } from "../chart-settings/constants"
import {
  barChart,
  histogram,
  layeredBarChart,
  lineChart,
  layeredLineChart,
  scatterplot,
  heatmap,
  vegaChoropleth,
  pointMap,
  lineMap,
  polygonMap
} from "./vega-generators"

/**
 * Chart generator round 2. Super config based approach, define configs as the number of each type of field we need
 * and their field assignemnts. Then uses the fields we have to find valid configurations, and generate the charts
 * for those valid configurations.
 */

const UNASSIGNED = "unassigned"

type ChartConstructor = (
  state: ChartTypeState,
  data?: any,
  settings?: ChartSettings
) => ChartDef
export type FieldDefinition = [VegaTypeMap, number]
export type RequiredFieldsDefinition = Array<FieldDefinition>
type FieldAssignment = [ChartFieldAssignment, VegaTypeMap | typeof UNASSIGNED]
export type FieldAssignmentDefinition = Array<FieldAssignment>

// Convenience method, pulls "results" data out from our results object which
// also contains the query, table, fields, etc
const dataConstructor = (constructorFn: ChartConstructor) => {
  return (
    state: ChartTypeState,
    results: ResultData,
    settings?: ChartSettings
  ) => constructorFn(state, results.results, settings)
}

const chartConstructors: {
  [key in ChartTypes]?: ChartConstructor
} = {
  [ChartTypes.HISTOGRAM]: dataConstructor(histogram),
  [ChartTypes.BAR]: dataConstructor(barChart),
  [ChartTypes.LAYERED_BAR]: dataConstructor(layeredBarChart),
  [ChartTypes.LINE]: dataConstructor(lineChart),
  [ChartTypes.LAYERED_LINE]: dataConstructor(layeredLineChart),
  [ChartTypes.SCATTER]: dataConstructor(scatterplot),
  [ChartTypes.HEATMAP]: dataConstructor(heatmap),
  [ChartTypes.VEGA_CHOROPLETH]: vegaChoropleth,
  [ChartTypes.POINT_MAP]: pointMap,
  [ChartTypes.LINE_MAP]: lineMap,
  [ChartTypes.POLYGON_MAP]: polygonMap
}
export class ChartGenerator {
  requiredAssignments: Array<String>
  chartType: ChartTypes
  chartConfigurations = new Map<
    RequiredFieldsDefinition,
    FieldAssignmentDefinition
  >()
  chartConstructor:
    | undefined
    | ((state: ChartTypeState, data?: any) => ChartDef)

  constructor(chartType: ChartTypes, requiredAssignments: Array<String> = []) {
    this.chartType = chartType
    this.chartConstructor = chartConstructors[chartType]
    this.requiredAssignments = requiredAssignments

    if (!this.chartConstructor) {
      throw new Error(
        `Chart constructor not found for ${this.chartType}. Add chart type to possible charts in chartConstructors.`
      )
    }
  }

  addDefinition(
    requiredFields: RequiredFieldsDefinition,
    fieldAssignments: FieldAssignmentDefinition
  ) {
    // TODO: Could also check required fields are assigned here
    requiredFields.forEach(([fieldType, n]) => {
      const assignedFieldsOfType = fieldAssignments.filter(
        ([_, vegaType]) => vegaType === fieldType
      )
      if (assignedFieldsOfType.length !== n) {
        throw new Error(
          `Error in config for chart type: ${this.chartType}, field type: ${fieldType}. ${n} are required, but ${assignedFieldsOfType.length} are assigned.`
        )
      }
    })
    this.chartConfigurations.set(requiredFields, fieldAssignments)
  }

  getDefinitions() {
    return this.chartConfigurations
  }

  firstValidDefinition(fieldsByType: FieldsByType) {
    // TODO: We need an ordering here, or maybe a "score" for most fields etc.
    const configs = Array.from(this.chartConfigurations.keys())
    // Sort by most fields required -> least
    // This could be a chart specific function if needed later
    // Maybe this should also give points for diversity of field types?
    configs.sort((a, b) => {
      return (
        b.reduce((prev, def) => def[1] + prev, 0) -
        a.reduce((prev, def) => def[1] + prev, 0)
      )
    })
    const firstValid = configs.find((c) => {
      return c.every(([fieldType, num]) => {
        return fieldsByType[fieldType]?.length >= num
      })
    })
    if (firstValid) {
      return this.chartConfigurations.get(firstValid)
    } else {
      return null
    }
  }
  createChart(fieldsByType: FieldsByType, results: ResultData) {
    const chartParams = this.getFirstValidChartParams(fieldsByType)
    if (chartParams) {
      // We need all the goods here, not just data
      return this.chartConstructor(chartParams, results)
    } else {
      return null
    }
  }

  getFirstValidChartParams(fieldsByType: FieldsByType) {
    const fieldAssignments = this.firstValidDefinition(fieldsByType)
    if (!fieldAssignments) {
      return null
    }
    // We're gonna mess around with this array in place, so clone it
    const availableFields: FieldsByType = cloneDeep(fieldsByType)

    return Object.fromEntries(
      fieldAssignments.map(([fieldAssignment, vegaType]) => {
        if (vegaType === UNASSIGNED) {
          // Unassigned fields still get a field assignment, but they will be
          // inactive and take the first available field of a valid type
          const validFieldTypes =
            AllowedVegaTypesPerChartField[this.chartType]?.[fieldAssignment]
          const firstTypeWithField = validFieldTypes?.find(
            (ft) => fieldsByType[ft]?.length
          )
          if (firstTypeWithField) {
            const firstValidField = fieldsByType[firstTypeWithField]?.[0]
            return [fieldAssignment, inactive(firstValidField)]
          }
          return [fieldAssignment, null]
        } else if (availableFields[vegaType].length) {
          // Assigned fields will find the first available of the type
          const firstAvailableField = availableFields[vegaType].shift()
          const isRequired = this.requiredAssignments.includes(fieldAssignment)
          return [
            fieldAssignment,
            required(active(firstAvailableField), isRequired)
          ]
        } else {
          // We may need to fail here, something has gone wrong, we
          // don't have the fields that we were promised
          return []
        }
      })
    )
  }
}

// Convenience functions for creating field requirement arrays
export function fieldTypeFn(type: VegaTypeMap) {
  // Add required param
  return (n: number): FieldDefinition => {
    return [type, n]
  }
}

export const stringField = fieldTypeFn(VegaTypeMap.STRING)
export const numberField = fieldTypeFn(VegaTypeMap.NUMBER)
export const dateField = fieldTypeFn(VegaTypeMap.DATE)
export const latitudeField = fieldTypeFn(VegaTypeMap.LATITUDE)
export const longitudeField = fieldTypeFn(VegaTypeMap.LONGITUDE)
export const pointGeometryField = fieldTypeFn(VegaTypeMap.POINT)
export const lineGeometryField = fieldTypeFn(VegaTypeMap.LINE)
export const polygonGeometryField = fieldTypeFn(VegaTypeMap.POLYGON)
export const nonLocationNumberField = fieldTypeFn(
  VegaTypeMap.NON_LOCATION_NUMBER
)

// Convenience methods for creating field assignment arrays
const assignFieldFn = (type: VegaTypeMap | typeof UNASSIGNED) => {
  return (assignment: ChartFieldAssignment): FieldAssignment => {
    return [assignment, type]
  }
}
export const assignString = assignFieldFn(VegaTypeMap.STRING)
export const assignNumber = assignFieldFn(VegaTypeMap.NUMBER)
export const assignDate = assignFieldFn(VegaTypeMap.DATE)
export const assignLatitude = assignFieldFn(VegaTypeMap.LATITUDE)
export const assignLongitude = assignFieldFn(VegaTypeMap.LONGITUDE)
export const assignPointGeometry = assignFieldFn(VegaTypeMap.POINT)
export const assignPolygonGeometry = assignFieldFn(VegaTypeMap.POLYGON)
export const assignLineGeometry = assignFieldFn(VegaTypeMap.LINE)
export const assignNonLocationNumber = assignFieldFn(
  VegaTypeMap.NON_LOCATION_NUMBER
)
export const unassigned = assignFieldFn(UNASSIGNED)

// Convenience methods for creating vega field configs
export function active(f: ChartField, val = true): ChartField {
  return {
    ...f,
    active: val
  }
}
export function inactive(f: ChartField): ChartField {
  return active(f, false)
}
export function required(f: ChartField, val = true): ChartField {
  return {
    ...f,
    required: val
  }
}
