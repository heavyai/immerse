// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import addMilliseconds from "date-fns/addMilliseconds"
import addSeconds from "date-fns/addSeconds"
import addMinutes from "date-fns/addMinutes"
import addHours from "date-fns/addHours"
import addDays from "date-fns/addDays"
import addWeeks from "date-fns/addWeeks"
import addMonths from "date-fns/addMonths"
import addQuarters from "date-fns/addQuarters"
import addYears from "date-fns/addYears"

import startOfSecond from "date-fns/startOfSecond"
import startOfMinute from "date-fns/startOfMinute"
import startOfHour from "date-fns/startOfHour"
import startOfDay from "date-fns/startOfDay"
import startOfWeek from "date-fns/startOfWeek"
import startOfMonth from "date-fns/startOfMonth"
import startOfQuarter from "date-fns/startOfQuarter"
import startOfYear from "date-fns/startOfYear"
import startOfDecade from "date-fns/startOfDecade"

import endOfSecond from "date-fns/endOfSecond"
import endOfMinute from "date-fns/endOfMinute"
import endOfHour from "date-fns/endOfHour"
import endOfDay from "date-fns/endOfDay"
import endOfWeek from "date-fns/endOfWeek"
import endOfMonth from "date-fns/endOfMonth"
import endOfQuarter from "date-fns/endOfQuarter"
import endOfYear from "date-fns/endOfYear"
import endOfDecade from "date-fns/endOfDecade"

const MILLISECOND = "millisecond"
const SECOND = "second"
const MINUTE = "minute"
const HOUR = "hour"
const DAY = "day"
const WEEK = "week"
const MONTH = "month"
const QUARTER = "quarter"
const YEAR = "year"
const DECADE = "decade"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const { START_OF_WEEK } = available_feature_flags

let WEEK_OPTIONS = null
function getWeekOptions() {
  if (WEEK_OPTIONS === null) {
    // we only need to do this once since changing the value requires reload
    const key = getFeatureFlag(START_OF_WEEK)
    if (key === "week_sunday") {
      WEEK_OPTIONS = { weekStartsOn: 0 }
    } else if (key === "week_saturday") {
      WEEK_OPTIONS = { weekStartsOn: 6 }
    } else {
      // Monday
      WEEK_OPTIONS = { weekStartsOn: 1 }
    }
  }
  return WEEK_OPTIONS
}

const startBinDispatch = {
  [MILLISECOND]: addMilliseconds,
  [SECOND]: (d, m) => startOfSecond(addSeconds(d, m)),
  [MINUTE]: (d, m) => startOfMinute(addMinutes(d, m)),
  [HOUR]: (d, m) => startOfHour(addHours(d, m)),
  [DAY]: (d, m) => startOfDay(addDays(d, m)),
  [WEEK]: (d, m) => startOfWeek(addWeeks(d, m), getWeekOptions()),
  [MONTH]: (d, m) => startOfMonth(addMonths(d, m)),
  [QUARTER]: (d, m) => startOfQuarter(addQuarters(d, m)),
  [YEAR]: (d, m) => startOfYear(addYears(d, m)),
  [DECADE]: (d, m) => startOfDecade(addYears(d, m * 10))
}

const endBinDispatch = {
  [MILLISECOND]: (date) => date,
  [SECOND]: endOfSecond,
  [MINUTE]: endOfMinute,
  [HOUR]: endOfHour,
  [DAY]: endOfDay,
  [WEEK]: (d) => endOfWeek(d, getWeekOptions()),
  [MONTH]: endOfMonth,
  [QUARTER]: endOfQuarter,
  [YEAR]: endOfYear,
  [DECADE]: endOfDecade
}

export function toFakeUTCDate(date) {
  return addMinutes(date, date.getTimezoneOffset())
}

export function fromFakeUTCDate(date) {
  return addMinutes(date, -date.getTimezoneOffset())
}

const requiresUTC = new Set([DAY, WEEK, MONTH, QUARTER, YEAR, DECADE])

export function makeBinEndDate(date, bin) {
  if (!requiresUTC.has(bin)) {
    return endBinDispatch[bin](date)
  }
  const utcDate = toFakeUTCDate(date)
  const utcEndDate = endBinDispatch[bin](utcDate)
  const endDate = fromFakeUTCDate(utcEndDate)
  return endDate
}

export function makeBinStartDate(date, bin, magnitude) {
  if (!requiresUTC.has(bin)) {
    return startBinDispatch[bin](date, magnitude)
  }
  const utcDate = toFakeUTCDate(date)
  const utcStartDate = startBinDispatch[bin](utcDate, magnitude)
  const startDate = fromFakeUTCDate(utcStartDate)
  return startDate
}
