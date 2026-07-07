// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// This component replaces the left side of the current chart editor --
// the chart's data selection (source, dimension, measure, and related)

import React, { FC } from "react"

import Accordion from "components/accordion/accordion"

import { ComboDataSelection } from "vega/constants/data-selection-types"
import { AppState } from "vega/charts/types"

import DataSelectionPanelLayer from "./data-selection-panel-layer"

import "./styles.scss"
import { findJoinDataSourceForParameter } from "components/join-manager/use-join-from-parameter"
import { useSelector } from "react-redux"
import {
  DataSelectionPanelFeatures,
  DEFAULT_SUPPORTED_FEATURES
} from "./constants"

interface Props {
  chartId: string
  dataSelections: ComboDataSelection[]
  columnMetadata: AppState["dashboard"]["dataSources"]
  selectedLayerId: string
  tablePreview: string
  actions: {
    onSelectTable: (chartId: string, layerId: string) => void
    onClearTable: (layerId: string) => void
    // TODO: Types from actions themselves
    addDataSelection: (chartId: string) => void
    removeDataSelection: (chartId: string, layerId: string) => void
    setSelectedDataSelection: (chartId: string, layerId: string) => void
  }
  supportedFeatures?: DataSelectionPanelFeatures
}

// TODO: Handle getDataSourcesList? In case vega combo is first- try editing

// TODO: Handle different chart types and selection specs - currently hardcoded to assume Vega Combo
const DataSelectionPanelComponent: FC<Props> = ({
  chartId,
  dataSelections,
  columnMetadata,
  selectedLayerId,
  tablePreview,
  actions,
  supportedFeatures
}) => {
  const addDataLayer = () => {
    actions.addDataSelection(chartId)
  }

  const defaultedSupportedFeatures = Object.assign(
    {},
    DEFAULT_SUPPORTED_FEATURES,
    supportedFeatures
  )

  // Only show +Add Layer button when the current layer satisfies the All Required State
  const currentLayerIndex = dataSelections ? dataSelections.length - 1 : 0
  const isCurrentLayerAllRequiredStateSatisfied =
    dataSelections &&
    dataSelections[currentLayerIndex].dimensions.xAxis.length > 0 &&
    dataSelections[currentLayerIndex].measures.size.length > 0

  const joinDataSources = useSelector((state) => state.joinDataSources)

  let selectedDataSelectionIndex = 0
  const layers = dataSelections.map((dataSelection, layerIndex) => {
    if (dataSelection.layerId === selectedLayerId) {
      selectedDataSelectionIndex = layerIndex
    }

    const onDeleteFold = () => {
      if (dataSelections.length > 1) {
        actions.removeDataSelection(chartId, dataSelection.layerId)
      }
    }

    const onSelectFold = () => {
      actions.setSelectedDataSelection(chartId, dataSelection.layerId)
    }

    // See if we have a join data source here, otherwise use the table name raw
    const displayName =
      findJoinDataSourceForParameter(dataSelection.table?.name, joinDataSources)
        ?.name ?? dataSelection.table?.name
    return {
      label: `Layer ${layerIndex + 1}${
        dataSelection.table ? ` - ${displayName}` : ""
      }`,
      onDeleteFold,
      onSelectFold,
      content: (
        <DataSelectionPanelLayer
          chartId={chartId}
          dataSelection={dataSelection}
          columnMetadata={columnMetadata}
          tablePreview={tablePreview}
          actions={actions}
          supportedFeatures={defaultedSupportedFeatures}
        />
      )
    }
  })

  return (
    <div className="vega-data-selection-accordion-wrapper">
      <Accordion
        contents={layers}
        CTALabel={"+ Add Layer"}
        CTAtestid={"add-data-layer-button"}
        currentlySelectedFold={selectedDataSelectionIndex}
        onCTAClick={addDataLayer}
        shouldShowCTA={isCurrentLayerAllRequiredStateSatisfied}
        testid="data-layer-accordion"
        isSingleLayer={dataSelections.length < 2}
        supportedFeatures={defaultedSupportedFeatures}
      />
    </div>
  )
}

export default DataSelectionPanelComponent
