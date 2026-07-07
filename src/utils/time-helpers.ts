// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import moment from "moment"

const MS_IN_SECS = 0.001
const SEC = 1
const MIN_IN_SECS = 60
const HOUR_IN_SECS = 60 * MIN_IN_SECS
const DAY_IN_SECS = 24 * HOUR_IN_SECS
const WEEK_IN_SECS = 7 * DAY_IN_SECS
const MONTH_IN_SECS = 30 * DAY_IN_SECS
const QUARTER_IN_SECS = 3 * MONTH_IN_SECS
const YEAR_IN_SECS = 365 * DAY_IN_SECS
const DECADE_IN_SECS = 10 * YEAR_IN_SECS

export const ONE_SECOND_IN_MS = 1000

export const TIME_INTERVALS = [
  "millisecond",
  "second",
  "minute",
  "hour",
  "day",
  "week",
  "month",
  "quarter",
  "year",
  "decade"
]

export const TIME_INTERVALS_LABEL: Record<string, string> = {
  millisecond: "Millisecond",
  second: "Second",
  minute: "Minute",
  hour: "Hour",
  day: "Day",
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "1 year",
  decade: "10 year"
}

export const TIME_LABEL_TO_SECS = {
  millisecond: MS_IN_SECS,
  second: SEC,
  minute: MIN_IN_SECS,
  hour: HOUR_IN_SECS,
  day: DAY_IN_SECS,
  week: WEEK_IN_SECS,
  month: MONTH_IN_SECS,
  quarter: QUARTER_IN_SECS,
  year: YEAR_IN_SECS,
  decade: DECADE_IN_SECS
}

export const BIN_TRANSLATION = {
  century: "1c",
  decade: "10y",
  year: "1y",
  quarter: "1q",
  month: "1mo",
  second: "1s",
  millisecond: "1ms",
  minute: "1m",
  hour: "1h",
  day: "1d",
  week: "1w",
  auto: "10y"
}

export const EXTRACT_TRANSLATION = {
  minute: "1m",
  hour: "1h",
  day: "1d",
  month: "1mo",
  quarter: "1q",
  year: "1y",
  isodow: "dow"
}

export const EXTRACT_OPTIONS = [
  { value: "minute", label: "Minute" },
  { value: "hour", label: "Hour" },
  { value: "isodow", label: "Day of Week" },
  { value: "day", label: "Day of Month" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
  { value: "year", label: "Year" }
]

export const capitalizeFirstLetter = (s) =>
  s.charAt(0).toUpperCase() + s.slice(1)

export const TIME_SPANS = TIME_INTERVALS.map((value) => ({
  value,
  label: TIME_INTERVALS_LABEL[value],
  numSeconds: TIME_LABEL_TO_SECS[value]
}))

export function relativeToMoment({ datepart, number, now }) {
  if (now) {
    return moment.utc().locale("en")
  } else if (isNaN(number)) {
    const add = number.add
    if (isNaN(number.add)) {
      return moment.utc().startOf(datepart).locale("en")
    } else {
      return moment.utc().add(add, datepart).startOf(datepart).locale("en")
    }
  } else {
    return moment.utc().add(number, datepart).locale("en")
  }
}

export function filterLabel(filter) {
  if (filter.isRelative && filter.relativeLabel) {
    const lower = relativeToMoment(filter.operand[0])
    const upper = relativeToMoment(filter.operand[1])

    switch (filter.relativeLabel) {
      case "Today":
        return `(${lower.format("MMM Do")})`
      case "Last 10 Min.":
        return `(${lower.format("MMM Do")})`
      case "Last 30 Min.":
        return `(${lower.format("MMM Do")})`
      case "Last 60 Min.":
        return `(${lower.format("MMM Do")})`
      case "Yesterday":
        return `(${lower.format("MMM Do")})`
      case "This Week":
        return `(${lower.format("MMM Do")} - ${upper.format("MMM Do")})`
      case "Last Week":
        return `(${lower.format("MMM Do")} - ${upper.format("MMM Do")})`
      case "This Month":
        return `(${lower.format("MMM")})`
      case "Last Month":
        return `(${lower.format("MMM")})`
      case "Last 7 Days":
        return `(${lower.format("MMM Do")} - ${upper.format("MMM Do")})`
      case "Last 30 Days":
        return `(${lower.format("MMM Do")} - ${upper.format("MMM Do")})`
      case "This Quarter":
        return `(${lower.format("MMM")} - ${upper.format("MMM Do")})`
      case "Last Quarter":
        return `(${lower.format("MMM")} - ${upper.format("MMM")})`
      case "Year To Date":
        return `(${lower.format("YYYY")})`
      case "Last Year":
        return `(${lower.format("YYYY")})`
      default:
        return ""
    }
  }
  return ""
}
