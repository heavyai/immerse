// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { Icon } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"
import { clearImportDashboardId } from "actions/shared-settings-import-action-creators"
import { AppState } from "vega/charts/types"
import "./palette-mapping-import-header.scss"

// Nav header; replaces tabs when importing from dashboard
export const PaletteMappingImportHeader = ({
  dashboardId
}: {
  dashboardId: string
}) => {
  const dispatch = useDispatch()

  const importDashboardName = useSelector(
    (state: AppState) =>
      state.dashboards.list.find((d) => d.dashboard_id === dashboardId)
        ?.dashboard_name
  )

  return (
    <>
      <div
        className="palette-mapping-import-header__action"
        onClick={() => dispatch(clearImportDashboardId())}
      >
        <Icon icon="chevron_left" />
        Back
      </div>
      <Tooltip content={importDashboardName}>
        <h2 className="palette-mapping-import-header__dashboard">{`/${importDashboardName}`}</h2>
      </Tooltip>
    </>
  )
}
