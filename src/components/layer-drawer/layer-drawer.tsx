// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import cx from "classnames"
import { Tooltip } from "@rmwc/tooltip"
import Services from "services/immerse"
import * as RasterActions from "charts/raster-chart/raster-chart-actions"
import { updateGeoHeatChart } from "charts/raster-chart/geoheat-actions"
import { updateChart } from "actions/update-chart-action-creator"
import { isCrossSectionType } from "charts/raster-chart/cross-section/utils/is-cross-section-type"
import makeDropAndDraggable from "components/selector-pill/make-drop-and-draggable"
import { LayerState } from "charts/raster-chart/raster-chart-types"
import Drawer from "components/drawer/drawer"
import LayerIcon from "components/svg-icons/icon-layers"
import SlantedPinIcon from "components/svg-icons/icon-pin-slanted"
import { LayerTile } from "./layer-tile"
import "./layer-drawer.scss"

interface ILayerDrawerProps {
  chartId: number
  dcFlag: string
  layers: LayerState[]
  containerWidth: number
}

const LayerTileDnD = makeDropAndDraggable(LayerTile)

export const LayerDrawer: FC<ILayerDrawerProps> = ({
  chartId,
  dcFlag,
  layers,
  containerWidth
}) => {
  const dispatch = useDispatch()
  const currentZoomLevel = useSelector(
    ({ charts }: any) => charts[chartId]?.mapZoomCenter?.zoom
  )
  const drawerRef = useRef(null)

  const RasterChart = Services.get("dc").getChart(dcFlag)

  const layerVisibilityCounts = (visible: boolean): number =>
    layers.filter((l) => l.active === visible).length

  const [isExpanded, setIsExpanded] = useState(
    new Array(layers.length).fill(false)
  )
  const [isPinned, setIsPinned] = useState(false)
  const [visibleCount, setVisibleCount] = useState(layerVisibilityCounts(true))
  const [hiddenCount, setHiddenCount] = useState(layerVisibilityCounts(false))

  const updateChartWidth = (w: number): void => {
    dispatch(updateGeoHeatChart(chartId.toString(), { width: w }))
    dispatch(updateChart(chartId, { width: w }))
  }

  const toggleDrawer = (open: boolean): void => {
    // reset chart width and force re-size on drawer close
    // if pinned, this is necessary for chart to re-fill container
    // if not pinned, this fixes occasional bug where mapbox chart
    // sometimes has gray box where drawer used to be by forcing re-render
    if (!open) {
      if (isPinned) {
        setIsPinned(false)
      } else {
        RasterChart.overlayDrawerOpen(false)
      }
      RasterChart.forceResize(true)
      updateChartWidth(containerWidth)
    } else {
      RasterChart.overlayDrawerOpen(true)
    }
  }

  const pinDrawer = (): void => {
    if (!isPinned) {
      setIsPinned(true)
      RasterChart.overlayDrawerOpen(false)
      const drawerWidth = drawerRef?.current?.offsetWidth ?? 0
      updateChartWidth(containerWidth - drawerWidth)
    } else {
      setIsPinned(false)
      RasterChart.overlayDrawerOpen(true)
      RasterChart.forceResize(true)
      updateChartWidth(containerWidth)
    }
  }

  const handleTileExpansion = (index: number, val: boolean): void => {
    const updatedState = [...isExpanded]
    updatedState[index] = val
    setIsExpanded(updatedState)
  }

  const toggleLayer = (layerId: number): void => {
    dispatch(RasterActions.toggleRasterLayer(chartId, layerId))
    dispatch(RasterActions.combineRasterLayers(chartId))
    setVisibleCount(layerVisibilityCounts(true))
    setHiddenCount(layerVisibilityCounts(false))
  }

  const swapSelectors = (source: number, target: number): void => {
    if (source !== target) {
      dispatch(RasterActions.swapLayers(chartId, source, target))
    }
  }

  const isDraggable = (layerSpec: LayerState): boolean => {
    return !isCrossSectionType(layerSpec.type)
  }

  return (
    <Drawer
      className="layer-drawer"
      position="right"
      drawerOpen={false}
      tabIcon={<LayerIcon className="layer-icon" />}
      tabTooltip="Layers"
      toggleDrawerCallback={toggleDrawer}
    >
      <div
        className={cx("drawer__content", {
          "is-pinned": isPinned
        })}
        ref={drawerRef}
      >
        <div className="drawer__header">
          <div className="drawer__title">
            <div>LAYERS</div>
            <Tooltip
              content={isPinned ? "Unpin layer drawer" : "Pin layer drawer"}
              enterDelay={300}
            >
              <div className="pin-icon" onClick={pinDrawer}>
                <SlantedPinIcon />
              </div>
            </Tooltip>
          </div>
          <div className="layer-info">
            <p>
              {visibleCount} visible ({hiddenCount} hidden) • Current zoom
              level: {currentZoomLevel.toFixed(2)}
            </p>
          </div>
        </div>
        <div>
          {layers.map((layerSpec: LayerState, i: number) => {
            const layerIsDraggable = isDraggable(layerSpec)
            const LayerTileComponent = layerIsDraggable
              ? LayerTileDnD
              : LayerTile
            return (
              <LayerTileComponent
                chartId={chartId}
                index={i}
                key={i}
                layer={layerSpec}
                layers={layers}
                layerIdDisplay={i + 1}
                isExpanded={isExpanded[i]}
                onExpandChange={(val: boolean) => handleTileExpansion(i, val)}
                selectorType={"layers"}
                swapSelectors={swapSelectors}
                toggleLayer={() => toggleLayer(i)}
              />
            )
          })}
        </div>
      </div>
    </Drawer>
  )
}
