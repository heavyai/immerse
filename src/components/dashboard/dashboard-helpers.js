// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-underscore-dangle */

import { compose, curry, range } from "ramda"
import { RESTRICTED_SHARING_ROLE } from "constants/dashboards"
import {
  NUM_DASHBOARD_COLUMNS,
  SUBROWS_PER_VISIBLE_ROW
} from "constants/magic-variables"
import { CHARTS } from "constants/charts"
import {
  getMinHeight,
  getMinWidth
} from "components/dashboard/dashboard-grid-constants"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"

export const getMinRowHeight = () =>
  getFeatureFlag(available_feature_flags.MINIMIZE_CHART_SIZE) ? 12 : 32
const MIN_SCREEN_WIDTH = 1024
const DEFAULT_DASHBOARD_ITEM_HEIGHT_GRID_UNITS = 10

export function _bottom(widget) {
  return widget.y + widget.h
}

export function _right(widget) {
  return widget.x + widget.w
}

export function _calculateW(cols, chartColumns) {
  return cols / chartColumns
}

export function _calculateGridDimensions(layout, cols) {
  const w = _calculateW(cols, NUM_DASHBOARD_COLUMNS)
  return [
    cols,
    layout.reduce((h, el) => (_bottom(el) > h ? _bottom(el) : h), 0) + w
  ]
}

export function _generateEmptyGrid(dimensions) {
  const cols = dimensions[0]
  const rows = dimensions[1]
  return range(0, rows).map(() => range(0, cols).map(() => 0))
}

function generatePopulatedGrid(populated) {
  return (el) => {
    const topCoord = el.y
    const leftCoord = el.x
    range(0, _bottom(el))
      .slice(topCoord)
      .forEach((i) => {
        range(0, _right(el))
          .slice(leftCoord)
          .forEach((j) => {
            populated[i][j] = 1
          })
      })
  }
}

export const _populateGrid = curry((layout, emptyGrid) => {
  const populated = emptyGrid.slice()
  layout.forEach(generatePopulatedGrid(populated))
  return populated
})

// HELPERS
export const pxToGridUnits = (px, gridSize) => Math.ceil(px / gridSize)

export const getChartMinHeight = (chartType, rowHeight) => {
  const minHeightInPx = CHARTS[chartType]?.minHeight || getMinHeight()
  return Math.ceil(minHeightInPx / rowHeight)
}

export const getChartMinWidth = (chartType, colWidth) => {
  const minWidthInPx = CHARTS[chartType]?.minWidth || getMinWidth()
  return Math.ceil(minWidthInPx / colWidth)
}

/**
 * Calculates grid layout when a new chart is added to grid. Returns the dataGrid
 * for the newly added item.
 * @param layout Existing layout (before item was added)
 * @param cols Number of columns in grid
 * @param rowHeight Height in px of grid row
 * @param colWidth Width in px of grid column
 * @param id Unique id for item to be inserted into layout container
 */
export function findInsertionSpot(
  layout,
  cols,
  rowHeight,
  colWidth,
  id,
  chartType
) {
  const chartWidth = _calculateW(cols, NUM_DASHBOARD_COLUMNS)
  const chartHeight = DEFAULT_DASHBOARD_ITEM_HEIGHT_GRID_UNITS
  const minH = getChartMinHeight(chartType, rowHeight)
  const minW = getChartMinWidth(chartType, colWidth)
  const chart = { h: chartHeight, w: chartWidth, i: id, minH, minW }

  let spot = {}
  if (layout.length) {
    const grid = compose(
      _populateGrid(layout),
      _generateEmptyGrid,
      _calculateGridDimensions
    )(layout, cols)
    const numRows = grid.length
    let nextRow = false
    for (let r = 0; r < numRows; r = r + 1) {
      const columnsInRow = grid[r].length
      for (let c = 0; c < columnsInRow; c = c + 1) {
        nextRow = false
        for (let testr = r; testr < r + chartWidth; testr = testr + 1) {
          for (let testc = c; testc < c + chartWidth; testc = testc + 1) {
            if (grid[testr][testc] === 1 || testc >= cols) {
              nextRow = true
              break
            }
          }
          if (nextRow) {
            break
          }
        }
        if (!nextRow) {
          spot = { y: r, x: c, ...chart }
          break
        }
      }
      if (!nextRow) {
        break
      }
    }
  } else {
    spot = { y: 0, x: 0, ...chart }
  }
  return spot
}

export function calculateGridStates(
  innerHeight,
  innerWidth,
  cols,
  offset,
  numVisibleRows
) {
  const nonGridHeight = innerHeight - offset
  const rowHeight = Math.round(
    nonGridHeight / (numVisibleRows * SUBROWS_PER_VISIBLE_ROW)
  )

  return {
    rowHeight: Math.max(rowHeight, getMinRowHeight()),
    colWidth: Math.max(innerWidth, MIN_SCREEN_WIDTH) / cols
  }
}

export const isSharingRestricted = ({ isSuperuser, roles, user }) =>
  !isSuperuser &&
  roles.includes(user.restrictedSharingRole || RESTRICTED_SHARING_ROLE)
