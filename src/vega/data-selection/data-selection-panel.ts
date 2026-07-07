// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import { bindActionCreators } from "redux"

import {
  setSelectedDataSelection,
  clearTable
} from "vega/actions/data-selection-action-creators"
import {
  addDataSelection,
  removeDataSelection,
  selectTable
} from "vega/actions/data-selection-thunks"

import DataSelectionPanelComponent from "./data-selection-panel-component"

export function mapStateToProps(state) {
  return {
    columnMetadata: state.dashboard.dataSources
  }
}

export function mapDispatchToProps(dispatch, { chartId }) {
  return {
    actions: {
      ...bindActionCreators(
        {
          addDataSelection,
          removeDataSelection,
          setSelectedDataSelection
        },
        dispatch
      ),
      onSelectTable: (table: string, layerId: string) => {
        dispatch(selectTable(chartId, layerId, table))
      },
      onClearTable: (layerId: string) => {
        dispatch(clearTable(chartId, layerId))
      }
    }
  }
}

export const options = {
  pure: true
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  options
)(DataSelectionPanelComponent)
