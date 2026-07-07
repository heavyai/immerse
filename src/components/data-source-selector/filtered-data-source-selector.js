// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { compose, withState } from "recompose"
import React from "react"
import PropTypes from "prop-types"
import {
  BaseDataSourceSelector,
  BaseDataSourceSelectorPropTypes
} from "./base-data-source-selector"
import { connect } from "react-redux"
import { getTablesWithMeta } from "actions/tables-action-creators"

export function mapStateToProps(
  { tables: { listWithMeta, loading, loaded } },
  ownProps
) {
  const filteredList = listWithMeta.filter((a) =>
    ownProps.dataSourceFilterFunc(a)
  )
  return {
    tables: filteredList.map((table) => ({
      value: table.name, // TODO(adb): deprecate
      label: table.name
    })),
    loadingTables: loading,
    loadedTables: loaded
  }
}

export function mapDispatchToProps(dispatch) {
  return {
    getTables() {
      dispatch(getTablesWithMeta())
    }
  }
}

export const FilteredDataSourceSelector = (props) => (
  <BaseDataSourceSelector
    dataSource={props.dataSource}
    getTables={props.getTables}
    onClickOutside={props.onClickOutside}
    onDropdownClose={props.onDropdownClose}
    onHidePreview={props.onHidePreview}
    onHoverPreview={props.onHoverPreview}
    onSelect={props.onSelect}
    tables={props.tables}
    loadingTables={props.loadingTables}
    loadedTables={props.loadedTables}
  />
)

FilteredDataSourceSelector.propTypes = {
  ...BaseDataSourceSelectorPropTypes,
  dataSourceFilterFunc: PropTypes.func.isRequired
}

export default compose(
  withState("isEditing", "setIsEditing", false),
  connect(mapStateToProps, mapDispatchToProps)
)(FilteredDataSourceSelector)
