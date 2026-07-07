// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import pushid from "pushid"

import { importableStore as store } from "store/importableStore"
import crossFilterExtractor from "utils/ImmerseSQLPlusPlus/crossfilter-extractor"

import {
  FilterAndCohort,
  buildDashboardFilterMetadata
} from "vega/constants/filter-metadata-types"
import { sqlFilter } from "vega/constants/filter-types"
import { CrossLink } from "constants/crosslink-types"

import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"

const { ENABLE_CROSSLINK_PANEL } = available_feature_flags

/**
 * @param chartId This chart's ID
 * @param copyToTable The data source for this chart
 * @returns an array of "global" custom sql filters representing the filters
 *   from crosslinked data sources.
 */

// this one looks up the crosslinks from the state, and hands it through to the internal
// builder function so it's disconnected from the store.
export function buildCrossLinkFilters(
  chartId: string,
  tables: string[]
): FilterAndCohort[] {
  const { crossLinks } = store.getState()
  return buildCrossLinkFiltersInternal(chartId, tables, crossLinks)
}

/**
 * @param chartId This chart's ID
 * @param copyToTable The data source for this chart
 * @param crossLinks The crosslinks we're going to build from.
 * @returns an array of "global" custom sql filters representing the filters
 *   from crosslinked data sources.
 */
export function buildCrossLinkFiltersInternal(
  chartId: string,
  tables: string[] = [],
  crossLinks: Array<CrossLink>
): FilterAndCohort[] {
  if (!getFeatureFlag(ENABLE_CROSSLINK_PANEL)) {
    return []
  }

  const copyToTable = tables[0]
  return crossLinks.flatMap((crosslink: CrossLink) => {
    if (crosslink.enabled) {
      let tableName: string | null = null
      const copyFields: Record<string, string> = {}
      const cohortFields: Record<string, string> = {}
      if (tables.includes(crosslink.sourceA)) {
        tableName = crosslink.sourceB
        crosslink.columnLinks.forEach(({ columnA, columnB, cohort }) => {
          if (cohort) {
            cohortFields[columnB] = columnA
          } else {
            copyFields[columnB] = columnA
          }
        })
      } else if (tables.includes(crosslink.sourceB)) {
        tableName = crosslink.sourceA
        crosslink.columnLinks.forEach(({ columnA, columnB, cohort }) => {
          if (cohort) {
            cohortFields[columnA] = columnB
          } else {
            copyFields[columnA] = columnB
          }
        })
      }

      if (tableName) {
        const sql = crossFilterExtractor({
          tableName,
          copyToTable,
          copyFields,
          cohortFields:
            Object.keys(cohortFields).length === 0 ? undefined : cohortFields,
          fallback: "",
          chartId
        })
        if (sql.length > 0) {
          return [
            buildDashboardFilterMetadata(
              pushid(),
              sqlFilter(copyToTable, copyToTable, sql),
              true
            )
          ]
        }
      }
    }

    return []
  })
}
