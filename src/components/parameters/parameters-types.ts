// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type ParameterUsages = {
  [tabId: string]: {
    [parameterName: string]: {
      [usageToken: string]: string[]
    }
  }
}

// Parameter types that are exposed for direct use and management by user (intended
// to be used with ${paramName} syntax and visible in parameter manager)
export enum UserFacingParameterTypes {
  COLUMN = "COLUMN",
  COLUMN_VALUE = "COLUMN_VALUE",
  NUMBER = "NUMBER",
  TEXT = "TEXT",
  TABLE = "TABLE",
  COORDINATE = "COORDINATE"
}

export const isUserFacingParameter = (definition: ParameterDefinition) =>
  Object.values(UserFacingParameterTypes).includes(definition.type)

enum SharedCustomSqlParameterTypes {
  CUSTOM_MEASURE = "CUSTOM_MEASURE",
  CUSTOM_DIMENSION = "CUSTOM_DIMENSION",
  CUSTOM_FILTER = "CUSTOM_FILTER"
}

export enum GlobalCustomSqlParameterTypes {
  GLOBAL_MEASURE = "GLOBAL_MEASURE",
  GLOBAL_DIMENSION = "GLOBAL_DIMENSION",
  GLOBAL_FILTER = "GLOBAL_FILTER"
}

const CUSTOM_SQL_PARAMETER_TYPES = {
  ...SharedCustomSqlParameterTypes,
  ...GlobalCustomSqlParameterTypes
}

export const isCustomSqlParameter = (definition: ParameterDefinition) =>
  Object.values(CUSTOM_SQL_PARAMETER_TYPES).includes(definition.type)

export const isGlobalCustomSqlParameter = (definition: ParameterDefinition) =>
  Object.values(GlobalCustomSqlParameterTypes).includes(definition.type)

const JOIN_PARAMETER = "JOIN"

export const ParameterTypes = {
  ...UserFacingParameterTypes,
  ...CUSTOM_SQL_PARAMETER_TYPES,
  JOIN: JOIN_PARAMETER
}

export type ParameterType =
  | UserFacingParameterTypes
  | SharedCustomSqlParameterTypes
  | GlobalCustomSqlParameterTypes
  | typeof JOIN_PARAMETER

export type BaseParameterDefinition = {
  name: string
  desc: string
  type: ParameterType
  value?: string | null
  defaultValue?: string | null
  displayName?: string
}

export type NumberParameterDefinition = BaseParameterDefinition & {
  min?: string
  max?: string
}

export type ColumnParameterDefinition = BaseParameterDefinition & {
  source: string
}

export type ColumnValueParameterDefinition = BaseParameterDefinition & {
  source: string
  column: string
}

export enum CoordinateParameterShape {
  LAT_LON_POLY_LINE = "LatLonPolyLine"
}

export enum CoordinateIndex {
  LON = 0,
  LAT = 1
}

export type CoordinateParameterDefinition = BaseParameterDefinition & {
  parentChartId: string
  parentTabId: string
  shape: CoordinateParameterShape
  vertexIndex: number
}

export type ParameterDefinition =
  | BaseParameterDefinition
  | NumberParameterDefinition
  | ColumnParameterDefinition
  | ColumnValueParameterDefinition

export type ParameterSets = {
  [setId: string]: {
    name: string
    id: string
    parent?: string
    tabId: string
  }
}

export type ParameterValues = {
  [parameterName: string]: {
    [tabId: string]: {
      name: string
      value?: string | null
      defaultValue?: string | null
    }
  }
}
