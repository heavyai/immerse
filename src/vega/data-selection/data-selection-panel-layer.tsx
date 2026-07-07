// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// This component replaces the left side of the current chart editor --
// the chart's data selection (source, dimension, measure, and related)

import React, { FC, MouseEventHandler, useState, useEffect } from "react"

import { enhanceColumnMetadata } from "services/ImmerseCrossFilter/utils"

import ChartSourceSelector from "vega/components/SourceSelector/ChartSourceSelector"
import PreFilterComponent from "vega/components/PreFilter/PreFilter"
import TimeComparisonComponent from "vega/components/TimeComparison/TimeComparison"
import {
  ComboDataSelection,
  TIME_LAG_EXPRESSION_TYPE
} from "vega/constants/data-selection-types"
import { AppState } from "vega/charts/types"

import DimensionSelector from "./dimension-selector"
import MeasureSelector from "./measure-selector"

import "./styles.scss"
import { useJoinFromParameter } from "components/join-manager/use-join-from-parameter"
import {
  DataSelectionPanelFeatures,
  DEFAULT_SUPPORTED_FEATURES
} from "./constants"

interface Props {
  chartId: string
  dataSelection: ComboDataSelection
  columnMetadata: AppState["dashboard"]["dataSources"]
  tablePreview: string
  actions: {
    onSelectTable: (table: string, layerId: string) => void
    onClearTable: (layerId: string) => void
    // TODO: Types from actions themselves
    addDataSelection: (chartId: string) => void
    removeDataSelection: (chartId: string, layerId: string) => void
    setSelectedDataSelection: (chartId: string, layerId: string) => void
  }
  // What features within the data selection panel should be shown/supported
  supportedFeatures?: DataSelectionPanelFeatures
}

const VegaDataSelectionPanelLayer: FC<Props> = ({
  chartId,
  dataSelection,
  columnMetadata,
  actions,
  supportedFeatures = DEFAULT_SUPPORTED_FEATURES
}) => {
  const {
    multiBaseDimension,
    groupByDimension,
    multiBaseMeasure,
    colorByMeasure
  } = supportedFeatures

  const { layerId, table, dimensions, measures } = dataSelection

  const [
    transientDimensionSelectorVisible,
    setTransientDimensionSelectorVisible
  ] = useState(false)
  const [
    transientMeasureSelectorVisible,
    setTransientMeasureSelectorVisible
  ] = useState(false)

  useEffect(() => {
    setTransientDimensionSelectorVisible(false)
  }, [dimensions])

  useEffect(() => {
    setTransientMeasureSelectorVisible(false)
  }, [measures])

  const dataSourceName = table ? table.name : ""
  const joinDataSource = useJoinFromParameter(dataSourceName)
  const displayName = joinDataSource?.name ?? dataSourceName
  const columns = enhanceColumnMetadata(
    columnMetadata[dataSourceName]?.columnMetadata || [],
    dataSourceName
  )
  const isDisabled = columns.length === 0

  const onSelectTable = (newTable: string) => {
    actions.onSelectTable(newTable, layerId)
  }

  const onClearTable = () => {
    actions.onClearTable(layerId)
  }

  const addBaseDimension: MouseEventHandler = (event) => {
    event.preventDefault()
    setTransientDimensionSelectorVisible(true)
  }

  const addSizeMeasure: MouseEventHandler = (event) => {
    event.preventDefault()
    setTransientMeasureSelectorVisible(true)
  }

  return (
    <div>
      <div className="source-container">
        <div className="chart-editor-label">Source *</div>
        <div className="chart-editor-section">
          <ChartSourceSelector
            chartId={chartId}
            layerId={layerId}
            selectedTable={displayName}
            onChange={onSelectTable}
            onClear={onClearTable}
            required
          />
        </div>
      </div>
      <div className="chart-editor-section-header">
        <div className="chart-editor-label">Dimensions</div>
      </div>
      <div className="dimensions-container chart-editor-section">
        {dimensions.xAxis.length === 0 ? (
          <DimensionSelector
            chartId={chartId}
            layerId={layerId}
            dimensionName="xAxis"
            dimensionIndex={0}
            required
            disabled={isDisabled}
          />
        ) : (
          dimensions.xAxis.map((_, dimensionIndex) => (
            <DimensionSelector
              key={dimensionIndex}
              chartId={chartId}
              layerId={layerId}
              dimensionName="xAxis"
              dimensionIndex={dimensionIndex}
              required={dimensionIndex === 0}
              disabled={isDisabled}
            />
          ))
        )}
        {transientDimensionSelectorVisible && (
          <DimensionSelector
            chartId={chartId}
            layerId={layerId}
            dimensionName="xAxis"
            dimensionIndex={dimensions.xAxis.length}
            disabled={isDisabled}
          />
        )}
        {dimensions.xAxis.length > 0 && multiBaseDimension && (
          <div
            className="chart-editor-add-selector-button"
            data-testid="chart-editor-add-base-dimension-button"
            onClick={addBaseDimension}
          >
            <div className="chart-editor-add-selector-button-icon">
              + Add base dimension
            </div>
          </div>
        )}
        {groupByDimension && (
          <DimensionSelector
            chartId={chartId}
            layerId={layerId}
            dimensionName="color"
            dimensionIndex={null}
            disabled={Boolean(measures.size.length > 1) || isDisabled}
          />
        )}
      </div>
      <div className="chart-editor-section-header">
        <div className="chart-editor-label">Measures</div>
      </div>
      <div className="measures-container chart-editor-section">
        {measures.size.length === 0 ? (
          <MeasureSelector
            chartId={chartId}
            layerId={layerId}
            measureName="size"
            measureIndex={0}
            required
            disabled={isDisabled}
          />
        ) : (
          measures.size.map(({ type }, measureIndex) =>
            type !== TIME_LAG_EXPRESSION_TYPE ? (
              <MeasureSelector
                key={measureIndex}
                chartId={chartId}
                layerId={layerId}
                measureName="size"
                measureIndex={measureIndex}
                required={measureIndex === 0}
                disabled={isDisabled}
              />
            ) : null
          )
        )}
        {transientMeasureSelectorVisible && (
          <MeasureSelector
            chartId={chartId}
            layerId={layerId}
            measureName="size"
            measureIndex={measures.size.length}
            disabled={isDisabled}
          />
        )}
        {measures.size.length > 0 && !dimensions.color && multiBaseMeasure && (
          <div
            className="chart-editor-add-selector-button"
            data-testid="chart-editor-add-size-measure-button"
            onClick={addSizeMeasure}
          >
            <div className="chart-editor-add-selector-button-icon">
              + Add base measure
            </div>
          </div>
        )}
        {colorByMeasure && (
          <MeasureSelector
            chartId={chartId}
            layerId={layerId}
            measureName="color"
            measureIndex={null}
            disabled={isDisabled}
          />
        )}
      </div>
      <TimeComparisonComponent chartId={chartId} layerId={layerId} />
      <PreFilterComponent
        chartId={chartId}
        layerId={layerId}
        dataSource={dataSourceName}
        columns={columns}
      />
    </div>
  )
}

export default VegaDataSelectionPanelLayer
