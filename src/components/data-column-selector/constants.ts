// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const DATA_TYPE_CATEGORY = {
  CUSTOM: "CUSTOM",
  COHORT: "COHORT",
  GEO: "GEO",
  NUMBER: "NUMBER",
  ENUM: "ENUM",
  DATE_TIME: "DATE_TIME",
  COLUMN_PARAMETER: "COLUMN_PARAMETER"
} as const

export const DATA_TYPE_CATEGORY_TEXT = {
  [DATA_TYPE_CATEGORY.CUSTOM]: "Custom",
  [DATA_TYPE_CATEGORY.COHORT]: "Cohort",
  [DATA_TYPE_CATEGORY.GEO]: "Geo",
  [DATA_TYPE_CATEGORY.NUMBER]: "Number",
  [DATA_TYPE_CATEGORY.ENUM]: "Categorical",
  [DATA_TYPE_CATEGORY.DATE_TIME]: "Date/Time",
  [DATA_TYPE_CATEGORY.COLUMN_PARAMETER]: "Parameter"
}

export const DATA_TABLE_HEADERS = [
  {
    columnHeader: "Column Name",
    columnKey: "value"
  },
  {
    columnHeader: "Type",
    columnKey: "type"
  }
]

export const DATA_TABLE_HEADERS2 = [
  {
    columnHeader: "Type",
    columnKey: "type"
  },
  {
    columnHeader: "Column Name",
    columnKey: "value"
  }
]
