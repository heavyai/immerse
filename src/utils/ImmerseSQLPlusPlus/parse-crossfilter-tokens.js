// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import crossfilterExtractor from "./crossfilter-extractor"
import { crossfilterRegexPattern } from "./parser-tokens"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

/**
 * Parse ${crossfilter.tokens}
 * @param sql The sql
 * @param options Options
 * @param ignoreFilters A Set of filter names to ignore (for recursion)
 * @param tablesWithCopiedFilters A Set of tables from which filters have been copied
 * @param process A recursive process function to call
 * @returns the sql with ${crossfilter.tokens} replaced
 */
export const parseCrossFilterTokens = (
  sql,
  options,
  ignoreFilters = new Set(),
  tablesWithCopiedFilters = new Set(),
  process = (s) => s
) => {
  // if we're not parsing cf tokens, then just return our original string.
  if (!getFeatureFlag(available_feature_flags.PARSE_CROSSFILTER_TOKENS)) {
    return sql
  }

  const crossfilterRegex = new RegExp(crossfilterRegexPattern, "gs")

  return sql.replace(
    crossfilterRegex,
    (
      m,
      firstChar,
      tableName1,
      cfChartId1,
      copyToTable,
      copyFieldsString,
      tableName2,
      cfChartId2,
      fallback
    ) => {
      // Safari doesn't support zero-width-negative-lookbehind-assertions.
      // So we capture the first character and it's it has a backslash, we bail out.
      if (firstChar === "\\") {
        return m
      }

      const tableName = tableName1 || tableName2
      const cfChartId = cfChartId1 || cfChartId2
      let copyFields = undefined
      if (copyFieldsString) {
        copyFields = Object.fromEntries(
          copyFieldsString.split(",").flatMap((s) => {
            const f = s.match(/\s*(\w+)\s*=\s*(\w+)\s*/)
            if (f) {
              return [[f[1], f[2]]]
            }
            return []
          })
        )
      }
      tablesWithCopiedFilters.add(tableName)
      return (
        firstChar +
        crossfilterExtractor({
          tableName,
          cfChartId,
          copyToTable,
          copyFields,
          fallback,
          chartId: options.chartId,
          layerId: options.layerId,
          layerName: options.layerName,
          process,
          ignoreFilters
        })
      )
    }
  )
}

export default parseCrossFilterTokens
