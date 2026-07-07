// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import {
  setTablePickerSearchVal,
  selectPreviewTable,
  resetPreviewDataSource,
  getDataSourcesList
} from "actions/tables-action-creators"
import TablePicker from "components/table-picker/table-picker"

export const mapStateToProps = ({
  connection: {
    privileges: { createTable },
    isDemo
  },
  tables
}) => ({
  canCreateTable: createTable,
  tables,
  isDemo
})

export const mapDispatchToProps = (dispatch) => ({
  updateSearchVal: (searchVal) => {
    dispatch(setTablePickerSearchVal(searchVal))
  },
  selectPreviewTable: (index, name) => {
    dispatch(selectPreviewTable(index, name))
  },
  resetPreviewTable: () => dispatch(resetPreviewDataSource()),
  getDataSourcesList: () => dispatch(getDataSourcesList())
})

export default connect(mapStateToProps, mapDispatchToProps)(TablePicker)
