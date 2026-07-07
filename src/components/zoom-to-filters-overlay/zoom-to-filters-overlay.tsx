// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Tooltip } from "@rmwc/tooltip"
import * as RasterChartActions from "charts/raster-chart/raster-chart-actions"
import { IconTarget } from "components/svg-icons/icon-target"
import { IconUndo } from "components/svg-icons/icon-undo"
import "./zoom-to-filters-overlay.scss"

interface IZoomToFiltersOverlayProps {
  chartId: number
}

export const ZoomToFiltersOverlay: FC<IZoomToFiltersOverlayProps> = ({
  chartId
}) => {
  const dispatch = useDispatch()
  const previousBounds = useSelector(
    ({ charts }: any) => charts[chartId]?.previousMapZoomCenter
  )

  const zoomToFilters = (): void => {
    dispatch(RasterChartActions.updateChartBoundsFromCurrentFilters(chartId))
  }

  const undoZoom = (): void => {
    dispatch(RasterChartActions.restoreChartsPreviousBound(chartId))
  }

  return (
    <div className="ztf-overlay">
      <div className="ztf-overlay-container">
        {previousBounds && (
          <Tooltip content="Undo zoom" enterDelay={300}>
            <div className="undo-zoom" onClick={undoZoom}>
              <IconUndo width="14" height="14" />
            </div>
          </Tooltip>
        )}
        <Tooltip content="Zoom to filters" enterDelay={300}>
          <div className="ztf-button" onClick={zoomToFilters}>
            <IconTarget width="16" height="16" />
          </div>
        </Tooltip>
      </div>
    </div>
  )
}
