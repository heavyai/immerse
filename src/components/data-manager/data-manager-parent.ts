// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import {
  setTablePickerSearchVal,
  getDataSourcesList
} from "actions/tables-action-creators"
import DataManager from "./data-manager"

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
  updateSearchVal: (searchVal: string) => {
    dispatch(setTablePickerSearchVal(searchVal))
  },
  getDataSourcesList: () => dispatch(getDataSourcesList())
})

export default connect(mapStateToProps, mapDispatchToProps)(DataManager)
