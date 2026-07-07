// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { filter, lensPath, view } from "ramda"

export interface NumericIntegerTypes {
  int2: true
  int4: true
  int8: true
  SMALLINT: true
  TINYINT: true
  INT: true
  BIGINT: true
}

export const NUMERICAL_INTEGER_TYPES: NumericIntegerTypes = {
  int2: true,
  int4: true,
  int8: true,
  SMALLINT: true,
  TINYINT: true,
  INT: true,
  BIGINT: true
}

export interface NumericSmallIntegerTypes {
  int2: true
  int4: true
  int8: true
  SMALLINT: true
  TINYINT: true
  INT: false
  BIGINT: false
}

export const NUMERICAL_SMALL_INTEGER_TYPES: NumericSmallIntegerTypes = {
  int2: true,
  int4: true,
  int8: true,
  SMALLINT: true,
  TINYINT: true,
  INT: false,
  BIGINT: false
}

export interface NumericCustomTypes {
  CUSTOM: true
}
export const NUMERICAL_CUSTOM_TYPE: NumericCustomTypes = {
  CUSTOM: true
}

export interface NumericRealTypes {
  FLOAT: true
  DOUBLE: true
  DECIMAL: true
}

export const NUMERICAL_REAL_TYPES: NumericRealTypes = {
  FLOAT: true,
  DOUBLE: true,
  DECIMAL: true
}

export type NoncustomNumericTypes = NumericIntegerTypes & NumericRealTypes
export const NONCUSTOM_NUMERICAL_TYPES: NoncustomNumericTypes = {
  ...NUMERICAL_INTEGER_TYPES,
  ...NUMERICAL_REAL_TYPES
}

export type NumericTypes = NoncustomNumericTypes & NumericCustomTypes
export const ALL_NUMERICAL_TYPES: NumericTypes = {
  ...NONCUSTOM_NUMERICAL_TYPES,
  ...NUMERICAL_CUSTOM_TYPE
}

export interface TimeTypes {
  DATE: true
  TIMESTAMP: true
  date: true
  datetime: true
  timestamp: true
  "timestamp without timezone": true
  TIME: true
}

export interface DateTypes {
  DATE: true
  TIMESTAMP: true
  date: true
  datetime: true
  timestamp: true
  "timestamp without timezone": true
}

export const TIME_UNITS: TimeTypes = {
  DATE: true,
  TIMESTAMP: true,
  date: true,
  datetime: true,
  timestamp: true,
  "timestamp without timezone": true,
  TIME: true
}

export const DATE_UNITS: DateTypes = {
  DATE: true,
  TIMESTAMP: true,
  date: true,
  datetime: true,
  timestamp: true,
  "timestamp without timezone": true
}

export const NUMERICAL_AND_TIME_TYPES: NumericTypes & TimeTypes = {
  ...ALL_NUMERICAL_TYPES,
  ...TIME_UNITS
}

export interface BoolTypes {
  BOOL: true
}
export const BOOL_TYPES: BoolTypes = { BOOL: true }

export interface TextTypes {
  varchar: true
  text: true
  STR: true
}

export const TEXT_TYPES: TextTypes = {
  varchar: true,
  text: true,
  STR: true
}

export const TEXT_AND_BOOL_TYPES: TextTypes & BoolTypes = {
  ...TEXT_TYPES,
  ...BOOL_TYPES
}

export const SINGLE_VALUE_STR_TYPE = "singleValueStr"

export const SINGLE_VALUE_TYPES = {
  [SINGLE_VALUE_STR_TYPE]: true
}

export type DataTypes = NumericTypes & TimeTypes & TextTypes & BoolTypes

export const ALL_TYPES: DataTypes = {
  ...NUMERICAL_AND_TIME_TYPES,
  ...TEXT_AND_BOOL_TYPES,
  ...SINGLE_VALUE_TYPES
}

export const DEFAULT_SELECTOR_TYPES: DataTypes = {
  ...ALL_TYPES
}

export const ALWAYS_BINNED_TYPES: TimeTypes = { ...TIME_UNITS }

export const GEO_POINT_ONLY_TYPES = {
  POINT: true
}

export const GEO_POINT_OTHER_TYPES = {
  ...NUMERICAL_REAL_TYPES
}

export const GEO_POINT_TYPES = {
  ...GEO_POINT_OTHER_TYPES,
  ...GEO_POINT_ONLY_TYPES
}

export const POLY_GEO_TYPES = {
  POLYGON: true,
  MULTIPOLYGON: true
}

export const LINE_GEO_TYPES = {
  LINESTRING: true,
  MULTILINESTRING: true
}

export const GEO_TYPES = {
  ...POLY_GEO_TYPES,
  POINT: true,
  ...LINE_GEO_TYPES
}

export const NONCUSTOM_NUMERICAL_AND_GEO_POINT_TYPES = {
  ...NONCUSTOM_NUMERICAL_TYPES,
  ...GEO_POINT_TYPES
}

export function isNonDictString({ type, is_dict }) {
  return Boolean(!is_dict && TEXT_TYPES[type])
}

export function isArrayColumn({ is_array }) {
  return is_array
}

export function isDictString({ type, is_dict }) {
  return Boolean(is_dict && TEXT_TYPES[type])
}

export const NUM_BINS_FOR_NOT_TIME = 12
export const NUM_BINS_FOR_TIME = 1000
export const NUM_BINS_FOR_HEATMAP = 50
export const DIFF_TO_AUTOBIN = 50

const TYPE_MAP = {
  BOOL: "boolean",
  CUSTOM: "custom",
  DATE: "time",
  STR: "string",
  TIMESTAMP: "time",
  MULTIPOLYGON: "geo",
  POLYGON: "geo"
}

export function iconFromType(type: string, isArray: boolean) {
  const cssLabel = []
  if (isArray) {
    cssLabel.push("array")
  }

  if (TYPE_MAP[type]) {
    cssLabel.push(TYPE_MAP[type])
  } else {
    cssLabel.push("number")
  }

  return cssLabel.join("-")
}

// [Selector] -> String -> ([Column] -> [Column])
export function filterOptions(SELECTORS, selectorName) {
  return filter(({ type, is_array }) => {
    const SELECTOR_TYPE = view(
      lensPath([0, "type"]),
      SELECTORS.filter((SELECTOR) => SELECTOR.name === selectorName)
    )
    return SELECTOR_TYPE
      ? SELECTOR_TYPE[type] && !(is_array && SELECTOR_TYPE.noArrays)
      : true
  }) // partially-applied; still wants [Column]
}

export const isQuantitative = (type) =>
  Boolean(NONCUSTOM_NUMERICAL_AND_GEO_POINT_TYPES[type])
export const isOrdinal = (type) => Boolean(TEXT_AND_BOOL_TYPES[type])
export const isNumerical = (type) => Boolean(NONCUSTOM_NUMERICAL_TYPES[type])
export const isPointOnlyGeo = (type) => Boolean(GEO_POINT_ONLY_TYPES[type])
export const isPointOtherGeo = (type) => Boolean(GEO_POINT_OTHER_TYPES[type])
export const isPolyGeo = (type) => Boolean(POLY_GEO_TYPES[type])
export const isGeo = (type) => Boolean(GEO_TYPES[type])
export const isNumericType = (type) => Boolean(ALL_NUMERICAL_TYPES[type])
export const isTimeType = (type) => Boolean(TIME_UNITS[type])
export const isDateType = (type) => Boolean(DATE_UNITS[type])
export const isLineGeo = (type) => Boolean(LINE_GEO_TYPES[type])
export const isIntegerType = (type) => Boolean(NUMERICAL_INTEGER_TYPES[type])
export const isStringType = (type) => Boolean(TEXT_TYPES[type])
export const isBoolType = (type) => Boolean(BOOL_TYPES[type])

// Right now, backend doesn't support creating a dimension on a bigint type
export const supportedIntegerTypesForCohort = (type) =>
  Boolean(NUMERICAL_INTEGER_TYPES[type])
