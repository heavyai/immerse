// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getStore } from "services/ImmerseCrossFilter/utils"
import parseChartTokens from "./parse-chart-tokens"
import parseCrossFilterTokens from "./parse-crossfilter-tokens"
import {
  noteParameterUsage,
  noteCrossfilterParameterUsage
} from "components/parameters/actions"

import { varFinderRegexPattern, varExtractRegex } from "./parser-tokens"

import { populateImportableProcess } from "./parser-importable"

import {
  getParameterDefinitions,
  makeGetParameterValue
} from "components/parameters/selectors"
import { addParameterToPanel } from "components/parameters/actions/parameter-visibility-action-creators"

const SELF_REF_ERROR = "ParameterSelfReferentialError"

class ParameterSelfReferentialError extends Error {
  constructor(message) {
    super(message)
    this.name = SELF_REF_ERROR
  }
}

// you want this to return false - if it's true then it's self-referential and would cause a loop.
export const isSelfReferentialParameter = (parameter) => {
  try {
    process(`\${${parameter}}`)
    return false
  } catch (e) {
    if (e.name === SELF_REF_ERROR) {
      return true
    }
    throw e
  }
}

// never ever -ever- set the isRecursing flag manually.
export function process(
  sql,
  options = {},
  {
    // parametersInUse is the set of all params we've seen on this process call.
    parametersInUse = new Set(),
    // current values of the parametersInUse
    processedParameterValues = {},
    // parentParameters are all params hierarchically above us - used to prevent loops
    parentParameters = new Set(),
    // these are things that -look- like parameters, but aren't defined.
    invalidParameters = new Set(),
    // like processedParameterValues but for chart.params
    processedChartParameterValues = {},
    // like parentParameters, but for chart.params
    parentChartParameters = new Set(),
    // filters to ignore when parsing crossfilter tokens
    ignoreFilters = new Set(),
    // tables that filters are copied from
    tablesWithCopiedFilters = new Set(),
    // are we currently being called recursively
    isRecursing = false
  } = {} // internalOptions
) {
  if (typeof sql !== "string") {
    return ""
  }

  if (options.useDisplayName && options.trackUsage !== true) {
    options.trackUsage = false
  }

  const state = getStore().getState ? getStore().getState() : {}
  const parameterDefs = getParameterDefinitions(state)
  const getParameterValue = makeGetParameterValue(state)
  const varFinderRegex = new RegExp(varFinderRegexPattern, "gs")

  /* Sigh. Down in the vega query gen guts, it produces a query that looks like `SELECT table.foo from table...`
     This works fine...as long as `table` is a table and not a select statement. (select * from table).foo is invalid.
     So. We need to look at our list of parameters in use, determine if any of them are of type table, then search for the
     expanded value followed by a dot, and then nuke it. Then we get cake and hope for the best.

     OF NOTE - this will _not_ work if you manually enter a parameter of a type other than table and use it to scope your column.
     we're only nuking known tables here.
  */
  // to start with, only check at the top level.
  if (!isRecursing) {
    Object.keys(parameterDefs).forEach((param) => {
      if (parameterDefs[param].type === "TABLE") {
        const regex = new RegExp(`\\\${${param}}\\.`, "gs")
        sql = sql.replace(regex, "")
      }
    })
  }

  let processedSql = sql.replace(varFinderRegex, (m) => {
    // Safari doesn't support zero-width-negative-lookbehind-assertions.
    // So we capture the first character and it's it has a backslash, we bail out.
    if (m.charAt(0) === "\\") {
      // of course, we toss out the backslash before we return.
      return m.substring(1)
    }

    // BUT...we also need to put that character back in. Unless we're at the start of the string.
    const firstChar = m.charAt(0) === "$" ? "" : m.substring(0, 1)

    const parameter = m.match(varExtractRegex)[1]

    // if it's not a defined parameter - do nothing with it.
    if (!parameterDefs[parameter]) {
      invalidParameters.add(parameter)
      return m
    } else {
      if (options.useDisplayName) {
        if (parameterDefs[parameter].displayName) {
          parametersInUse.add(parameter)
          return firstChar + parameterDefs[parameter].displayName
        }
      }

      if (parentParameters.has(parameter)) {
        throw new ParameterSelfReferentialError(
          `The parameter ${parameter} refers to itself and can't be processed. Update its value using the Parameter Panel.`
        )
      }

      parametersInUse.add(parameter)
      const parameterValue = getParameterValue(parameter)
      processedParameterValues[parameter] = parameterValue

      return (
        // and finally, put that first char back in...unless it's a backslash.
        firstChar +
        process(parameterValue, options, {
          parametersInUse,
          processedParameterValues,
          invalidParameters,
          parentParameters: new Set([...parentParameters, parameter]),
          tablesWithCopiedFilters,
          isRecursing: true
        })
      )
    }
  })

  processedSql = parseChartTokens(
    processedSql,
    options.chartId,
    processedChartParameterValues,
    (p, v) => {
      if (parentChartParameters.has(p)) {
        throw new ParameterSelfReferentialError(
          `The parameter chart.${p} refers to itself and can't be processed.`
        )
      }

      const processed = process(v, options, {
        parametersInUse,
        processedParameterValues,
        invalidParameters,
        parentParameters,
        processedChartParameterValues,
        parentChartParameters: new Set([...parentChartParameters, p]),
        tablesWithCopiedFilters,
        ignoreFilters,
        isRecursing: true
      })
      processedChartParameterValues[p] = processed
      return processed
    }
  )

  processedSql = parseCrossFilterTokens(
    processedSql,
    options,
    ignoreFilters,
    tablesWithCopiedFilters,
    (s, i) =>
      process(s, options, {
        parametersInUse,
        processedParameterValues,
        tablesWithCopiedFilters,
        invalidParameters,
        parentParameters,
        ignoreFilters: i,
        isRecursing: true
      })
  )

  // we only note usage once everything is recursively parsed.
  if (!isRecursing) {
    const {
      token = "generic-token",
      chartId,
      keySuffix = "",
      onProcessComplete = () => {},
      trackUsage = true
    } = options
    const dispatch = getStore().dispatch

    if (trackUsage && dispatch) {
      dispatch(
        noteParameterUsage({
          token,
          chartId: `${chartId}${keySuffix}`,
          parameters: Array.from(parametersInUse)
        })
      )
      if (chartId) {
        dispatch(
          noteCrossfilterParameterUsage(
            chartId,
            token,
            keySuffix,
            Array.from(tablesWithCopiedFilters)
          )
        )
      }

      if (parametersInUse.size && !state.chartEditor.editing) {
        // Add any parameters in use to current set if not already there
        // but don't do it if we're in the chart editor, since we don't know if those are
        // final values yet.
        parametersInUse.forEach((parameter) => {
          getStore().dispatch(addParameterToPanel(parameter))
        })
      }
    }

    onProcessComplete({
      parametersInUse,
      processedParameterValues,
      invalidParameters,
      processedSql
    })
  }

  return processedSql
}

populateImportableProcess(process)
