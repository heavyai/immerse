// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import DataSourceSelector from "components/data-source-selector/data-source-selector"
import DimensionSelectorsContainerParent from "components/dimension-selectors-container/dimension-selectors-container-parent"
import MeasureSelectorsContainerParent from "components/measure-selectors-container/measure-selectors-container-parent"
import PostFilterSelectorsContainerParent from "components/post-filter/post-filter-selectors-parent"
import PreFilterComponent from "vega/components/PreFilter/PreFilter"

export function HeavyChartingSelectionPanel({
  chart,
  id,
  tablePreview,
  actions,
  isPostFilterHavingSupported,
  layerPostFilter,
  supportsChartSpecificFilters,
  isMultiLayer,
  isPolyRasterEnabled,
  shouldShowAddNewDataSourceButton
}) {
  return (
    <div>
      <div className="data-selector-container">
        <div>
          <div className="chart-editor-label">{"Sources"}</div>
          <div className="chart-editor-section">
            {chart.type === "text" || chart.type === "text2" ? (
              <div className="not-available">None Required</div>
            ) : (
              <DataSourceSelector
                chartId={id}
                dataSource={tablePreview || chart.dataSource}
              />
            )}
          </div>
        </div>
        <div className="chart-editor-label">{"Dimensions"}</div>
        <DimensionSelectorsContainerParent
          chartId={id}
          chartType={chart.type}
          dataSource={chart.dataSource}
          selectors={chart.dimensions}
          type="dimensions"
        />
        {isPostFilterHavingSupported && layerPostFilter && (
          <div>
            <div className="chart-editor-label">{"Filter on aggregate"}</div>
            <PostFilterSelectorsContainerParent
              chartId={id}
              dataSource={chart.dataSource}
              selectors={layerPostFilter}
              type="postFilters"
            />
          </div>
        )}
        <div className="chart-editor-label">{"Measures"}</div>
        <MeasureSelectorsContainerParent
          chartId={id}
          dataSource={chart.dataSource}
          selectors={chart.measures}
          type="measures"
        />
      </div>
      {supportsChartSpecificFilters && (
        <div className="chart-specific-filters-wrapper">
          <PreFilterComponent
            chartId={id}
            layerId={
              isMultiLayer(chart, isPolyRasterEnabled)
                ? chart.currentLayer || 0
                : undefined
            }
            dataSource={chart.dataSource}
          />
        </div>
      )}
      <div className="data-selector-container">
        <div className="data-source-selector">
          {shouldShowAddNewDataSourceButton && (
            <button
              className={"button add-source multisource"}
              onClick={actions.onEnterMultiSourceMode}
              data-testid="add-data-source-button"
            >
              {"+ Add Layer"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
