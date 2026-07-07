// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { TextField } from "@rmwc/textfield"
import { ListItem, ListItemMeta } from "@rmwc/list"
import { List } from "react-virtualized"
import { Tooltip } from "@rmwc/tooltip"
import { AppState } from "vega/charts/types"
import { getDashboards } from "actions/dashboards-action-creator"
import { selectImportDashboard } from "actions/shared-settings-import-action-creators"
import { EmptyState } from "../../empty-state/empty-state"
import { PaletteMapping } from "../types"
import { PaletteMappingImportList } from "./palette-mapping-import-list"
import { PaletteMappingImportLoading } from "./palette-mapping-import-loading"
import { useImportableDashboards } from "./use-importable-dashboards"
import "./palette-mapping-import.scss"

export const PaletteMappingImport = ({
  setImportMapping,
  table,
  column
}: {
  setImportMapping: (mapping: PaletteMapping) => void
  table?: string
  column?: string
}) => {
  const dispatch = useDispatch()
  const dashboards = useImportableDashboards()

  const dashboardsLoading = useSelector(
    (state: AppState) => state.dashboards.loading
  )
  const dashboardsLoaded = useSelector(
    (state: AppState) => state.dashboards.loaded
  )
  const dashboardsError = useSelector(
    (state: AppState) => state.dashboards.error
  )

  const selectedDashboardId = useSelector(
    (state: AppState) => state.sharedSettingsImport.selectedDashboardId
  )

  useEffect(() => {
    if (!dashboardsLoading && !dashboardsLoaded) {
      // Don't show full screen loading overlay
      dispatch(getDashboards({ hideLoadingOverlay: true }))
    }
  }, [dashboards, dashboardsLoaded, dashboardsLoading, dispatch])

  const [searchTerm, setSearchTerm] = useState("")

  const sortedFilteredDashboards = useMemo(
    () =>
      dashboards
        .filter((d) => {
          return searchTerm === ""
            ? true
            : d.dashboard_name.toLowerCase().includes(searchTerm.toLowerCase())
        })
        .sort((a, b) => a.dashboard_name.localeCompare(b.dashboard_name)),
    [dashboards, searchTerm]
  )

  if (!dashboards.length && dashboardsLoaded) {
    return <EmptyState description="No dashboards" />
  }

  if (dashboardsLoading) {
    return <PaletteMappingImportLoading />
  }

  if (dashboardsError) {
    return <EmptyState description="Could not load dashboards" />
  }

  const renderListItem = ({ key, style, index }: any) => {
    const dashboard = sortedFilteredDashboards[index]

    return (
      <Tooltip content={dashboard.dashboard_name} enterDelay={500} key={key}>
        <ListItem
          style={style}
          onClick={(e) => {
            dispatch(selectImportDashboard(dashboard.dashboard_id))
            // Keep menu open
            e.stopPropagation()
          }}
        >
          <span>{dashboard.dashboard_name}</span>
          <ListItemMeta icon="chevron_right" />
        </ListItem>
      </Tooltip>
    )
  }

  return (
    <section className="palette-mapping-import">
      {selectedDashboardId ? (
        <PaletteMappingImportList
          setImportMapping={setImportMapping}
          table={table}
          column={column}
        />
      ) : (
        <>
          <TextField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            label="Search dashboards"
          />
          <List
            rowRenderer={renderListItem}
            width={300}
            height={300}
            rowCount={sortedFilteredDashboards.length}
            rowHeight={48}
          />
        </>
      )}
    </section>
  )
}
