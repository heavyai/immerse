// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from "react"
import { connect } from "react-redux"
import DataSourceSelector from "components/data-source-selector/data-source-selector"
import DimensionSelectorsContainerParent from "components/dimension-selectors-container/dimension-selectors-container-parent"
import MeasureSelectorsContainerParent from "components/measure-selectors-container/measure-selectors-container-parent"
import Accordion from "components/accordion/accordion"
import { selectMultiSourcePanel } from "actions/chart-editor-multisource-action-creators"
import PreFilterComponent from "vega/components/PreFilter/PreFilter"

type DataSource = {
  index: string | number
  table: string
}

interface MultiSourceSelectorsProps {
  chartId: string
  chartType: string
  multiSources: { [id: string]: DataSource }
  onAddMultiSource: () => void
  onDeleteMultiSource: (dataSourceIndex: number) => void
  onDropdownClose: React.EventHandler<React.SyntheticEvent>
  onHidePreview?: React.EventHandler<React.SyntheticEvent>
  shouldShowAddNewDataSourceButton: boolean
  selectMultiSourcePanel: (selectedFold: number) => void
  selectedMultiSourcePanel: number
  selectors: object[]
  setIsEditing: React.EventHandler<React.SyntheticEvent>
  tables: object[]
  dimensions: object[]
  measures: object[]
}

function mapStateToProps({ chartEditor: { selectedMultiSourcePanel } }) {
  return {
    selectedMultiSourcePanel
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    selectMultiSourcePanel(selectedMultiSourcePanel) {
      dispatch(selectMultiSourcePanel(selectedMultiSourcePanel))
    }
  }
}

const MultiSourceSelectors = (props: MultiSourceSelectorsProps) => {
  const multiSourceSelectors = Object.keys(props.multiSources)
    .map((element) => props.multiSources[element])
    .map(({ table, index }, idx) => ({
      label: `Source ${idx + 1}${table ? ` - ${table}` : ""}`,
      onDeleteFold: () => props.onDeleteMultiSource(Number(index)),
      onSelectFold: props.selectMultiSourcePanel,
      content: (
        <div key={index}>
          <div>
            <div className="chart-editor-section">
              <DataSourceSelector
                chartId={props.chartId}
                dataSource={table}
                multiSourceIndex={index}
                onHidePreview={props.onHidePreview}
              />
            </div>
          </div>
          <div className="chart-editor-label">{"Dimensions"}</div>
          <DimensionSelectorsContainerParent
            chartId={props.chartId}
            chartType={props.chartType}
            dataSource={table}
            multiSourceIndex={index}
            selectors={props.dimensions}
            type="dimensions"
          />
          <div className="chart-editor-label">{"Measures"}</div>
          <MeasureSelectorsContainerParent
            chartId={props.chartId}
            dataSource={table}
            multiSourceIndex={index}
            selectors={props.measures}
            type="measures"
          />
          <PreFilterComponent chartId={props.chartId} dataSource={table} />
        </div>
      )
    }))

  return (
    <div className="vega-data-selection-accordion-wrapper">
      <Accordion
        contents={multiSourceSelectors}
        CTALabel={"+ Add Layer"}
        CTAtestid={"add-data-source-button"}
        currentlySelectedFold={props.selectedMultiSourcePanel}
        onCTAClick={props.onAddMultiSource}
        shouldShowCTA={props.shouldShowAddNewDataSourceButton}
        testid="multi-source-accordion"
      />
    </div>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MultiSourceSelectors)
