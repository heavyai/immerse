// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as RasterActions from "charts/raster-chart/raster-chart-actions"
import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import CustomCheckbox from "components/custom-checkbox/custom-checkbox"
import cx from "classnames"
import makeDropAndDraggable from "components/selector-pill/make-drop-and-draggable"
import { getDisplayOrParameterName } from "utils/get-display-or-parameter-name"
import { isCrossSectionType } from "charts/raster-chart/cross-section/utils/is-cross-section-type"

const typeMap = { backendChoropleth: "choropleth" }

export function LayerPill({
  layerIdDisplay,
  toggleLayer,
  isDraggable = true,
  connectDragSource = (children) => children,
  connectDropTarget = (children) => children,
  isDragging,
  isOver,
  spec: { active = true, dataSource, type }
}) {
  return connectDropTarget(
    <div className={cx("selector-pill", { "is-over": isOver })}>
      <button className="button selector-label">
        {`Layer ${layerIdDisplay}`}
      </button>
      {connectDragSource(
        <div
          className={cx("drag-area", {
            "is-dragging": isDragging,
            "is-draggable": isDraggable
          })}
          style={{ width: "186px" }}
        >
          <div className="selector-agg">{typeMap[type] || type}</div>
          <div className="selector-box button">
            <span className="selector-label-ellipse">
              {getDisplayOrParameterName(dataSource)}
            </span>
          </div>
        </div>
      )}
      <CustomCheckbox checked={active} onChange={toggleLayer} />
    </div>
  )
}

const LayerPillDnD = makeDropAndDraggable(LayerPill)

LayerPillDnD.propTypes = {
  index: PropTypes.number.isRequired,
  layerIdDisplay: PropTypes.number.isRequired,
  spec: PropTypes.shape({
    active: PropTypes.bool,
    dataSource: PropTypes.string.isRequired
  }),
  swapSelectors: PropTypes.func.isRequired,
  toggleLayer: PropTypes.func.isRequired
}

const isDraggable = (layerSpec) => {
  // Cross section types are not draggable, everything else is
  return !isCrossSectionType(layerSpec.type)
}
export function LayerSelectors({ layers, toggleLayer, swapSelectors }) {
  return (
    <div className="layer-selectors chart-editor-section">
      <div className="chart-editor-label">{"Layers Order"}</div>
      {layers.map((layerSpec, i) => {
        const layerIsDraggable = isDraggable(layerSpec)
        const LayerPillComponent = layerIsDraggable ? LayerPillDnD : LayerPill
        return (
          <LayerPillComponent
            index={i}
            key={i}
            layerIdDisplay={i + 1}
            selectorType={"layers"}
            spec={layerSpec}
            swapSelectors={swapSelectors}
            toggleLayer={toggleLayer(i)}
            isDraggable={layerIsDraggable}
          />
        )
      })}
    </div>
  )
}

LayerSelectors.propTypes = {
  layers: PropTypes.arrayOf(
    PropTypes.shape({
      active: PropTypes.bool,
      dataSource: PropTypes.string.isRequired
    })
  ),
  swapSelectors: PropTypes.func.isRequired,
  toggleLayer: PropTypes.func.isRequired
}

function mapStateToProps({ charts }, { id }) {
  const layers = charts[id].layers
  return {
    layers,
    chart: charts[id],
    chartId: id
  }
}

function mapDispatchToProps(dispatch, { id }) {
  return {
    toggleLayer: (layerId) => () => {
      dispatch(RasterActions.toggleRasterLayer(id, layerId))
      dispatch(RasterActions.combineRasterLayers(id, layerId))
    },
    swapSelectors: (source, target) => {
      if (source !== target) {
        dispatch(RasterActions.swapLayers(id, source, target))
      }
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LayerSelectors)
