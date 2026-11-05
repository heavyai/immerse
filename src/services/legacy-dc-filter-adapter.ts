// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { redrawAll, redrawChart } from "actions/dc-action-creators"
import { CrossLink } from "constants/crosslink-types"
import { importableServices as Services } from "services/immerse-importable"

export async function doRedrawAll(
  dispatch: Function,
  getState: Function,
  tables: Set<string>,
  options: { onlyLinked?: boolean; skipLinked?: boolean } = {}
): Promise<void> {
  const {
    dc: { initialRender },
    charts,
    crossLinks,
    dashboard: { selectedTabId },
    parameters: { crossfilterTokens } = { crossfilterTokens: null }
  } = getState()
  if (initialRender.done) {
    const groups =
      options.onlyLinked && !options.skipLinked
        ? new Set<string | undefined>()
        : new Set<string | undefined>(tables)

    if (!options.skipLinked) {
      crossLinks.forEach(({ sourceA, sourceB, enabled }: CrossLink) => {
        if (enabled) {
          if (tables.has(sourceA)) {
            groups.add(sourceB)
          } else if (tables.has(sourceB)) {
            groups.add(sourceA)
          }
        }
      })
    }

    // Seems data sources are used as "groups" in heavyai-charting, but there's also an
    // "undefined" group that some things end up in, so include that, too
    if (!options.onlyLinked) {
      groups.add(undefined)
    }

    const redrawPromises = [dispatch(redrawAll([...groups]))]

    if (crossfilterTokens?.[selectedTabId]) {
      let allgroups = groups
      if (options.onlyLinked) {
        // if onlyLinked was set, groups won't contain dataSources, but we need
        // them here
        allgroups = new Set([...groups, ...tables])
      }

      const refreshedCharts = new Set()
      crossfilterTokens[selectedTabId].forEach((r) => {
        if (allgroups.has(r.table) && !refreshedCharts.has(r.chartId)) {
          if (charts[r.chartId] && charts[r.chartId].dcFlag) {
            const dcChart = Services.get("dc").getChart(
              charts[r.chartId].dcFlag
            )
            // chartGroups can be a string (single) or an array of strings (multiple)
            const chartGroups = dcChart?.chartGroup?.() ?? []
            const groupsMatch = Array.isArray(chartGroups)
              ? chartGroups.some((group: string) => groups.has(group))
              : groups.has(chartGroups)
            if (dcChart && groupsMatch) {
              redrawPromises.push(dispatch(redrawChart(dcChart, r.chartId)))
            }
          }
          refreshedCharts.add(r.chartId)
        }
      })
    }

    await Promise.allSettled(redrawPromises)
  }
}
