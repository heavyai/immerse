// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  CUSTOM_SQL_SELECTOR_TYPE,
  ComboDataSelection,
  MeasureExpression
} from "vega/constants/data-selection-types"

const measureToSortByMeasure = (
  measure: MeasureExpression,
  name: string,
  defaultAggregation?: string
): any => {
  switch (measure.type) {
    case "column_aggregate":
      return {
        label: measure.column.value,
        value: measure.column.value,
        type: measure.column.type,
        aggType: measure.aggregate ?? defaultAggregation,
        name
      }
    case "column":
      return {
        label: measure.column.value,
        value: measure.column.value,
        type: measure.column.type,
        name
      }
    case "count":
      return {
        label: " # Records",
        value: "*",
        type: measure.type,
        name: "countval"
      }
    case CUSTOM_SQL_SELECTOR_TYPE:
      return {
        label: measure.name,
        value: measure.sql,
        type: measure.column?.type,
        name
      }
    default:
      throw new Error("Unexpected measure type")
  }
}

export const buildSortByMeasures = (
  measures: ComboDataSelection["measures"],
  defaultAggregation?: string
) => {
  const sortByMeasures = []

  measures.size.forEach((measure, index) => {
    sortByMeasures.push(
      measureToSortByMeasure(measure, `measure${index}`, defaultAggregation)
    )
  })

  if (measures.color) {
    sortByMeasures.push(measureToSortByMeasure(measures.color, "measureColor"))
  }

  return sortByMeasures
}

export const buildSortByDimensions = (dimensions) =>
  Object.keys(dimensions).reduce((sortByDimensions, key) => {
    if (dimensions[key] && key !== "color" && dimensions[key].length) {
      dimensions[key].forEach((dim) => {
        const isCusomSql = dim.type === CUSTOM_SQL_SELECTOR_TYPE
        sortByDimensions.push({
          label: isCusomSql ? dim.name : dim.column.name || dim.column.value,
          value: isCusomSql ? dim.sql : dim.column.value,
          type: dim.column.type
        })
      })
    }
    return sortByDimensions
  }, [])

// dimension alias is called "dimension" in vega combo chart, so dimAlias is only from Vega Combo component
export function createSortByOptions(dimensions, measures, dimAlias?) {
  let allRowsValue = "countval"

  const newDimensions = dimensions.reduce((total, current, index) => {
    if (current.value && !current.inactive) {
      total.push({
        label: current.label,
        value: dimAlias ? `${dimAlias}${index}` : `key${index}`,
        type: current.custom ? "custom" : "A-Z"
      })
    }
    return total
  }, [])

  const newMeasures = measures.reduce((total, current) => {
    const measureExistInArray = total.length ? measureValueAndAggType() : false

    if (
      !measureExistInArray &&
      current.value &&
      !current.inactive &&
      current.value !== "*"
    ) {
      total.push({
        label: current.label,
        value: current.name,
        type: current.aggType
      })
    }

    if (current.value === "*" && !current.inactive) {
      allRowsValue = current.name
    }

    return total

    function measureValueAndAggType() {
      const aggType = current.aggType
      return total.every(
        (measure) =>
          aggType && measure.label === current.value && measure.type === aggType
      )
    }
  }, [])

  const options = newDimensions.concat(newMeasures)

  options.unshift({ label: "# Records", value: allRowsValue })

  return options
}

export function setCorrectOrderingValue(value) {
  let order = "asc"
  if (value) {
    order = value.order === "asc" ? "desc" : "asc"
  }
  return Object.assign({}, value, { order })
}
