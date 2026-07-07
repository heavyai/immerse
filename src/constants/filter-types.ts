// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

type ColumnType = "TIMESTAMP" | "BOOL" | "STR" | "BIGINT" | "INT"

type StringOperator =
  | "CONTAINS"
  | "EQUALS"
  | "NOT CONTAINS"
  | "NOT EQUALS"
  | "IS"
type NumberOperator = "=" | "<" | ">" | "!=" | "<=" | ">="
type NullOperator = "IS NULL" | "NOT NULL"

type DatePart = "day" | "hour" | "week" | "month" | "quarter" | "year"

type RelativeLabel =
  | "Today"
  | "Last 60 Min."
  | "Yesterday"
  | "This Week"
  | "Last Week"
  | "This Month"
  | "Last Month"
  | "Last 7 Days"
  | "Last 30 Days"
  | "This Quarter"
  | "Last Quarter"
  | "Year To Date"
  | "Last Year"

export type RelativeValue =
  | {
      now: true
    }
  | {
      date: number
      add?: -1 | -7 | -30
      datepart: DatePart
      number: number | RelativeValue
      operator: "DATEDIFF"
    }
  | {
      date: number
      add?: -1 | -7 | -30
      datepart: DatePart
      number: RelativeValue
      operator: "DATEDIFF"
    }

export type ComparisonFilter = {
  dataSource?: string
  error: boolean
  expression?: string
  isRelative: false
  loading: boolean
  operand: string
  operator: StringOperator | NumberOperator | NullOperator
  relativeLabel?: RelativeLabel
  shouldAutosuggest: boolean
  type: ColumnType
  value: string
}

export type RangeFilter = {
  dataSource?: string
  error: boolean
  expression?: string
  isRelative: false
  loading: boolean
  operand: [string, string]
  operator: "BTW" | "IS"
  relativeLabel?: RelativeLabel
  shouldAutosuggest: boolean
  type: "TIMESTAMP"
  value: string
}

export type RelativeFilter = {
  dataSource?: string
  error: boolean
  expression?: string
  isRelative: true
  loading: boolean
  operand: [RelativeValue, RelativeValue]
  operator: "="
  relativeLabel: RelativeLabel
  shouldAutosuggest: boolean
  type: "TIMESTAMP"
  value: string
}

export type Filter = ComparisonFilter | RangeFilter | RelativeFilter
