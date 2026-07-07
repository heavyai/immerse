// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  paramNameString,
  varFinderRegexPattern,
  varExtractRegex
} from "components/parameters/validation"

/*
  this one is worth explaining. It starts with "crossfilter".tableName
  optionally includes a chartID in square brackets.
  optionally includes a fallback value after "??".

  tableName may be ${custom}

  you may also "copy" filters from one table to another with FILTER_COPY(...)
  first argument is crossfilter.tableName as above
  second argument is the name of the table to copy filters to
  each argument after the second specifies oldname=newname to specify how to
    rename columns in the filters - note that you do not need to specify any at
    all if the tables happen to have the same columns

  full examples:
  crossfilter.tableName[chartId] ?? fallback
  FILTER_COPY(crossfilter.tableName, copyToTable, field1=newfield1) ?? fallback
*/
const tablePattern = "[A-Za-z_][A-Za-z0-9\\$_]*"
const tableOrParamPattern = `(?:${tablePattern}|\\\${${paramNameString}})`
const crossfilterPattern = `crossfilter\\.(${tableOrParamPattern})(?:\\[(\\w+)\\])?`
const fieldsPattern = `(?:\\s*,\\s*\\w+\\s*=\\s*\\w+)*`
const copyPattern = `FILTER_COPY\\(${crossfilterPattern}\\s*,\\s*(${tableOrParamPattern})(${fieldsPattern})\\s*\\)`
const copyOrReturnPattern = `(?:${copyPattern}|${crossfilterPattern})`
const fallbackPattern = `(?:\\s*\\?\\?\\s*(.*?))?`
const withFallbackPattern = `${copyOrReturnPattern}${fallbackPattern}`
export const crossfilterRegexPattern = `(.)?\\\${${withFallbackPattern}}`

/*
  Parameters matching chart configs take the form "chart".property
  optionally includes a fallback value after "??"
*/
export const chartConfigRegexPattern = `(.)?\\\${chart\\.([\\w\\d]+)${fallbackPattern}}`

export { varFinderRegexPattern, varExtractRegex }
