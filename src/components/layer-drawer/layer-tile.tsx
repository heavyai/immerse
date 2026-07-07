// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useRef, useEffect } from "react"
import { useDispatch } from "react-redux"
import cx from "classnames"
import { Tooltip } from "@rmwc/tooltip"
import { getDisplayOrParameterName } from "utils/get-display-or-parameter-name"
import { LayerState } from "charts/raster-chart/raster-chart-types"
import {
  updateLayerBoundsFromCurrentFilters,
  setLayerLabel
} from "charts/raster-chart/raster-chart-actions"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"

import { GripIcon } from "components/svg-icons/icon-grip"
import { ChevronDownIcon } from "components/svg-icons/icon-chevron-down"
import { ChevronUpIcon } from "components/svg-icons/icon-chevron-up"
import { EyeIcon } from "components/svg-icons/icon-eye"
import { EyeDisabledIcon } from "components/svg-icons/icon-eye-disabled"
import { IconTarget } from "components/svg-icons/icon-target"
import { LayerTileSettings } from "./layer-tile-settings"

interface ILayerTileProps {
  chartId: number
  index: number
  layer: LayerState
  layers: LayerState[]
  layerIdDisplay: number
  toggleLayer: (index?: number) => void
  isDraggable?: boolean
  connectDragSource?: (children: React.ReactNode) => React.ReactNode
  connectDropTarget?: (children: React.ReactNode) => React.ReactNode
  isDragging: boolean
  isOver: boolean
  swapSelectors?: (source: number, target: number) => void
  isExpanded: boolean
  onExpandChange: (val: boolean) => void
}

const buildDefaultLayerLabel = (layerIdDisplay: number) =>
  `Layer ${layerIdDisplay}`

export const LayerTile: React.FC<ILayerTileProps> = ({
  chartId,
  index,
  layer,
  layers,
  layerIdDisplay,
  toggleLayer,
  isDraggable = true,
  connectDragSource = (children) => children,
  connectDropTarget = (children) => children,
  isDragging,
  isOver,
  isExpanded,
  onExpandChange
}) => {
  const dispatch = useDispatch()
  const labelInputRef = useRef<HTMLInputElement>(null)
  const labelDisplayRef = useRef<HTMLSpanElement | null>(null)

  const [disabled, setDisabled] = useState(!layer?.active)
  const [label, setLabel] = useState(
    layer?.labelText ?? buildDefaultLayerLabel(layerIdDisplay)
  )
  const [previousLabel, setPreviousLabel] = useState(label)
  const [layerEditingError, setLayerEditingError] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    // Resync label states when layers are reordered
    const syncedLabel =
      layer.labelText ?? buildDefaultLayerLabel(layerIdDisplay)
    setLabel(syncedLabel)
    setPreviousLabel(syncedLabel)
  }, [layer.labelText, layerIdDisplay])

  const markDashboardUnsaved = (): void => {
    dispatch(updateDashboardSaveState())
  }

  const updateLayerLabel = (): void => {
    const otherLayers = layers.filter((_, i) => i !== index)
    if (label === "") {
      setLayerEditingError("The layer name cannot be blank")
    } else if (otherLayers.some((l) => l.labelText === label.trim())) {
      setLayerEditingError("The layer name must be unique")
    } else {
      setPreviousLabel(label)
      dispatch(setLayerLabel(chartId, index, label))
      setIsFocused(false)
      setLayerEditingError("")
      markDashboardUnsaved()
    }
  }

  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === "Enter") {
      e.preventDefault()
      e.currentTarget.blur()
    } else if (e.key === "Escape") {
      e.preventDefault()
      setLabel(previousLabel)
      setIsFocused(false)
    }
  }

  const toggleLayerVisibility = (): void => {
    setDisabled(!disabled)
    toggleLayer()
  }

  const toggleSettings = (): void => {
    onExpandChange(!isExpanded)
  }

  const zoomToFilters = (): void => {
    dispatch(updateLayerBoundsFromCurrentFilters(chartId, index))
  }

  return connectDropTarget(
    <div
      className={cx("layer-tile", {
        "is-over": isOver,
        "is-disabled": disabled
      })}
    >
      <div className="layer-tile-container">
        {!disabled ? (
          connectDragSource(
            <div
              className={cx("drag-area", {
                "is-dragging": isDragging,
                "is-draggable": isDraggable
              })}
            >
              <GripIcon className="grip-icon" height="16" />
            </div>
          )
        ) : (
          <div className="drag-area btn-disabled">
            <GripIcon className="grip-icon" height="16" />
          </div>
        )}

        <div
          className={cx("visibility-btn hover-btns", {
            "not-visible": isExpanded
          })}
        >
          <Tooltip
            content={layer.active ? "Disable layer" : "Enable layer"}
            enterDelay={300}
          >
            <div
              className="layer-tile-btn-wrapper"
              onClick={toggleLayerVisibility}
            >
              {layer.active ? (
                <EyeIcon defaultFill={false} />
              ) : (
                <EyeDisabledIcon />
              )}
            </div>
          </Tooltip>
        </div>

        <div className="layer-tile-text">
          <div className="layer-text-content">
            <div
              className={cx("layer-label-edit", {
                "is-focused": isFocused
              })}
            >
              <Tooltip
                content={layerEditingError}
                open={layerEditingError !== ""}
                showArrow
                align="bottom"
                activateOn="focus"
              >
                <input
                  type="text"
                  autoComplete="off"
                  value={label}
                  ref={labelInputRef}
                  className={cx("layer-label-input", {
                    "layer-label-input-error": layerEditingError !== ""
                  })}
                  onKeyDown={onKeyDown}
                  onBlur={updateLayerLabel}
                  onFocus={() => setIsFocused(true)}
                  onClick={(e) => e.currentTarget.focus()}
                  onChange={(e) => setLabel(e.currentTarget.value)}
                />
              </Tooltip>
              <span className="layer-label-display" ref={labelDisplayRef}>
                {label}
              </span>
            </div>
            <div className="layer-source">
              {getDisplayOrParameterName(layer.dataSource)}
            </div>
          </div>
        </div>

        <div className="right-align-wrapper">
          <div className="zoom-btn hover-btns">
            <Tooltip content="Zoom to layer" enterDelay={300}>
              <div
                className={cx("layer-tile-btn-wrapper", {
                  "btn-disabled": disabled
                })}
                onClick={!disabled ? zoomToFilters : undefined}
              >
                <IconTarget width="16" height="16" />
              </div>
            </Tooltip>
          </div>

          <div className="expand-btn">
            <div
              className={cx("layer-tile-btn-wrapper", {
                "btn-disabled": disabled
              })}
              onClick={!disabled ? toggleSettings : undefined}
            >
              {isExpanded ? (
                <ChevronUpIcon
                  className="expand-icon"
                  width={14}
                  height={10}
                  defaultFill={false}
                />
              ) : (
                <ChevronDownIcon className="expand-icon" />
              )}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <LayerTileSettings
          isExpanded={isExpanded}
          chartId={chartId}
          layer={layer}
          index={index}
        />
      )}
    </div>
  )
}
