// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import MultiSourceSelectors from "components/multi-source-selectors/multi-source-selectors"
import { HeavyChartingSelectionPanel } from "./heavy-charting-data-selection-panel"

export function LegacyChartingDataSelectionPanel({
  actions,
  chart,
  id,
  isPolyRasterEnabled,
  shouldShowAddNewDataSourceButton,
  tablePreview,
  uiMultiSourceModeEnabled,
  isPostFilterHavingSupported,
  layerPostFilter,
  supportsChartSpecificFilters,
  isMultiLayer
}) {
  return uiMultiSourceModeEnabled ? (
    <MultiSourceSelectors
      chartId={id}
      chartType={chart.type}
      dimensions={chart.dimensions}
      measures={chart.measures}
      multiSources={chart.multiSources}
      onAddMultiSource={actions.onAddMultiSource}
      onDeleteMultiSource={actions.onDeleteMultiSource}
      onHidePreview={actions.onHidePreview}
      shouldShowAddNewDataSourceButton={shouldShowAddNewDataSourceButton}
    />
  ) : (
    <HeavyChartingSelectionPanel
      isPostFilterHavingSupported={isPostFilterHavingSupported}
      layerPostFilter={layerPostFilter}
      supportsChartSpecificFilters={supportsChartSpecificFilters}
      id={id}
      chart={chart}
      tablePreview={tablePreview}
      actions={actions}
      isMultiLayer={isMultiLayer}
      isPolyRasterEnabled={isPolyRasterEnabled}
      shouldShowAddNewDataSourceButton={shouldShowAddNewDataSourceButton}
    />
  )
}
