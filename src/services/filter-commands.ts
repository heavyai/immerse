// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Application commands compose canonical state changes, redraws and notifications.
import * as stateActions from "vega/actions/filter-state-actions"
import { createFilterApplicationService } from "services/filter-application-service"
import {
  isOldFilter,
  OldFilterMetadata,
  FilterMetadata
} from "vega/constants/filter-metadata-types"
const service = createFilterApplicationService(stateActions)
export const clearAllChartFilters = service.clearAllChartFilters
export const clearFilterByName = service.clearFilterByName
export const clearCrossFilters = service.clearCrossFilters
export const clearDashboardFilters = service.clearDashboardFilters
export const setChartFilter = service.setChartFilter
export const setChartCohort = service.setChartCohort
export const setCrossFilter = service.setCrossFilter
export const setDashboardCohort = service.setDashboardCohort
export const setDashboardFilter = service.setDashboardFilter
export const toggleFilterByName = service.toggleFilterByName
export const toggleCrossfilters = service.toggleCrossfilters
export const toggleDashboardFilters = service.toggleDashboardFilters
export const updateFilterByName = service.updateFilterByName

export function toggleOldFilter(name: string, enabled?: boolean) {
  return (_, getState, services: any) => {
    const { omnifilters } = getState()
    const filter = (omnifilters as FilterMetadata[]).find(
      (f) => isOldFilter(f) && f.name === name
    ) as OldFilterMetadata | undefined
    if (filter) {
      const cfManager = services.get("crossfilter")
      const cf = cfManager.getCrossfilterById(filter.crossfilterId)
      if (cf) {
        if (filter.appliesTo === "GLOBAL") {
          cf.toggleGlobalFilter(filter.index, enabled)
        } else {
          cf.toggleFilter(filter.index, enabled)
        }
      }
    }
  }
}
