// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { batch } from "react-redux"
import pushid from "pushid"
import {
  ADD_PARAMETER_DASHBOARD_WIDGET,
  REMOVE_PARAMETER_DASHBOARD_WIDGET
} from "components/parameters/constants"
import {
  _right,
  calculateGridStates,
  pxToGridUnits
} from "components/dashboard/dashboard-helpers"
import {
  PARAMETER_WIDGET_DIMENSIONS_IN_PX,
  NUM_COLS,
  NUM_VISIBLE_ROWS,
  OFFSET,
  PARAMETER_WIDGET_DEFAULT_WIDTH_GRID_UNITS
} from "components/dashboard/dashboard-grid-constants"
import { updateLayout } from "actions/dashboard-layout-action-creators"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"
import {
  getParameterSetIdForSelectedTab,
  makeParameterIsVisibleInPanel
} from "components/parameters/selectors"
import { removeParameterValue } from "components/parameters/actions"

const parameterDimensionsToDataGrid = (
  id,
  dimensionsInPx,
  colWidth,
  rowHeight
) => {
  const parameterWidgetHeightGridUnits = pxToGridUnits(
    dimensionsInPx.h,
    rowHeight
  )

  const parameterWidgetMinWidthGridUnits = pxToGridUnits(
    dimensionsInPx.minW,
    colWidth
  )

  return {
    x: 0,
    y: 0,
    h: parameterWidgetHeightGridUnits,
    // Parameter widgets have a fixed height
    minH: parameterWidgetHeightGridUnits,
    maxH: parameterWidgetHeightGridUnits,
    minW: parameterWidgetMinWidthGridUnits,
    w: PARAMETER_WIDGET_DEFAULT_WIDTH_GRID_UNITS,
    i: id
  }
}

// Adds parameter widget to the top left of the dashboard layout, shifting down anything underneath.
export const addParameterToLayout = (parameterDataGrid, layout) => {
  const originalIndices = {}
  layout.forEach((l, i) => {
    originalIndices[l.i] = i
  })

  const newLayout = layout.slice()

  // Anything left of this column needs to be shifted down
  let maxShiftColumn = parameterDataGrid.w

  layout
    .slice()
    .sort((a, b) => a.y - b.y)
    .forEach((dataGrid) => {
      if (dataGrid.x < maxShiftColumn) {
        // Handles the case where a wide chart is pushed down, then pushes down all columns beneath it.
        maxShiftColumn = Math.max(maxShiftColumn, _right(dataGrid))
        newLayout[originalIndices[dataGrid.i]] = {
          ...dataGrid,
          y: dataGrid.y + parameterDataGrid.h
        }
      }
    })

  return [...newLayout, parameterDataGrid]
}

export const addParameterDashboardWidget = (parameterName) => (
  dispatch,
  getState
) => {
  const id = pushid()
  const { layout } = getState().dashboard
  const { colWidth, rowHeight } = calculateGridStates(
    window.innerHeight,
    window.innerWidth,
    NUM_COLS,
    OFFSET,
    NUM_VISIBLE_ROWS
  )

  const parameterDataGrid = parameterDimensionsToDataGrid(
    id,
    PARAMETER_WIDGET_DIMENSIONS_IN_PX,
    colWidth,
    rowHeight
  )

  const newLayout = addParameterToLayout(parameterDataGrid, layout)

  batch(() => {
    dispatch(updateLayout(newLayout))

    dispatch({
      type: ADD_PARAMETER_DASHBOARD_WIDGET,
      parameterName,
      id
    })

    dispatch(updateDashboardSaveState(true))
  })
}

export const removeParameterDashboardWidget = (id) => (dispatch, getState) => {
  // If this is the only place a parameter exists on a tab, remove it from the
  // parameter set for the tab
  const { parameterContainers } = getState().dashboard
  const parameterId = parameterContainers.find((pc) => pc.id === id)
    .parameterName
  const hasOtherDashboardWidgets = parameterContainers.some(
    (pc) => pc.parameterName === parameterId && pc.id !== id
  )
  const hasPanelWidget = makeParameterIsVisibleInPanel(getState())(parameterId)

  dispatch({
    type: REMOVE_PARAMETER_DASHBOARD_WIDGET,
    id
  })

  if (!hasPanelWidget && !hasOtherDashboardWidgets) {
    dispatch(
      removeParameterValue(
        parameterId,
        getParameterSetIdForSelectedTab(getState())
      )
    )
  }
}
