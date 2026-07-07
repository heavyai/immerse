// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import MeasureSelectorsContainerParent from "components/measure-selectors-container/measure-selectors-container-parent"
import { DataSourceSelector } from "components/data-source-selector/data-source-selector"
import PreFilterComponent from "vega/components/PreFilter/PreFilter"
import { isMultiLayer } from "charts/raster-chart/raster-utils"
import cx from "classnames"

import LineSelect from "./line-select"
import { EndpointSelectorNames } from "./constants"
import { useDispatch } from "react-redux"
import { typeAliases } from "components/chart-type-button/chart-type-button-type-aliases"
import { updateChartType } from "actions/update-chart-type-action-creators"
import Icon from "components/icon/icon"
import { useCrossSectionTerrainEnabled } from "./hooks/use-cross-section-terrain-enabled"
import { CHART_DEFS, CHART_TYPES } from "constants/chart-types"
import { TooltipIfContent } from "components/tooltip-if-content/tooltip-if-content"
import "./styles.scss"

const getTypeAlias = (type) => typeAliases[type] ?? type

const CrossSectionDataSelectionPanel = ({ id, chart }) => {
  const dispatch = useDispatch()
  const terrainEnabled = useCrossSectionTerrainEnabled()
  const layers = chart.layers

  const subTypes = CHART_DEFS[chart.type].subTypes

  const subTypeEnabled = (type) => {
    // Only enable cross section terrain if we have an existing layer that is
    // a cross section layer
    if (type === CHART_TYPES.CROSS_SECTION_TERRAIN) {
      const firstLayerIsCrossSection =
        layers?.[0].type === CHART_TYPES.CROSS_SECTION &&
        chart.currentLayer === 1
      const onlyOneLayer = layers?.length === 1
      return firstLayerIsCrossSection || onlyOneLayer
    } else if (type === CHART_TYPES.CROSS_SECTION) {
      // Only available on the first tab, or if there are no layers established yet
      return chart?.currentLayer === 0 || !chart.hasOwnProperty("currentLayer")
    } else {
      return true
    }
  }

  const getTooltipForSubType = (subtype) => {
    if (
      // Currently creating a terrain chart, rendering the cross section button
      chart.type === CHART_TYPES.CROSS_SECTION_TERRAIN &&
      subtype === CHART_TYPES.CROSS_SECTION &&
      chart.layers?.length > 1
    ) {
      return "More than one cross section layer is not supported"
    } else if (
      // Currently creating a cross section chart, rendering the terrain button
      chart.type === CHART_TYPES.CROSS_SECTION &&
      subtype === CHART_TYPES.CROSS_SECTION_TERRAIN &&
      chart.layers?.length > 1
    ) {
      return "More than one terrain layer is not supported"
    }
    return null
  }

  return (
    <div className="cross-section-data-selection-panel">
      <div className="data-selector-container">
        {terrainEnabled && (
          <div className="subtype-btns">
            {subTypes.map((subtype) => (
              <TooltipIfContent
                content={getTooltipForSubType(subtype)}
                key={subtype}
              >
                <div
                  className={cx("chart-type-btn", "button", {
                    "chart-btn-selected": subtype === chart.type,
                    "chart-btn-disabled": !subTypeEnabled(subtype),
                    "chart-btn-enabled": subTypeEnabled(subtype)
                  })}
                  onClick={() => {
                    if (subTypeEnabled(subtype)) {
                      dispatch(updateChartType(id, subtype))
                    }
                  }}
                >
                  <Icon name={`chart-${subtype}`} />
                  <div className="chart-type-label">
                    {getTypeAlias(subtype)}
                  </div>
                </div>
              </TooltipIfContent>
            ))}
          </div>
        )}
        <div>
          <div className="chart-editor-label">{"Sources"}</div>
          <div className="chart-editor-section">
            <DataSourceSelector chartId={id} dataSource={chart.dataSource} />
          </div>
        </div>

        <div className="chart-editor-section">
          <div className="chart-editor-label">{"Sections"}</div>
          <LineSelect chartId={id} />
        </div>

        <div className="chart-editor-section">
          <div className="chart-editor-label">{"Measures"}</div>
          <MeasureSelectorsContainerParent
            chartId={id}
            dataSource={chart.dataSource}
            selectors={chart.measures.filter(
              (d) => !Object.values(EndpointSelectorNames).includes(d.name)
            )}
            type="measures"
          />
        </div>
      </div>
      <div className="chart-specific-filters-wrapper">
        <PreFilterComponent
          chartId={id}
          layerId={isMultiLayer(chart) ? chart.currentLayer || 0 : undefined}
          dataSource={chart.dataSource}
        />
      </div>
    </div>
  )
}

export default CrossSectionDataSelectionPanel
